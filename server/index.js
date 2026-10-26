const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const http = require('http');
const express = require('express');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const { prisma, connectDb, disconnectDb } = require('./services/prisma');
const { ensureSuperAdminRow } = require('./services/superAdmin');
const { JWT_SECRET } = require('./middleware/auth');

// ── Rate Limiters ─────────────────────────────────────────────────────────────
// Skip rate limiting entirely for localhost during development.
// Rate limiting is a production concern — hammering it in dev causes 429 storms.
const isDev = process.env.NODE_ENV !== 'production';
const skipLocalhost = (req) => {
  const ip = req.ip || req.connection?.remoteAddress || '';
  return isDev && (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1');
};

/**
 * IPv6 clients get a whole /64 each, so limiting a bare address limits
 * nothing — collapse to the prefix the way express-rate-limit's own helper
 * does. IPv4 addresses pass through untouched.
 */
const clientKey = (req) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  if (!ip.includes(':')) return ip;
  return ip.split(':').slice(0, 4).join(':') + '::/64';
};

/**
 * Who this request is spending budget on behalf of.
 *
 * Now that the browse endpoints are open, anonymous traffic needs its own,
 * tighter bucket — otherwise one scraper exhausts the shared per-IP window
 * and takes every signed-in user behind the same NAT down with it. Signed-in
 * callers are keyed by account id instead, which a forged token cannot reach:
 * the signature is checked here, same as in the auth middleware.
 */
const rateLimitSubject = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      return `u:${jwt.verify(header.split(' ')[1], JWT_SECRET).id}`;
    } catch {
      // Falls through to the anonymous bucket — an invalid token buys nothing.
    }
  }
  return `ip:${clientKey(req)}`;
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,                 // 2000 req/window — enough for normal usage + polling
  skip: skipLocalhost,       // no limit at all on localhost in dev
  keyGenerator: rateLimitSubject,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Guests only ever browse, so their ceiling is far lower than a working
// session's. Applied before generalLimiter; signed-in requests skip it.
const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  skip: (req) => skipLocalhost(req) || rateLimitSubject(req).startsWith('u:'),
  keyGenerator: clientKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please sign in or try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,                   // 50 login attempts per 15 min
  skip: skipLocalhost,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 100,                  // 100 writes/min
  skip: skipLocalhost,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many write operations, please slow down.' },
});

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
const adminRoutes = require('./routes/admin');
const chatbotSync = require('./services/chatbotSync');

const { predictPlantDisease } = require('./controllers/predictionController');
const upload = require('./middleware/upload');
const { authenticate } = require('./middleware/auth');
const { initSocket } = require('./services/socketService');

const app = express();
// Behind Render's proxy: trust one hop so req.ip / rate limiting use the real client IP.
app.set('trust proxy', 1);
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const CLIENT_URL_DEV = 'http://localhost:3001';

const allowedOrigins = [...new Set([CLIENT_URL, CLIENT_URL_DEV])];

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
// Stripe signs its webhook over the exact bytes it sent, so this one path
// keeps its raw body. It has to come before express.json(), which would
// otherwise consume the stream.
app.use('/api/marketplace/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use(compression());
app.use(morgan('dev'));
app.use(guestLimiter);
app.use(generalLimiter);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
// Routes reach the server through req.app.get('io').
const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, credentials: true },
});
initSocket(io);
app.set('io', io);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let database = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch {
    database = 'down';
  }

  res.status(database === 'up' ? 200 : 503).json({
    success: database === 'up',
    message: 'API is running',
    database,
    realtime: true,
    timestamp: new Date().toISOString(),
  });
});

// ── Write-operation rate limiters ─────────────────────────────────────────────
// Registered before the routers — mounting them afterwards would mean the
// router had already answered and the limiter never ran.
app.post('/api/social/post', writeLimiter);
app.post('/api/stories', writeLimiter);

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

// Admin panel API (admin role only — enforced inside the router)
app.use('/api/admin', adminRoutes);

// ML prediction
app.post('/api/ml/predict', authenticate, upload.single('file'), predictPlantDisease);

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
    await connectDb();
    await ensureSuperAdminRow(prisma);

    server.listen(PORT, () => {
      console.log(`🚀 API server listening on port ${PORT}`);
      console.log(`🔌 Socket.IO ready`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
      chatbotSync.startAutoSync();
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    await disconnectDb().catch(() => {});
    process.exit(1);
  }
};

// Close the pool cleanly so Neon does not hold the connections open.
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down.`);
  server.close();
  io.close();
  await disconnectDb().catch(() => {});
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
