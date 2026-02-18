const express = require('express');
const { weatherData } = require('../data/sampleData');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/current', async (req, res) => {
  const location = req.query.location || 'Colombo';

  if (isFirestoreEnabled && db) {
    const snap = await db.collection('meta').doc('weather').get();
    if (snap.exists) {
      return res.json({ success: true, data: { location, ...snap.data() } });
    }
  }

  return res.json({ success: true, data: { location, ...weatherData } });
});

module.exports = router;
