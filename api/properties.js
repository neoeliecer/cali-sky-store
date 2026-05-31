// Serverless function to manage dynamic properties catalog in Vercel Redis KV
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
    console.warn("Redis credentials not found. Returning empty array.");
    return res.status(200).json([]);
  }

  try {
    // --- GET PROPERTIES ---
    if (req.method === 'GET') {
      const redisRes = await fetch(`${KV_REST_API_URL}/get/properties`, {
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
      });
      const data = await redisRes.json();
      
      let properties = [];
      if (data.result) {
        properties = JSON.parse(data.result);
      }
      return res.status(200).json(properties);
    }

    // --- SAVE/POST PROPERTIES ---
    if (req.method === 'POST') {
      const properties = req.body;
      if (!properties || !Array.isArray(properties)) {
        return res.status(400).json({ error: "Invalid properties array format" });
      }

      await fetch(`${KV_REST_API_URL}/set/properties`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
        body: JSON.stringify(JSON.stringify(properties))
      });

      return res.status(200).json({ success: true, message: "Properties catalog database updated successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("Properties database connection error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
