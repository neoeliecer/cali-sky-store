const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    const url = 'https://cali-sky-store-neoeliecercolombia-gmailcoms-projects.vercel.app/api/clients';
    
    console.log("Fetching current clients...");
    const clients = await get(url);
    
    console.log("Current clients count:", clients.length);
    
    const amelia = clients.find(c => c.name.toLowerCase() === 'amelia' || c.email.toLowerCase() === 'amelia@gmail.com');
    if (!amelia) {
      console.error("Amelia not found in client database!");
      return;
    }
    
    console.log("Updating Amelia's profile...");
    amelia.zone = ["Sur", "Centro", "Norte"];
    amelia.barrio = ["El Ingenio", "Todos los barrios de Centro", "Todos los barrios de Norte"];
    
    console.log("Sending POST update...");
    const res = await post(url, clients);
    
    console.log("Post status:", res.status);
    console.log("Post response:", res.data);
    console.log("✅ Amelia updated successfully!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
