const express = require('express');
const { locations, findLocation, DEFAULT_LOCATION } = require('../data/lkLocations');
const { getWeather } = require('../services/weatherService');

const router = express.Router();

const names = locations.map((l) => l.name);

// ── GET /api/weather/locations ──────────────────────────────────────────────
router.get('/locations', (req, res) => {
  res.json({ success: true, data: names, default: DEFAULT_LOCATION });
});

// ── GET /api/weather/current?district=Kandy ─────────────────────────────────
// Live data from Open-Meteo (cached 15 min). `location` is accepted as an alias.
// Only known district names are accepted — no arbitrary coordinates.
router.get('/current', async (req, res) => {
  const requested = req.query.district || req.query.location || DEFAULT_LOCATION;
  const loc = findLocation(requested);
  if (!loc) {
    return res.status(400).json({ success: false, message: `Unknown district "${String(requested).slice(0, 40)}"`, locations: names });
  }

  try {
    const data = await getWeather(loc);
    return res.json({ success: true, data: { ...data, locations: names } });
  } catch (err) {
    const why = err.response ? `HTTP ${err.response.status}` : err.code || err.message;
    console.error(`Weather fetch failed for ${loc.name}: ${why}`);
    return res.status(503).json({ success: false, message: 'Weather data is temporarily unavailable. Please try again shortly.' });
  }
});

module.exports = router;
