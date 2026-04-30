const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { isFirestoreEnabled } = require('./services/firestore');

const http = require('http');
const express = require('express');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dns = require('dns');

// ── Routes ────────────────────────────────────────────────────────────────────
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
const messagesRoutes = require('./routes/messages');
const storiesRoutes = require('./routes/stories');
const notificationsRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');

const { predictPlantDisease } = require('./controllers/predictionController');
const upload = require('./middleware/upload');
const { authenticate } = require('./middleware/auth');
const { initSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const CLIENT_URL_DEV = 'http://localhost:3001';

// Force reliable public DNS for SRV lookups (avoids local DNS issues)
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: [CLIENT_URL, CLIENT_URL_DEV],
    credentials: true,
  },
  pingTimeout: 60000,
});
initSocket(io);

// Expose io to routes via req.app.get('io')
app.set('io', io);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// The social feed fires 15+ parallel GETs on mount (posts, stories, groups,
// farmers, notifications, connections, connection-status per user).
// General GET limit is therefore intentionally high; write operations are
// capped tightly via the writeLimiter.
const isDev = process.env.NODE_ENV !== 'production';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 5000 : 2000,  // generous for dev; still protects in prod
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev && req.method === 'GET', // skip GET rate-limit entirely in dev
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 30, // stricter in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// Applied only to POST /social/post and POST /stories (write operations)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 60 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Slow down — too many write operations.' },
});

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Handled separately if needed
}));
app.use(cors({ origin: [CLIENT_URL, CLIENT_URL_DEV], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(generalLimiter);

if (!isFirestoreEnabled) {
  console.warn('⚠️  Firestore is disabled. Check your service account credentials.');
  console.warn('   The application will use in-memory mock data.');
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    firestore: isFirestoreEnabled,
    realtime: true,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
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

// New social media routes
app.use('/api/messages', messagesRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/search', searchRoutes);

// ML prediction
app.post('/api/ml/predict', authenticate, upload.single('file'), predictPlantDisease);
// Write-operation rate limiters (POST only)
app.post('/api/social/post', writeLimiter);
app.post('/api/stories', writeLimiter);

// ── Error Handlers ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`🚀 API server listening on port ${PORT}`);
      console.log(`🔌 Socket.IO ready`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
