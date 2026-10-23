const express = require('express');
const { weatherData } = require('../data/weather');

const router = express.Router();

// ── GET /api/weather/current ────────────────────────────────────────────────
// Static demo forecast — see server/data/weather.js.
router.get('/current', (req, res) => {
  const location = req.query.location || 'Colombo';
  return res.json({ success: true, data: { location, ...weatherData } });
});

module.exports = router;
