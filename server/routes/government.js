const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeScheme, serializeApplication } = require('../services/serializers');

const router = express.Router();

// ── GET /api/government/schemes — public catalogue ──────────────────────────
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await prisma.scheme.findMany({ orderBy: { createdAt: 'asc' } });
    return res.json({ success: true, data: schemes.map(serializeScheme) });
  } catch (err) {
    console.error('Fetch schemes error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch schemes' });
  }
});

// ── GET /api/government/applications — the caller's own applications ────────
// Previously returned every application in the database to any signed-in user.
router.get('/applications', authenticate, async (req, res) => {
  try {
    const applications = await prisma.schemeApplication.findMany({
      where: { userId: req.user.id },
      include: { scheme: true },
      orderBy: { appliedAt: 'desc' },
    });
    return res.json({ success: true, data: applications.map(serializeApplication) });
  } catch (err) {
    console.error('Fetch applications error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// ── POST /api/government/applications — apply for a scheme ──────────────────
router.post('/applications', authenticate, async (req, res) => {
  const { schemeId } = req.body;
  if (!schemeId) {
    return res.status(400).json({ success: false, message: 'schemeId is required' });
  }

  try {
    const scheme = await prisma.scheme.findUnique({ where: { id: schemeId }, select: { id: true } });
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    const application = await prisma.schemeApplication.create({
      data: { schemeId, userId: req.user.id },
      include: { scheme: true },
    });
    return res.status(201).json({ success: true, data: serializeApplication(application) });
  } catch (err) {
    console.error('Create application error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

module.exports = router;
