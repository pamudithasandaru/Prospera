
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

console.log('Checking for service-account.json at:', serviceAccountPath);

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n❌ service-account.json not found in the project root.');
  console.log('\nTo fix the connection issues:');
  console.log('1. Go to the Firebase Console -> Project Settings -> Service Accounts.');
  console.log('2. Click "Generate new private key".');
  console.log('3. Save the file as "service-account.json" in this directory:', path.resolve(__dirname, '..'));
  console.log('4. Run this script again to generate the environment variable, OR just restart the server (the new code will automatically pick up the file).');
  process.exit(1);
}

const serviceAccount = fs.readFileSync(serviceAccountPath, 'utf8');
try {
    // Validate JSON
    JSON.parse(serviceAccount);
    const b64 = Buffer.from(serviceAccount).toString('base64');
    
    console.log('\n✅ service-account.json found and valid.');
    console.log('\nTo use it in production (hosted), add this to your .env file:');
    console.log('\nFIREBASE_SERVICE_ACCOUNT_B64=' + b64);
    
    console.log('\nFor local development, you don\'t need to do anything else! The server will now automatically use the service-account.json file.');
} catch (e) {
    console.error('❌ Error: service-account.json is not valid JSON.');
}
