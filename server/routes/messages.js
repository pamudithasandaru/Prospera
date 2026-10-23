/**
 * server/routes/messages.js
 * REST endpoints for private messaging. Real-time delivery happens via Socket.IO.
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeConversation, serializeMessage } = require('../services/serializers');

const router = express.Router();

const CONV_INCLUDE = { participants: { include: { user: true } } };
const MESSAGE_INCLUDE = { sender: true, readBy: true };

/** Short label shown in the conversation list. */
const previewFor = (text, mediaType, fileName) => {
  if (text) return text;
  if (mediaType === 'image') return '🖼 Image';
  if (mediaType === 'video') return '🎬 Video';
  if (mediaType === 'audio') return '🎙 Voice message';
  if (mediaType === 'file') return `📎 ${fileName || 'File'}`;
  return '📎 Media';
};

/** Finds the existing 1:1 conversation between two users, or creates it. */
async function getOrCreateConversation(userId1, userId2) {
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userId1 } } },
        { participants: { some: { userId: userId2 } } },
      ],
    },
    include: CONV_INCLUDE,
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      participants: { create: [{ userId: userId1 }, { userId: userId2 }] },
    },
    include: CONV_INCLUDE,
  });
}

/** True when the user is a participant — every read/write path checks this. */
async function isParticipant(conversationId, userId) {
  const row = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return Boolean(row);
}

// ── GET /api/messages/conversations ─────────────────────────────────────────
router.get('/conversations', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const convs = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: CONV_INCLUDE,
      orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    });
    return res.json({ success: true, data: convs.map((c) => serializeConversation(c, userId)) });
  } catch (err) {
    console.error('Fetch conversations error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load conversations' });
  }
});

// ── GET /api/messages/conversation/:userId — get or create a DM ─────────────
router.get('/conversation/:userId', authenticate, async (req, res) => {
  const myId = req.user.id;
  const otherId = req.params.userId;

  if (myId === otherId) {
    return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
  }

  try {
    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true } });
    if (!other) return res.status(404).json({ success: false, message: 'User not found' });

    const conv = await getOrCreateConversation(myId, otherId);
    return res.json({ success: true, data: serializeConversation(conv, myId) });
  } catch (err) {
    console.error('Get/create conversation error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load conversation' });
  }
});

// ── GET /api/messages/:conversationId — message history ─────────────────────
router.get('/:conversationId', authenticate, async (req, res) => {
  const { conversationId } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const userId = req.user.id;

  try {
    if (!(await isParticipant(conversationId, userId))) {
      return res.status(403).json({ success: false, message: 'Not a participant in this conversation' });
    }

    // Take the newest `limit` messages, then flip back to chronological order.
    const rows = await prisma.message.findMany({
      where: { conversationId },
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    rows.reverse();

    // Opening the thread clears its unread badge.
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { unreadCount: 0 },
    });

    return res.json({ success: true, data: rows.map(serializeMessage) });
  } catch (err) {
    console.error('Fetch messages error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
});

// ── POST /api/messages/:conversationId — send ───────────────────────────────
router.post(
  '/:conversationId',
  authenticate,
  [
    body('text').optional().isString().trim(),
    body('mediaUrl').optional().isString(), // accepts URLs and base64 data URIs
    body('mediaType').optional().isIn(['image', 'video', 'audio', 'file']),
    body('fileName').optional().isString(),
    body('fileSize').optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { conversationId } = req.params;
    const { text, mediaUrl, mediaType, fileName, fileSize } = req.body;
    const senderId = req.user.id;

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message must have text or media' });
    }

    try {
      if (!(await isParticipant(conversationId, senderId))) {
        return res.status(403).json({ success: false, message: 'Not a participant in this conversation' });
      }

      const preview = previewFor(text, mediaType, fileName);

      // Message, read-receipt, conversation preview and unread counters move
      // together so the list view can never disagree with the thread.
      const saved = await prisma.$transaction(async (tx) => {
        const message = await tx.message.create({
          data: {
            conversationId,
            senderId,
            text: text || '',
            mediaUrl: mediaUrl || null,
            mediaType: mediaType || null,
            fileName: fileName || null,
            fileSize: fileSize ? Number(fileSize) : null,
            readBy: { create: [{ userId: senderId }] },
          },
          include: MESSAGE_INCLUDE,
        });

        await tx.conversation.update({
          where: { id: conversationId },
          data: { lastMessage: preview, lastMessageAt: message.createdAt },
        });

        await tx.conversationParticipant.updateMany({
          where: { conversationId, userId: { not: senderId } },
          data: { unreadCount: { increment: 1 } },
        });

        return message;
      });

      const payload = serializeMessage(saved);

      const io = req.app.get('io');
      if (io) io.to(`conv:${conversationId}`).emit('message:new', payload);

      return res.status(201).json({ success: true, data: payload });
    } catch (err) {
      console.error('Send message error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  }
);

module.exports = router;
