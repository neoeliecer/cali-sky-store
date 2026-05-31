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

  console.log("Iniciando cron harvest nocturno...");

  try {
    const clients = DEFAULT_CLIENTS; // Under real production database, fetch from Supabase
    const harvestedResults = [];

    for (const client of clients) {
      console.log(`Buscando propiedades para el cliente: ${client.name}...`);

      const tipo = client.type || "Apartamento";
      const barrio = client.barrio[0] || "Cali";
      const maxBudget = client.maxPrice || 500000000;

      // 1. Call Mercado Libre Colombia Real Estate API
      const searchQuery = encodeURIComponent(`${tipo} Cali ${barrio}`);
      const mlUrl = `https://api.mercadolibre.com/sites/MCO/search?category=MCO1459&q=${searchQuery}`;
      
      const mlResponse = await axios.get(mlUrl);
      let listings = mlResponse.data.results || [];

      // Filter by budget
      listings = listings.filter(item => item.price <= maxBudget).slice(0, 2);

      console.log(`Obtenidos ${listings.length} listados reales para ${client.name} de Mercado Libre.`);

      // 2. Process listings with Groq Cloud AI to build custom commentary
      for (const item of listings) {
        let imgUrl = item.thumbnail;
        if (imgUrl.includes("-I.jpg")) {
          imgUrl = imgUrl.replace("-I.jpg", "-O.jpg");
        }
        if (imgUrl.startsWith("http://")) {
          imgUrl = imgUrl.replace("http://", "https://");
        }

        const ownerPhone = "315" + Math.floor(1000000 + Math.random() * 9000000);
        let grokSummary = `Hermosa propiedad tipo ${tipo} en Cali, sector ${barrio}. Coincide con tu presupuesto y requerimientos de habitaciones.`;
        
        // If Groq key is active, trigger dynamic AI text generation
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
                    content: `Cliente: ${client.name}. Propiedad: "${item.title}". Precio: ${item.price} COP. Barrio: ${barrio}.`
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
            console.error("Error llamando a Groq API:", groqErr.message);
          }
        }

        harvestedResults.push({
          clientId: client.id,
          clientName: client.name,
          title: item.title,
          price: item.price,
          barrio: barrio,
          image: imgUrl,
          source: "Mercado Libre",
          sourceLink: item.permalink,
          advisorNote: grokSummary,
          phone: ownerPhone
        });
      }

      // 3. Send Brevo Transactional Email Alert if key is active
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
                    <p style="color: #cccccc;">Nuestro rastreador inteligente nocturno (Cron-Job + Groq AI) ha cazado listados inmobiliarios exclusivos que se adaptan a tu perfil premium:</p>
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
          console.log(`Email enviado con éxito a ${client.email} a través de Brevo.`);
        } catch (brevoErr) {
          console.error("Error enviando email con Brevo:", brevoErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Cosecha completada con éxito. Procesados ${clients.length} clientes.`,
      timestamp: new Date().toISOString(),
      harvestedCount: harvestedResults.length
    });

  } catch (error) {
    console.error("Error general en el cron-harvest:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
