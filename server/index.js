const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prospera';
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not set in environment. Falling back to local MongoDB at mongodb://127.0.0.1:27017/prospera');
}

mongoose.connect(mongoUri)
.then(() => console.log(`✅ MongoDB Connected Successfully (${mongoUri})`))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farm', require('./routes/farm'));
app.use('/api/market', require('./routes/market'));
app.use('/api/social', require('./routes/social'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/ai-tools', require('./routes/aiTools'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/government', require('./routes/government'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/support', require('./routes/support'));
app.use('/api/fintech', require('./routes/fintech'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Prospera API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Socket.io for real-time features
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Real-time price updates
  socket.on('subscribe-prices', (data) => {
    socket.join('price-updates');
  });

  // Disease alerts
  socket.on('subscribe-alerts', (data) => {
    socket.join(`alerts-${data.region}`);
  });

  // Chat/messaging
  socket.on('send-message', (data) => {
    io.to(data.receiverId).emit('receive-message', data);
  });
});

// Make io accessible to routes
app.set('io', io);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
