
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

console.log('--- Firestore Connection Test ---');

let serviceAccount;
const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

try {
  if (b64) {
    console.log('Trying Environment Variable (FIREBASE_SERVICE_ACCOUNT_B64)...');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
    console.log('✅ Environment variable decoded successfully.');
  } else {
    console.log('Environment variable not found. Trying local file...');
    const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
        console.log('Found service-account.json at:', serviceAccountPath);
        serviceAccount = require(serviceAccountPath);
        console.log('✅ Local file loaded successfully.');
    } else {
        console.error('❌ No credentials found (Env var or local file).');
        process.exit(1);
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  console.log('Attempting to list collections...');

  db.listCollections().then(collections => {
    if (collections.length === 0) {
        console.log('✅ Connection Successful! (No collections found in database yet)');
    } else {
        console.log('✅ Connection Successful! Found collections:');
        collections.forEach(col => console.log(' -', col.id));
    }
    process.exit(0);
  }).catch(err => {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  });

} catch (err) {
  console.error('❌ Initialization Error:', err.message);
  process.exit(1);
}
