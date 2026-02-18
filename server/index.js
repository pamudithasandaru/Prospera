const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { isFirestoreEnabled } = require('./services/firestore');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dns = require('dns');

const authRoutes = require('./routes/auth');
const socialRoutes = require('./routes/social');
const weatherRoutes = require('./routes/weather');
const supportRoutes = require('./routes/support');
const marketRoutes = require('./routes/market');
const marketplaceRoutes = require('./routes/marketplace');
const governmentRoutes = require('./routes/government');
const learningRoutes = require('./routes/learning');
const fintechRoutes = require('./routes/fintech');
const aiRoutes = require('./routes/ai');
const farmRoutes = require('./routes/farm');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI;

// Force reliable public DNS for SRV lookups (avoids local DNS issues)
dns.setServers(['8.8.8.8', '1.1.1.1']);

app.use(helmet());
app.use(cors({ origin: [CLIENT_URL, 'http://localhost:3001'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

if (!isFirestoreEnabled) {
  console.warn('Firestore is disabled. Check your service account credentials.');
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/fintech', fintechRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/farm', farmRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
