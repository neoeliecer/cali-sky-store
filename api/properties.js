// Serverless function to manage dynamic properties catalog in Vercel Redis KV
const axios = require('axios');

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
      const redisRes = await axios.get(`${KV_REST_API_URL}/get/properties`, {
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
      });
      const data = redisRes.data;
      
      let properties = [];
      if (data && data.result) {
        try {
          properties = JSON.parse(data.result);
        } catch (parseErr) {
          console.error("Error parsing properties from Redis:", parseErr.message);
          properties = [];
        }
      }
      return res.status(200).json(properties);
    }

    // --- SAVE/POST PROPERTIES ---
    if (req.method === 'POST') {
      let properties = req.body;
      
      // Defensive parsing for string request bodies
      if (typeof properties === 'string') {
        try {
          properties = JSON.parse(properties);
        } catch (e) {
          return res.status(400).json({ error: "Invalid JSON format in body" });
        }
      }

      if (!properties || !Array.isArray(properties)) {
        return res.status(400).json({ error: "Invalid properties array format" });
      }

      await axios.post(`${KV_REST_API_URL}/set/properties`, JSON.stringify(JSON.stringify(properties)), {
        headers: { 
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      return res.status(200).json({ success: true, message: "Properties catalog database updated successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("Properties database connection error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
