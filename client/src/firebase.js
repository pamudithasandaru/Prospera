import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyB_xdbakMrc5rJvzS7Nj2b3bUK-wnqIud0',
  authDomain: 'prospera-4d75c.firebaseapp.com',
  projectId: 'prospera-4d75c',
  storageBucket: 'prospera-4d75c.firebasestorage.app',
  messagingSenderId: '752851614698',
  appId: '1:752851614698:web:ca95de7a339bf2eb4c9093',
  measurementId: 'G-01JFKHXCR4',
};

// Initialize Firebase app once for the client bundle
const app = initializeApp(firebaseConfig);

// Analytics requires a browser context; guard to avoid issues in tests/SSR
let analytics;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase analytics initialization skipped:', error);
  }
}

export { app, analytics };
