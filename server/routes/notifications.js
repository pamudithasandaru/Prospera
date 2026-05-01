/**
 * server/routes/notifications.js
 * Persistent notifications for likes, comments, follows, messages, story views.
 */
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');
const { generateId } = require('../data/sampleData');

const router = express.Router();
const TIMEOUT = 5000;
const withTimeout = (p) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Firestore timeout')), TIMEOUT))]);

// In-memory fallback
const memNotifications = [];

// ── GET /api/notifications — get all notifications for current user ───────────
router.get('/', authenticate, async (req, res) => {
  const userId = req.user._id;
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('notifications')
          .where('recipientId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get()
      );
      const data = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
      const unreadCount = data.filter((n) => !n.read).length;
      return res.json({ success: true, data, unreadCount });
    } catch (err) {
      console.error('Firestore notifications error:', err.message);
    }
  }

  const data = memNotifications
    .filter((n) => n.recipientId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  return res.json({ success: true, data, unreadCount: data.filter((n) => !n.read).length });
});

// ── PATCH /api/notifications/:id/read — mark single notification as read ─────
router.patch('/:id/read', authenticate, async (req, res) => {
  const userId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const ref = db.collection('notifications').doc(req.params.id);
      await withTimeout(ref.update({ read: true, readAt: new Date() }));
      return res.json({ success: true });
    } catch (err) {
      console.error('Firestore mark-read error:', err.message);
    }
  }

  const notif = memNotifications.find((n) => n._id === req.params.id && n.recipientId === userId);
  if (notif) { notif.read = true; notif.readAt = new Date(); }
  return res.json({ success: true });
});

// ── PATCH /api/notifications/read-all — mark all as read ────────────────────
router.patch('/read-all', authenticate, async (req, res) => {
  const userId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('notifications')
          .where('recipientId', '==', userId)
          .where('read', '==', false)
          .get()
      );
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.update(doc.ref, { read: true, readAt: new Date() }));
      await withTimeout(batch.commit());
      return res.json({ success: true });
    } catch (err) {
      console.error('Firestore read-all error:', err.message);
    }
  }

  memNotifications
    .filter((n) => n.recipientId === userId && !n.read)
    .forEach((n) => { n.read = true; n.readAt = new Date(); });
  return res.json({ success: true });
});

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  if (isFirestoreEnabled && db) {
    try {
      await withTimeout(db.collection('notifications').doc(req.params.id).delete());
      return res.json({ success: true });
    } catch (err) {
      console.error('Firestore delete-notif error:', err.message);
    }
  }

  const idx = memNotifications.findIndex((n) => n._id === req.params.id);
  if (idx !== -1) memNotifications.splice(idx, 1);
  return res.json({ success: true });
});

/**
 * createNotification — called internally from other routes (like, comment, connect).
 * Does not expose an HTTP endpoint.
 */
async function createNotification(io, { recipientId, senderId, senderName, senderAvatar, type, message, postId }) {
  if (recipientId === senderId) return; // Don't notify yourself

  const notif = {
    recipientId,
    senderId,
    senderName: senderName || 'Someone',
    senderAvatar: senderAvatar || '',
    type, // 'like' | 'comment' | 'follow' | 'message' | 'story_view' | 'connection_request'
    message,
    postId: postId || null,
    read: false,
    createdAt: new Date(),
  };

  let saved = notif;

  if (isFirestoreEnabled && db) {
    try {
      const ref = db.collection('notifications').doc();
      await withTimeout(ref.set(notif));
      saved = { _id: ref.id, ...notif };
    } catch (err) {
      console.error('Firestore create-notif error:', err.message);
    }
  } else {
    saved = { _id: generateId('notif'), ...notif };
    memNotifications.push(saved);
  }

  // Real-time push via Socket.IO
  if (io) {
    io.to(`user:${recipientId}`).emit('notification:new', saved);
  }

  return saved;
}

module.exports = router;
module.exports.createNotification = createNotification;
