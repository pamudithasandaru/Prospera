const express = require('express');
const { tickets, generateId } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/tickets', authenticate, async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('tickets').orderBy('createdAt', 'desc').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: tickets });
});

router.post('/tickets', authenticate, async (req, res) => {
  const { subject, category, description } = req.body;
  if (!subject) {
    return res.status(400).json({ success: false, message: 'Subject is required' });
  }
  const ticket = {
    subject,
    category: category || 'general',
    description: description || '',
    status: 'open',
    createdAt: new Date(),
  };

  if (isFirestoreEnabled && db) {
    const docRef = db.collection('tickets').doc();
    await docRef.set(ticket);
    return res.status(201).json({ success: true, data: { _id: docRef.id, ...ticket } });
  }

  const inMemoryTicket = { _id: generateId('ticket'), ...ticket };
  tickets.unshift(inMemoryTicket);
  return res.status(201).json({ success: true, data: inMemoryTicket });
});

module.exports = router;
