const express = require('express');
const { farms } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('farms').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: farms });
});

module.exports = router;
