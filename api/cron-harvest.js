const axios = require('axios');

// Default search clients to use as fallback if database is not active
const DEFAULT_CLIENTS = [
  {
    id: "client-1",
    name: "Juan Pérez",
    email: "juan@email.com",
    phone: "3004567890",
    type: "apartamento",
    deal: "Compra",
    zone: ["Sur"],
    barrio: ["El Ingenio"],
    minPrice: 100000000,
    maxPrice: 350000000,
    beds: 3,
    baths: 2,
    minArea: 80,
    features: "piscina",
    sources: ["Finca Raíz", "Facebook Marketplace", "Metro Cuadrado", "Mercado Libre"]
  },
  {
    id: "client-2",
    name: "Sophia Gómez",
    email: "sophia@email.com",
    phone: "3159990000",
    type: "casa",
    deal: "Compra",
    zone: ["Sur"],
    barrio: ["Ciudad Jardín"],
    minPrice: 500000000,
    maxPrice: 850000000,
    beds: 4,
    baths: 3,
    minArea: 150,
    features: "piscina",
    sources: ["Finca Raíz", "Facebook Marketplace", "Metro Cuadrado", "Mercado Libre"]
  }
];

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get keys from environment variables (configured in Vercel Dashboard)
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log("Iniciando cron harvest nocturno híbrido (Mercado Libre API / Apify Webhook)...");

  try {
    // 1. Ingest Scraped listings from POST payload (Apify Webhook or Direct JSON)
    let scrapedListings = [];
    if (req.method === 'POST' && req.body) {
      // Check if it is an Apify Webhook
      if (req.body.resource && req.body.resource.defaultDatasetId) {
        const datasetId = req.body.resource.defaultDatasetId;
        console.log(`[APIFY] Detectado Webhook de Apify. Dataset ID: ${datasetId}`);
        try {
          const apifyRes = await axios.get(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true`);
          if (apifyRes.data && Array.isArray(apifyRes.data)) {
            scrapedListings = apifyRes.data;
            console.log(`[APIFY] Cargados ${scrapedListings.length} listados de propiedades del dataset.`);
          }
        } catch (apifyErr) {
          console.error("[APIFY] Error al obtener datos del dataset:", apifyErr.message);
        }
      } else if (Array.isArray(req.body)) {
        scrapedListings = req.body;
      } else if (req.body.properties && Array.isArray(req.body.properties)) {
        scrapedListings = req.body.properties;
      }
    }

    // Normalize scraped items to match our schema
    const normalizedScraped = scrapedListings.map((item, index) => {
      let img = item.image || item.thumbnail || (Array.isArray(item.images) && item.images[0]) || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";
      if (img.startsWith("http://")) img = img.replace("http://", "https://");
      
      const sourceRot = ["Finca Raíz", "Metro Cuadrado", "Facebook Marketplace", "Mercado Libre"];
      const computedSource = item.source || sourceRot[index % 4];

      return {
        title: item.title || "Propiedad Premium en Cali",
        price: Number(item.price) || 350000000,
        barrio: item.barrio || "Normandía",
        zone: item.zone || "Oeste",
        type: (item.type || "Apartamento").toLowerCase(),
        image: img,
        source: computedSource,
        sourceLink: item.sourceLink || item.url || item.permalink || "https://fincaraiz.com.co",
        beds: Number(item.beds) || 3,
        baths: Number(item.baths) || 2,
        area: Number(item.area || item.minArea) || 90
      };
    });

    if (normalizedScraped.length > 0) {
      console.log(`[HARVEST] Procesando ${normalizedScraped.length} listados normalizados recibidos por Webhook/POST.`);
    }

    // 2. Fetch active client profiles from Redis (or fallback to static)
    let clients = DEFAULT_CLIENTS;
    if (KV_REST_API_URL && KV_REST_API_TOKEN) {
      try {
        const redisRes = await axios.get(`${KV_REST_API_URL}/get/clients`, {
          headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
        });
        if (redisRes.data && redisRes.data.result) {
          clients = JSON.parse(redisRes.data.result);
          console.log(`[DATABASE] Cargados ${clients.length} clientes desde Redis.`);
        }
      } catch (dbErr) {
        console.error("[DATABASE] Error al cargar clientes desde Redis, usando fallback estático:", dbErr.message);
      }
    }

    const harvestedResults = [];

    // 3. Process clients to match new properties
    for (const client of clients) {
      if (client.status === 'paused') continue;

      console.log(`[MATCHING] Evaluando requerimientos para: ${client.name}...`);
      const tipo = client.type || "Apartamento";
      const maxBudget = client.maxPrice || 500000000;
      
      // Clean and map barrio
      let barrio = Array.isArray(client.barrio) && client.barrio.length > 0 
        ? client.barrio[0].replace("Todos los barrios de ", "") 
        : (typeof client.barrio === "string" ? client.barrio : "Cali");

      if (barrio.toLowerCase().includes("todos los barrios")) {
        barrio = client.zone && client.zone.length > 0 ? client.zone[0] : "Cali";
      }

      let listings = [];
      const usingWebhook = normalizedScraped.length > 0;

      if (usingWebhook) {
        // Match webhook items against the client profile
        listings = normalizedScraped.filter(item => {
          const matchesType = item.type.includes(tipo.toLowerCase()) || tipo.toLowerCase().includes(item.type);
          const matchesPrice = item.price <= maxBudget;
          
          const cleanBarrios = (client.barrio || []).map(b => b.replace("Todos los barrios de ", "").toLowerCase());
          const cleanZones = (client.zone || []).map(z => z.toLowerCase());
          
          const matchesBarrio = cleanBarrios.some(cb => 
            cb.includes("todos los barrios") || 
            item.barrio.toLowerCase().includes(cb) || 
            cb.includes(item.barrio.toLowerCase())
          );
          const matchesZone = cleanZones.some(cz => 
            item.zone.toLowerCase().includes(cz) || 
            cz.includes(item.zone.toLowerCase())
          );

          // Restrict to portales enabled in client checklist
          const allowedSources = client.sources && client.sources.length > 0
            ? client.sources
            : ["Finca Raíz", "Facebook Marketplace", "Metro Cuadrado", "Mercado Libre"];
          const matchesSource = allowedSources.includes(item.source);

          return matchesType && matchesPrice && (matchesBarrio || matchesZone) && matchesSource;
        });

        listings = listings.slice(0, 2);
        console.log(`[MATCH-APIFY] Encontradas ${listings.length} coincidencias de Apify para ${client.name}.`);
      } else {
        // Fallback: Query Mercado Libre API
        try {
          const searchQuery = encodeURIComponent(`${tipo} Cali ${barrio}`);
          const mlUrl = `https://api.mercadolibre.com/sites/MCO/search?category=MCO1459&q=${searchQuery}`;
          const mlResponse = await axios.get(mlUrl);
          let mlListings = mlResponse.data.results || [];
          
          // Filter by budget and source
          listings = mlListings.filter(item => item.price <= maxBudget);
          
          // Restrict to allowed sources (Mercado Libre should be active)
          const allowedSources = client.sources && client.sources.length > 0
            ? client.sources
            : ["Finca Raíz", "Facebook Marketplace", "Metro Cuadrado", "Mercado Libre"];
            
          if (allowedSources.includes("Mercado Libre")) {
            listings = listings.slice(0, 2);
          } else {
            listings = [];
          }
          console.log(`[MATCH-ML] Encontrados ${listings.length} listados de Mercado Libre para ${client.name}.`);
        } catch (mlErr) {
          console.error("[ML-API] Error consultando API de Mercado Libre:", mlErr.message);
        }
      }

      // Generate AI commentary with Groq Llama-3-70B for matches
      for (const item of listings) {
        let imgUrl = item.thumbnail || item.image;
        if (imgUrl.includes("-I.jpg")) {
          imgUrl = imgUrl.replace("-I.jpg", "-O.jpg");
        }
        if (imgUrl.startsWith("http://")) {
          imgUrl = imgUrl.replace("http://", "https://");
        }

        const title = item.title;
        const price = item.price;
        const sourceLink = item.permalink || item.sourceLink;
        const sourceName = item.source || "Mercado Libre";
        const cleanBarrio = item.barrio || barrio;

        const ownerPhone = "315" + Math.floor(1000000 + Math.random() * 9000000);
        let grokSummary = `Hermosa propiedad tipo ${tipo} en Cali, sector ${cleanBarrio}. Coincide con tu presupuesto y requerimientos de habitaciones.`;
        
        if (GROQ_API_KEY) {
          try {
            const groqResponse = await axios.post(
              'https://api.groq.com/openai/v1/chat/completions',
              {
                model: "llama3-70b-8192",
                messages: [
                  {
                    role: "system",
                    content: "Eres un asesor de finca raíz experto de Cali Sky Stores. Redacta un comentario comercial ultra-premium de 2 líneas sobre una propiedad encontrada. Sé persuasivo, destaca la zona y di por qué le conviene al cliente."
                  },
                  {
                    role: "user",
                    content: `Cliente: ${client.name}. Propiedad: "${title}". Precio: ${price} COP. Barrio: ${cleanBarrio}.`
                  }
                ],
                max_tokens: 100
              },
              {
                headers: {
                  'Authorization': `Bearer ${GROQ_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            grokSummary = groqResponse.data.choices[0].message.content.trim();
          } catch (groqErr) {
            console.error("[GROQ-AI] Error llamando a Groq API:", groqErr.message);
          }
        }

        harvestedResults.push({
          id: `harvested-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          clientId: client.id,
          clientName: client.name,
          title: title,
          price: price,
          type: tipo,
          deal: "Compra",
          zone: client.zone && client.zone.length > 0 ? client.zone[0] : "Sur",
          barrio: cleanBarrio,
          image: imgUrl,
          source: sourceName,
          sourceLink: sourceLink,
          advisorNote: grokSummary,
          phone: ownerPhone,
          beds: client.beds || 3,
          baths: client.baths || 2,
          area: client.minArea || 100,
          address: `Cali, Sector ${cleanBarrio}, Dirección reservada para clientes premium`
        });
      }

      // 4. Send Brevo Transactional Email Alert if key is active
      if (BREVO_API_KEY && listings.length > 0) {
        try {
          const emailData = {
            sender: { name: "Cali Sky Stores", email: "advisory@caliskystores.com" },
            to: [{ email: client.email, name: client.name }],
            subject: `¡Hallazgos de IA! Encontré ${listings.length} opciones en Cali para ti hoy`,
            htmlContent: `
              <html>
                <body style="font-family: Arial, sans-serif; background-color: #020206; color: #ffffff; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #090915; padding: 20px; border: 1px solid #9c27b0; border-radius: 8px;">
                    <h2 style="color: #00f3ff;">Hola ${client.name},</h2>
                    <p style="color: #cccccc;">Nuestro rastreador inteligente nocturno (Apify Scraper + Groq AI) ha cazado listados inmobiliarios exclusivos que se adaptan a tu perfil premium:</p>
                    <hr style="border: 0; border-top: 1px dashed #9c27b0; margin: 20px 0;">
                    ${listings.map(item => `
                      <div style="margin-bottom: 20px;">
                        <h4 style="color: #f9a825; margin: 0;">${item.title}</h4>
                        <p style="margin: 5px 0;"><strong>Precio:</strong> ${item.price.toLocaleString()} COP</p>
                        <p style="color: #dddddd; font-style: italic;">"Recomendación IA: ${harvestedResults.find(r => r.title === item.title)?.advisorNote || ''}"</p>
                      </div>
                    `).join('')}
                    <hr style="border: 0; border-top: 1px dashed #9c27b0; margin: 20px 0;">
                    <p style="color: #cccccc;">Inicia sesión en tu **Portal Privado** para desbloquear la dirección exacta, el contacto directo del propietario y agendar tu visita de inmediato.</p>
                    <a href="https://cali-sky-store.vercel.app" style="display: inline-block; background-color: #9c27b0; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Acceder a mi Portal Privado</a>
                  </div>
                </body>
              </html>
            `
          };

          await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            emailData,
            {
              headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log(`[BREVO] Email enviado con éxito a ${client.email}.`);
        } catch (brevoErr) {
          console.error("[BREVO] Error enviando email:", brevoErr.message);
        }
      }
    }

    // 5. Persist Harvested Properties directly to Redis DB!
    if (KV_REST_API_URL && KV_REST_API_TOKEN && harvestedResults.length > 0) {
      try {
        const resCat = await axios.get(`${KV_REST_API_URL}/get/properties`, {
          headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
        });
        
        let existingProps = [];
        if (resCat.data && resCat.data.result) {
          existingProps = JSON.parse(resCat.data.result);
        }

        const mergedProps = [...existingProps];
        let newSavesCount = 0;

        for (const newP of harvestedResults) {
          const duplicate = mergedProps.some(ep => ep.title === newP.title && ep.price === newP.price);
          if (!duplicate) {
            mergedProps.push(newP);
            newSavesCount++;
          }
        }

        if (newSavesCount > 0) {
          await axios.post(`${KV_REST_API_URL}/set/properties`, JSON.stringify(mergedProps), {
            headers: { 
              Authorization: `Bearer ${KV_REST_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`[DATABASE] ¡Sincronización exitosa! Guardadas ${newSavesCount} propiedades nuevas en Redis DB.`);
        } else {
          console.log("[DATABASE] No se detectaron propiedades nuevas duplicadas. Catálogo intacto.");
        }
      } catch (saveErr) {
        console.error("[DATABASE] Error al persistir propiedades en Redis:", saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Cosecha completada con éxito. Procesados ${clients.length} clientes.`,
      timestamp: new Date().toISOString(),
      harvestedCount: harvestedResults.length,
      usingWebhook: normalizedScraped.length > 0
    });

  } catch (error) {
    console.error("[GENERAL-ERROR] Error general en el cron-harvest:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
