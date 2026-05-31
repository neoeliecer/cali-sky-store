// Serverless function to manage clients in Vercel Redis KV
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
    sources: ["Finca Raíz", "Facebook Marketplace", "Metro Cuadrado", "Mercado Libre"],
    favorites: []
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
    sources: ["Finca Raíz", "Facebook Marketplace", "Metro Cuadrado", "Mercado Libre"],
    favorites: []
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Retrieve credentials injected by Vercel Integration
  const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.warn("Redis credentials not found. Falling back to in-memory/static.");
    return res.status(200).json(DEFAULT_CLIENTS);
  }

  try {
    // --- GET CLIENTS ---
    if (req.method === 'GET') {
      const redisRes = await fetch(`${KV_REST_API_URL}/get/clients`, {
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
      });
      const data = await redisRes.json();
      
      let clients = [];
      if (data.result) {
        clients = JSON.parse(data.result);
      } else {
        // Preload default clients on first run
        clients = DEFAULT_CLIENTS;
        await fetch(`${KV_REST_API_URL}/set/clients`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
          body: JSON.stringify(JSON.stringify(clients)) // Redis expects stringified payload
        });
      }
      return res.status(200).json(clients);
    }

    // --- SAVE/POST CLIENTS ---
    if (req.method === 'POST') {
      const clients = req.body;
      if (!clients || !Array.isArray(clients)) {
        return res.status(400).json({ error: "Invalid client list array format" });
      }

      // Fetch old clients from Redis to check for new creations
      let oldClients = [];
      try {
        const redisRes = await fetch(`${KV_REST_API_URL}/get/clients`, {
          headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
        });
        const data = await redisRes.json();
        if (data.result) {
          oldClients = JSON.parse(data.result);
        }
      } catch (dbErr) {
        console.error("Error reading clients before save:", dbErr.message);
      }

      // Check for new clients to send a Welcome Email using Brevo
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      if (BREVO_API_KEY && oldClients.length > 0) {
        try {
          const newClients = clients.filter(nc => !oldClients.some(oc => oc.email.toLowerCase() === nc.email.toLowerCase()));
          const axios = require('axios'); // Load axios for Brevo SMTP email request
          
          for (const newC of newClients) {
            console.log(`[WELCOME-EMAIL] Detectado nuevo cliente: ${newC.name} (${newC.email}). Enviando correo de bienvenida...`);
            
            const welcomeData = {
              sender: { name: "Cali Sky Stores", email: "advisory@caliskystores.com" },
              to: [{ email: newC.email, name: newC.name }],
              subject: `¡Bienvenido a Cali Sky Stores, ${newC.name}! | Tu Portal Premium Activo`,
              htmlContent: `
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #020206; color: #ffffff; padding: 20px; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #090915; padding: 30px; border: 1px solid #9c27b0; border-radius: 8px; box-shadow: 0 0 15px rgba(156, 39, 176, 0.2);">
                      <div style="text-align: center; margin-bottom: 25px;">
                        <h1 style="color: #00f3ff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Cali Sky Stores</h1>
                        <span style="color: #f9a825; font-size: 12px; font-weight: bold; text-transform: uppercase;">Servicio de Asesoría Inmobiliaria VIP</span>
                      </div>
                      
                      <h2 style="color: #ffffff; border-bottom: 1px solid #9c27b0; padding-bottom: 10px; font-size: 18px;">¡Bienvenido al Círculo Exclusivo, ${newC.name}!</h2>
                      
                      <p style="color: #cccccc;">Es un placer darte la bienvenida a <strong>Cali Sky Stores</strong>. Tu cuenta de asesoría inmobiliaria de alta gama ha sido creada con éxito en nuestra plataforma.</p>
                      
                      <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h4 style="color: #00f3ff; margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px;">Tus Criterios de Búsqueda Premium:</h4>
                        <ul style="color: #dddddd; margin: 0; padding-left: 20px; font-size: 13px;">
                          <li><strong>Tipo de Inmueble:</strong> ${newC.type.charAt(0).toUpperCase() + newC.type.slice(1)}</li>
                          <li><strong>Operación:</strong> ${newC.deal || "Compra"}</li>
                          <li><strong>Zonas de Interés:</strong> ${newC.zone ? newC.zone.join(", ") : "Cali"}</li>
                          <li><strong>Presupuesto Máximo:</strong> ${newC.maxPrice ? newC.maxPrice.toLocaleString() : "Sin límite"} COP</li>
                          <li><strong>Exigencias:</strong> ${newC.beds}+ Habitaciones y ${newC.baths || 1}+ Baños</li>
                        </ul>
                      </div>

                      <div style="background-color: rgba(156, 39, 176, 0.08); border: 1px solid #9c27b0; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                        <h4 style="color: #f9a825; margin: 0 0 8px 0; font-size: 13px;">TUS CREDENCIALES DE ACCESO PRIVADO:</h4>
                        <p style="color: #ffffff; margin: 4px 0; font-size: 14px;"><strong>Usuario (Correo):</strong> <code style="color: #00f3ff;">${newC.email}</code></p>
                        <p style="color: #ffffff; margin: 4px 0; font-size: 14px;"><strong>Contraseña Temporal:</strong> <code style="color: #00f3ff;">${newC.password || "calisky123"}</code></p>
                      </div>

                      <p style="color: #cccccc; font-size: 13px;">Nuestro rastreador autónomo de inteligencia artificial <strong>(Apify Cloud + Groq Llama-3-70B)</strong> ya se encuentra barriendo el mercado inmobiliario de Cali todas las noches para cazar y desbloquear oportunidades secretas antes que nadie en tu panel.</p>
                      
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="https://cali-sky-store-neoeliecercolombia-gmailcoms-projects.vercel.app" style="display: inline-block; background-color: #9c27b0; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; box-shadow: 0 0 10px rgba(156, 39, 176, 0.4);">Acceder a mi Portal Privado</a>
                      </div>
                      
                      <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 25px 0;">
                      <p style="color: #888888; font-size: 11px; text-align: center; margin: 0;">Cali Sky Stores - High-End Real Estate Automation. Todos los derechos reservados.</p>
                    </div>
                  </body>
                </html>
              `
            };

            await axios.post(
              'https://api.brevo.com/v3/smtp/email',
              welcomeData,
              {
                headers: {
                  'api-key': BREVO_API_KEY,
                  'Content-Type': 'application/json'
                }
              }
            ).catch(err => console.error("[WELCOME-EMAIL] Error al despachar bienvenida:", err.message));
          }
        } catch (welcomeErr) {
          console.error("Welcome email system error:", welcomeErr.message);
        }
      }

      await fetch(`${KV_REST_API_URL}/set/clients`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
        body: JSON.stringify(JSON.stringify(clients))
      });

      return res.status(200).json({ success: true, message: "Clients database updated successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("Database connection error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
