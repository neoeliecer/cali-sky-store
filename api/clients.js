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
