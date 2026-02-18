const express = require('express');
const { courses } = require('../data/sampleData');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/courses', async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('courses').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: courses });
});

module.exports = router;
