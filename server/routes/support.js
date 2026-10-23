const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeTicket } = require('../services/serializers');

const router = express.Router();

// ── GET /api/support/tickets — the caller's own tickets ─────────────────────
// Previously returned every ticket in the database to any signed-in user.
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: tickets.map(serializeTicket) });
  } catch (err) {
    console.error('Fetch tickets error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// ── POST /api/support/tickets ───────────────────────────────────────────────
router.post('/tickets', authenticate, async (req, res) => {
  const { subject, category, description } = req.body;
  if (!subject || !String(subject).trim()) {
    return res.status(400).json({ success: false, message: 'Subject is required' });
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        userId: req.user.id,
        subject: String(subject).trim(),
        category: category || 'general',
        description: description || '',
      },
    });
    return res.status(201).json({ success: true, data: serializeTicket(ticket) });
  } catch (err) {
    console.error('Create ticket error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

module.exports = router;
