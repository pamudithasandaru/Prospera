const express = require('express');
const { marketListings } = require('../data/sampleData');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/listings', async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('marketListings').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: marketListings });
});

module.exports = router;
