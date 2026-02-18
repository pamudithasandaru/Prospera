const express = require('express');
const { schemes, applications } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/schemes', async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('schemes').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: schemes });
});

router.get('/applications', authenticate, async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('applications').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: applications });
});

module.exports = router;
