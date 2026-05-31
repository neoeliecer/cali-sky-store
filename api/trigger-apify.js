const axios = require('axios');

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
  if (!APIFY_API_TOKEN) {
    return res.status(400).json({ 
      error: "Clave APIFY_API_TOKEN no configurada en Vercel. Por favor agrégala en los ajustes de variables de entorno de Vercel para habilitar el control remoto directo de tus robots." 
    });
  }

  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Parámetro 'tasks' requerido y debe ser un array." });
  }

  // Apify account username (used to construct task identifiers)
  const username = process.env.APIFY_USERNAME || "simple_jack";
  
  // Mapping between frontend task handles and real Apify saved task slugs
  const taskMapping = {
    "finca-raiz-ventas": `${username}~finca-raiz-ventas-cali`,
    "finca-raiz-arriendos": `${username}~finca-raiz-arriendos-cali`,
    "facebook-ventas": `${username}~facebook-marketplace-ventas`,
    "facebook-arriendos": `${username}~facebook-marketplace-alquiler`
  };

  const triggered = [];
  const errors = [];

  for (const t of tasks) {
    const taskId = taskMapping[t];
    if (!taskId) {
      errors.push({ task: t, error: "Identificador de tarea no soportado." });
      continue;
    }

    try {
      console.log(`[APIFY-API] Lanzando tarea en la nube: ${taskId}...`);
      const apifyUrl = `https://api.apify.com/v2/actor-tasks/${taskId}/runs?token=${APIFY_API_TOKEN}`;
      const apifyRes = await axios.post(apifyUrl);
      
      if (apifyRes.data && apifyRes.data.data) {
        triggered.push({
          task: t,
          runId: apifyRes.data.data.id,
          status: apifyRes.data.data.status
        });
        console.log(`[APIFY-API] Tarea ${taskId} lanzada con éxito. Run ID: ${apifyRes.data.data.id}`);
      }
    } catch (err) {
      const errMsg = err.response && err.response.data && err.response.data.error 
        ? err.response.data.error.message 
        : err.message;
      console.error(`[APIFY-API] Error al lanzar tarea ${taskId}:`, errMsg);
      errors.push({
        task: t,
        error: errMsg
      });
    }
  }

  return res.status(200).json({
    success: triggered.length > 0,
    triggered,
    errors
  });
};
