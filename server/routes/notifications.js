/**
 * server/routes/notifications.js
 * Persistent notifications for likes, comments, follows, messages, story views.
 */
const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeNotification } = require('../services/serializers');

const router = express.Router();

// ── GET /api/notifications ──────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  const recipientId = req.user.id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

  try {
    const [rows, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId },
        include: { sender: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      // Counted over the whole table, not just the page that was fetched.
      prisma.notification.count({ where: { recipientId, read: false } }),
    ]);

    return res.json({ success: true, data: rows.map(serializeNotification), unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// ── PATCH /api/notifications/read-all ───────────────────────────────────────
// Declared before /:id/read so "read-all" is not captured as an id.
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, read: false },
      data: { read: true, readAt: new Date() },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to mark notifications read' });
  }
});

// ── PATCH /api/notifications/:id/read ───────────────────────────────────────
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    // Scoped by recipient so one user cannot mutate another's notifications.
    const { count } = await prisma.notification.updateMany({
      where: { id: req.params.id, recipientId: req.user.id },
      data: { read: true, readAt: new Date() },
    });
    if (count === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to mark notification read' });
  }
});

// ── DELETE /api/notifications/:id ───────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { count } = await prisma.notification.deleteMany({
      where: { id: req.params.id, recipientId: req.user.id },
    });
    if (count === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete notification error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

/**
 * createNotification — called internally from other routes (like, comment,
 * connect). Not exposed as an HTTP endpoint.
 *
 * Never throws: a failed notification must not fail the action that triggered it.
 */
async function createNotification(io, { recipientId, senderId, type, message, postId }) {
  if (!recipientId || recipientId === senderId) return null; // don't notify yourself

  try {
    const notif = await prisma.notification.create({
      data: {
        recipientId,
        senderId: senderId || null,
        type,
        message,
        postId: postId || null,
      },
      include: { sender: true },
    });

    const payload = serializeNotification(notif);
    if (io) io.to(`user:${recipientId}`).emit('notification:new', payload);
    return payload;
  } catch (err) {
    console.error('Create notification error:', err.message);
    return null;
  }
}

module.exports = router;
module.exports.createNotification = createNotification;
