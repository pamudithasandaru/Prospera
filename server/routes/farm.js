const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeFarm } = require('../services/serializers');

const router = express.Router();

const VALID_CROP_STATUS = ['planned', 'growing', 'harvested', 'failed'];

/** Everything serializeFarm needs. */
const FARM_INCLUDE = { owner: true, crops: true, expenses: true, revenues: true };

/** Experts, consultants and admins get the read-only all-farmers view. */
const isExpert = (user) => ['expert', 'consultant', 'admin'].includes(user.role);

// ── Helper: derived financial / land metrics for a serialized farm ──────────
const computeInsights = (farm) => {
  const totalRevenue = farm.revenue.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalExpenses = farm.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const revenuePerAcre = farm.landSize > 0 ? totalRevenue / farm.landSize : 0;
  const expensePerAcre = farm.landSize > 0 ? totalExpenses / farm.landSize : 0;

  const crops = farm.currentCrops;
  const activeCrops = crops.filter((c) => c.status === 'growing').length;
  const totalCropArea = crops.reduce((s, c) => s + (c.area || 0), 0);
  const landUtilization = farm.landSize > 0 ? (totalCropArea / farm.landSize) * 100 : 0;

  const expenseMap = {};
  farm.expenses.forEach((e) => {
    expenseMap[e.category] = (expenseMap[e.category] || 0) + (e.amount || 0);
  });
  const expenseBreakdown = Object.entries(expenseMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
  }));

  const topRevenueCrop = farm.revenue.length
    ? farm.revenue.reduce((best, r) => (r.totalAmount > best.totalAmount ? r : best), farm.revenue[0])
    : null;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    revenuePerAcre: Math.round(revenuePerAcre),
    expensePerAcre: Math.round(expensePerAcre),
    activeCrops,
    totalCrops: crops.length,
    landUtilization: Math.round(landUtilization * 100) / 100,
    expenseBreakdown,
    topRevenueCrop,
  };
};

/** Loads a farm and enforces owner-or-expert access. Returns null on 404/403. */
async function loadAccessibleFarm(farmId, user) {
  const farm = await prisma.farm.findUnique({ where: { id: farmId }, include: FARM_INCLUDE });
  if (!farm) return { error: 404, message: 'Farm not found' };
  if (farm.ownerId !== user.id && !isExpert(user)) {
    return { error: 403, message: 'Access denied' };
  }
  return { farm };
}

// ── GET /api/farm — the caller's own farms ──────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: req.user.id },
      include: FARM_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: farms.map(serializeFarm) });
  } catch (err) {
    console.error('Error fetching farms:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch farms' });
  }
});

// ── GET /api/farm/expert/farmers — all farmers, with farm counts ────────────
router.get('/expert/farmers', authenticate, async (req, res) => {
  if (!isExpert(req.user)) {
    return res.status(403).json({ success: false, message: 'Only experts can access this' });
  }

  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'farmer' },
      select: {
        id: true, name: true, email: true, avatar: true,
        bio: true, profilePicture: true, coverPhoto: true, district: true,
        _count: { select: { farms: true } },
      },
      orderBy: { name: 'asc' },
    });

    const data = farmers.map((f) => ({
      _id: f.id,
      name: f.name,
      email: f.email,
      avatar: f.avatar || '',
      profile: {
        bio: f.bio || '',
        profilePicture: f.profilePicture || '',
        coverPhoto: f.coverPhoto || '',
        location: { district: f.district || '' },
      },
      farmCount: f._count.farms,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching farmers for expert:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch farmers' });
  }
});

// ── GET /api/farm/expert/farmers/:farmerId/farms ────────────────────────────
router.get('/expert/farmers/:farmerId/farms', authenticate, async (req, res) => {
  if (!isExpert(req.user)) {
    return res.status(403).json({ success: false, message: 'Only experts can access this' });
  }

  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: req.params.farmerId },
      include: FARM_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: farms.map(serializeFarm) });
  } catch (err) {
    console.error('Error fetching farms for farmer:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch farms' });
  }
});

// ── GET /api/farm/:id ───────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { farm, error, message } = await loadAccessibleFarm(req.params.id, req.user);
    if (error) return res.status(error).json({ success: false, message });
    return res.json({ success: true, data: serializeFarm(farm) });
  } catch (err) {
    console.error('Error fetching farm:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch farm' });
  }
});

// ── GET /api/farm/:id/insights ──────────────────────────────────────────────
router.get('/:id/insights', authenticate, async (req, res) => {
  try {
    const { farm, error, message } = await loadAccessibleFarm(req.params.id, req.user);
    if (error) return res.status(error).json({ success: false, message });
    return res.json({ success: true, data: computeInsights(serializeFarm(farm)) });
  } catch (err) {
    console.error('Error computing insights:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to compute insights' });
  }
});

// ── POST /api/farm ──────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ success: false, message: 'Only farmers can create farms' });
  }

  const { name, location, landSize } = req.body;
  if (!name || !location || landSize === undefined || landSize === null || landSize === '') {
    return res.status(400).json({ success: false, message: 'Name, location, and land size are required' });
  }
  const size = Number(landSize);
  if (!Number.isFinite(size) || size <= 0) {
    return res.status(400).json({ success: false, message: 'Land size must be a positive number' });
  }

  try {
    const farm = await prisma.farm.create({
      data: { name, location, landSize: size, ownerId: req.user.id },
      include: FARM_INCLUDE,
    });
    return res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: serializeFarm(farm),
    });
  } catch (err) {
    console.error('Error creating farm:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create farm' });
  }
});

// ── PUT /api/farm/:id — owner only ──────────────────────────────────────────
// currentCrops / expenses / revenue are sent as whole arrays by the client, so
// each supplied collection is replaced wholesale inside one transaction.
router.put('/:id', authenticate, async (req, res) => {
  const farmId = req.params.id;

  try {
    const existing = await prisma.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own farms' });
    }

    const { name, location, landSize, currentCrops, expenses, revenue } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (location !== undefined) data.location = location;
    if (landSize !== undefined) {
      const size = Number(landSize);
      if (!Number.isFinite(size) || size <= 0) {
        return res.status(400).json({ success: false, message: 'Land size must be a positive number' });
      }
      data.landSize = size;
    }

    if (Array.isArray(currentCrops)) {
      const bad = currentCrops.find((c) => c.status && !VALID_CROP_STATUS.includes(c.status));
      if (bad) {
        return res.status(400).json({ success: false, message: `Invalid crop status: ${bad.status}` });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.farm.update({ where: { id: farmId }, data });
      }

      if (Array.isArray(currentCrops)) {
        await tx.farmCrop.deleteMany({ where: { farmId } });
        if (currentCrops.length) {
          await tx.farmCrop.createMany({
            data: currentCrops.map((c) => ({
              farmId,
              cropName: c.cropName,
              variety: c.variety || null,
              area: Number(c.area) || 0,
              plantedDate: c.plantedDate ? new Date(c.plantedDate) : null,
              status: c.status || 'growing',
            })),
          });
        }
      }

      if (Array.isArray(expenses)) {
        await tx.farmExpense.deleteMany({ where: { farmId } });
        if (expenses.length) {
          await tx.farmExpense.createMany({
            data: expenses.map((e) => ({
              farmId,
              category: e.category,
              amount: Number(e.amount) || 0,
              note: e.note || null,
              ...(e.date ? { spentAt: new Date(e.date) } : {}),
            })),
          });
        }
      }

      if (Array.isArray(revenue)) {
        await tx.farmRevenue.deleteMany({ where: { farmId } });
        if (revenue.length) {
          await tx.farmRevenue.createMany({
            data: revenue.map((r) => ({
              farmId,
              label: r.label,
              totalAmount: Number(r.totalAmount) || 0,
              ...(r.date ? { earnedAt: new Date(r.date) } : {}),
            })),
          });
        }
      }

      return tx.farm.findUnique({ where: { id: farmId }, include: FARM_INCLUDE });
    });

    return res.json({
      success: true,
      message: 'Farm updated successfully',
      data: serializeFarm(updated),
    });
  } catch (err) {
    console.error('Error updating farm:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update farm' });
  }
});

// ── DELETE /api/farm/:id — owner only ───────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.farm.findUnique({
      where: { id: req.params.id },
      select: { ownerId: true },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own farms' });
    }

    // Crops, expenses and revenues cascade.
    await prisma.farm.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Farm deleted successfully' });
  } catch (err) {
    console.error('Error deleting farm:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete farm' });
  }
});

module.exports = router;
