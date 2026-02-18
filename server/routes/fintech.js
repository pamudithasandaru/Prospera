const express = require('express');
const { loans, creditScore, generateId } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/loans', authenticate, async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('loans').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: loans });
});

router.post('/loans', authenticate, async (req, res) => {
  const { amount, purpose, duration } = req.body;
  if (!amount || !purpose || !duration) {
    return res.status(400).json({ success: false, message: 'Amount, purpose, and duration are required' });
  }
  const loan = {
    amount: Number(amount),
    purpose,
    duration: Number(duration),
    status: 'pending',
    appliedAt: new Date(),
  };

  if (isFirestoreEnabled && db) {
    const docRef = db.collection('loans').doc();
    await docRef.set(loan);
    return res.status(201).json({ success: true, data: { _id: docRef.id, ...loan } });
  }

  const inMemoryLoan = { _id: generateId('loan'), ...loan };
  loans.unshift(inMemoryLoan);
  return res.status(201).json({ success: true, data: inMemoryLoan });
});

router.get('/credit-score', authenticate, async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('meta').doc('creditScore').get();
    if (!snap.exists) {
      return res.json({ success: true, data: creditScore });
    }
    return res.json({ success: true, data: snap.data() });
  }
  return res.json({ success: true, data: creditScore });
});

module.exports = router;
