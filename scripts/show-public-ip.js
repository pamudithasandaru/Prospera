const https = require('https');

function getPublicIp(timeout = 4000) {
  return new Promise((resolve) => {
    try {
      const req = https.get('https://api.ipify.org?format=json', { timeout }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.ip);
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

(async () => {
  console.log('Checking public IP...');
  const ip = await getPublicIp();
  if (ip) {
    console.log(`Your public IP: ${ip}`);
    console.log('If you use MongoDB Atlas, add this IP to Network Access (IP whitelist).');
    console.log('Atlas UI: https://cloud.mongodb.com/ -> Network Access -> Add IP Address');
  } else {
    console.log('Could not determine public IP (request timed out).');
    console.log('Open https://whatismyipaddress.com/ or https://api.ipify.org in a browser to see your IP.');
  }
})();
