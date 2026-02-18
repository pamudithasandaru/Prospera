const admin = require('firebase-admin');

let db = null;
let isFirestoreEnabled = false;

(() => {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  
  try {
    let serviceAccount;

    if (b64) {
      // Decode base64 environment variable
      const json = Buffer.from(b64, 'base64').toString('utf8');
      serviceAccount = JSON.parse(json);
      console.log('Firestore: Using FIREBASE_SERVICE_ACCOUNT_B64 environment variable.');
    } else {
      // Fallback: Try to load from local file
      const path = require('path');
      const fs = require('fs');
      
      const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      const defaultPath = path.resolve(__dirname, '../../service-account.json');
      const rootDir = path.resolve(__dirname, '../../');
      
      let serviceAccountPath = null;

      if (envPath) {
        // If it's a relative path, resolve it from the project root
        const resolvedEnvPath = path.isAbsolute(envPath) ? envPath : path.resolve(rootDir, envPath);
        if (fs.existsSync(resolvedEnvPath)) {
          serviceAccountPath = resolvedEnvPath;
        }
      } 
      
      if (!serviceAccountPath && fs.existsSync(defaultPath)) {
        serviceAccountPath = defaultPath;
      } 
      
      if (!serviceAccountPath) {
        // Search for any file matching the firebase-adminsdk pattern in root
        const files = fs.readdirSync(rootDir);
        const adminSdkFile = files.find(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));
        if (adminSdkFile) {
          serviceAccountPath = path.join(rootDir, adminSdkFile);
        }
      }
      
      if (serviceAccountPath) {
        serviceAccount = require(serviceAccountPath);
        console.log(`Firestore: Using service account file: ${path.basename(serviceAccountPath)}`);
      } else {
        console.warn('Firestore Warning: No service account credentials found.');
        console.warn('Set FIREBASE_SERVICE_ACCOUNT_B64 or add a service account JSON file to the root.');
        console.warn('Firestore is disabled. The application will use mock data.');
        return;
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      db = admin.firestore();
      isFirestoreEnabled = true;
      console.log('Firestore initialized successfully.');
    }
  } catch (err) {
    console.error('Failed to initialize Firestore:', err.message);
    if (err.message.includes('JSON')) {
        console.error('Error: Invalid JSON format in service account credentials.');
    }
  }
})();

module.exports = {
  admin,
  db,
  isFirestoreEnabled,
};
