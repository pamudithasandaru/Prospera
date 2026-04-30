/**
 * server/routes/messages.js
 * REST endpoints for private messaging. Real-time delivery happens via Socket.IO.
 * Supports both Firestore (primary) and in-memory fallback.
 */
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');
const { body, validationResult } = require('express-validator');
const { generateId } = require('../data/sampleData');

const router = express.Router();
const TIMEOUT = 6000;
const withTimeout = (p) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Firestore timeout')), TIMEOUT))]);

// ── In-memory fallback store ──────────────────────────────────────────────────
const memConversations = [];
const memMessages = [];

// ── Helper: get or create a conversation between two users ───────────────────
async function getOrCreateConversation(userId1, userId2) {
  if (isFirestoreEnabled && db) {
    // Find existing
    const snap = await withTimeout(
      db.collection('conversations')
        .where('participants', 'array-contains', userId1)
        .get()
    );
    const existing = snap.docs
      .map((d) => ({ _id: d.id, ...d.data() }))
      .find((c) => c.participants.includes(userId2));
    if (existing) return existing;

    // Create new
    const conv = {
      participants: [userId1, userId2],
      createdAt: new Date(),
      lastMessage: null,
      lastMessageAt: null,
      unreadCounts: { [userId1]: 0, [userId2]: 0 },
    };
    const ref = db.collection('conversations').doc();
    await withTimeout(ref.set(conv));
    return { _id: ref.id, ...conv };
  }

  // In-memory fallback
  const existing = memConversations.find(
    (c) => c.participants.includes(userId1) && c.participants.includes(userId2)
  );
  if (existing) return existing;
  const conv = {
    _id: generateId('conv'),
    participants: [userId1, userId2],
    createdAt: new Date(),
    lastMessage: null,
    lastMessageAt: null,
    unreadCounts: { [userId1]: 0, [userId2]: 0 },
  };
  memConversations.push(conv);
  return conv;
}

// ── GET /api/messages/conversations — list all conversations for current user ─
router.get('/conversations', authenticate, async (req, res) => {
  const userId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('conversations').where('participants', 'array-contains', userId).get()
      );
      const data = snap.docs
        .map((d) => ({ _id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.lastMessageAt?.seconds || a.createdAt?.seconds || 0;
          const bTime = b.lastMessageAt?.seconds || b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Firestore conversations error:', err.message);
    }
  }

  const data = memConversations
    .filter((c) => c.participants.includes(userId))
    .sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
  return res.json({ success: true, data });
});

// ── GET /api/messages/conversation/:userId — get/create DM with another user ─
router.get('/conversation/:userId', authenticate, async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.userId;
  if (myId === otherId) {
    return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
  }
  try {
    const conv = await getOrCreateConversation(myId, otherId);
    return res.json({ success: true, data: conv });
  } catch (err) {
    console.error('Get/create conversation error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load conversation' });
  }
});

// ── GET /api/messages/:conversationId — get message history ──────────────────
router.get('/:conversationId', authenticate, async (req, res) => {
  const { conversationId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('messages')
          .where('conversationId', '==', conversationId)
          .orderBy('createdAt', 'asc')
          .limitToLast(limit)
          .get()
      );
      const data = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Firestore messages error:', err.message);
    }
  }

  const data = memMessages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-limit);
  return res.json({ success: true, data });
});

// ── POST /api/messages/:conversationId — send a message ─────────────────────
router.post(
  '/:conversationId',
  authenticate,
  [
    body('text').optional().isString().trim(),
    body('mediaUrl').optional().isURL(),
    body('mediaType').optional().isIn(['image', 'video', 'file']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { conversationId } = req.params;
    const { text, mediaUrl, mediaType } = req.body;
    const senderId = req.user._id;

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message must have text or media' });
    }

    const message = {
      conversationId,
      senderId,
      senderName: req.user.name,
      senderAvatar: req.user.avatar || '',
      text: text || '',
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      readBy: [senderId],
      createdAt: new Date(),
    };

    let savedMessage = message;

    if (isFirestoreEnabled && db) {
      try {
        const ref = db.collection('messages').doc();
        await withTimeout(ref.set(message));
        savedMessage = { _id: ref.id, ...message };

        // Update conversation's lastMessage
        await withTimeout(
          db.collection('conversations').doc(conversationId).update({
            lastMessage: text || '📎 Media',
            lastMessageAt: new Date(),
          })
        );
      } catch (err) {
        console.error('Firestore send-message error:', err.message);
      }
    } else {
      savedMessage = { _id: generateId('msg'), ...message };
      memMessages.push(savedMessage);

      const conv = memConversations.find((c) => c._id === conversationId);
      if (conv) {
        conv.lastMessage = text || '📎 Media';
        conv.lastMessageAt = new Date();
      }
    }

    // Emit real-time event via Socket.IO (attached to app in index.js)
    const io = req.app.get('io');
    if (io) {
      io.to(`conv:${conversationId}`).emit('message:new', savedMessage);
    }

    return res.status(201).json({ success: true, data: savedMessage });
  }
);

module.exports = router;
