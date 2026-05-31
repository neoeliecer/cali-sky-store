// Serverless function to manage inquiries / leads in Vercel Redis KV
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
    // --- GET INQUIRIES ---
    if (req.method === 'GET') {
      const redisRes = await fetch(`${KV_REST_API_URL}/get/inquiries`, {
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
      });
      const data = await redisRes.json();
      
      let inquiries = [];
      if (data.result) {
        inquiries = JSON.parse(data.result);
      }
      return res.status(200).json(inquiries);
    }

    // --- SAVE/POST INQUIRIES ---
    if (req.method === 'POST') {
      const inquiries = req.body;
      if (!inquiries || !Array.isArray(inquiries)) {
        return res.status(400).json({ error: "Invalid inquiries array format" });
      }

      await fetch(`${KV_REST_API_URL}/set/inquiries`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
        body: JSON.stringify(JSON.stringify(inquiries))
      });

      return res.status(200).json({ success: true, message: "Inquiries leads database updated successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("Inquiries database connection error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
