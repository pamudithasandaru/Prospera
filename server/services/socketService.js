/**
 * socketService.js
 * Manages Socket.IO server: user-socket mapping, room management, JWT auth middleware.
 */
const jwt = require('jsonwebtoken');
const { db, isFirestoreEnabled } = require('./firestore');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// userId -> Set of socketIds (one user can have multiple tabs open)
const userSockets = new Map();

/**
 * Initialize Socket.IO with the HTTP server instance.
 * @param {import('socket.io').Server} io
 */
function initSocket(io) {
  // ── JWT Auth Middleware ──────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: no token'));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      return next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    // Track socket
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    // Join personal room so server can target this user
    socket.join(`user:${userId}`);

    // ── Messaging events ──────────────────────────────────────────────────────

    // Join a conversation room
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Typing indicator
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', { userId, conversationId });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', { userId, conversationId });
    });

    // Read receipt
    socket.on('message:read', ({ conversationId, messageId }) => {
      socket.to(`conv:${conversationId}`).emit('message:read', { userId, conversationId, messageId });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected (${socket.id})`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
    });
  });
}

/**
 * Emit an event to all sockets owned by a specific user.
 * @param {import('socket.io').Server} io
 * @param {string} userId
 * @param {string} event
 * @param {any} data
 */
function emitToUser(io, userId, event, data) {
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Broadcast a message to everyone in a conversation room.
 * @param {import('socket.io').Server} io
 * @param {string} conversationId
 * @param {string} event
 * @param {any} data
 */
function emitToConversation(io, conversationId, event, data) {
  io.to(`conv:${conversationId}`).emit(event, data);
}

module.exports = { initSocket, emitToUser, emitToConversation, userSockets };
