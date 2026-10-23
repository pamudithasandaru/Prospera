const express = require('express');
const { prisma } = require('../services/prisma');
const { serializeListing } = require('../services/serializers');

const router = express.Router();

// ── GET /api/market/listings ────────────────────────────────────────────────
// Optional filters: ?type=export|domestic & ?category=grains
router.get('/listings', async (req, res) => {
  const { type, category } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  try {
    const listings = await prisma.marketListing.findMany({
      where: {
        ...(type === 'export' || type === 'domestic' ? { type } : {}),
        ...(category ? { productCategory: category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return res.json({ success: true, data: listings.map(serializeListing) });
  } catch (err) {
    console.error('Fetch listings error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
});

module.exports = router;
