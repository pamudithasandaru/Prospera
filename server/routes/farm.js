const express = require('express');
const { farms, users, generateId } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

// ── Helper: compute insights from farm data ─────────────────────────────────
const computeInsights = (farm) => {
  const totalRevenue = (farm.revenue || []).reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalExpenses = (farm.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
  const revenuePerAcre = farm.landSize > 0 ? totalRevenue / farm.landSize : 0;
  const expensePerAcre = farm.landSize > 0 ? totalExpenses / farm.landSize : 0;

  const crops = farm.currentCrops || [];
  const activeCrops = crops.filter((c) => c.status === 'growing').length;
  const totalCropArea = crops.reduce((s, c) => s + (c.area || 0), 0);
  const landUtilization = farm.landSize > 0 ? ((totalCropArea / farm.landSize) * 100) : 0;

  // Expense breakdown by category
  const expenseMap = {};
  (farm.expenses || []).forEach((e) => {
    expenseMap[e.category] = (expenseMap[e.category] || 0) + (e.amount || 0);
  });
  const expenseBreakdown = Object.entries(expenseMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100) : 0,
  }));

  // Top revenue crop
  const revenueItems = farm.revenue || [];
  const topRevenueCrop = revenueItems.length > 0
    ? revenueItems.reduce((best, r) => (r.totalAmount > best.totalAmount ? r : best), revenueItems[0])
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

// Helper: check expert role (supports both 'expert' and 'consultant')
const isExpert = (user) => user.role === 'expert' || user.role === 'consultant';

// ── GET /farm — Farmer's own farms ──────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    if (isFirestoreEnabled && db) {
      const snap = await db.collection('farms').where('ownerId', '==', req.user._id).get();
      const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      return res.json({ success: true, data });
    }
    // In-memory fallback — return all sample farms (demo mode)
    return res.json({ success: true, data: farms });
  } catch (err) {
    console.error('Error fetching farms:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch farms' });
  }
});

// ── GET /farm/expert/farmers — List all farmers (expert only) ───────────────
router.get('/expert/farmers', authenticate, async (req, res) => {
  try {
    if (!isExpert(req.user)) {
      return res.status(403).json({ success: false, message: 'Only experts can access this' });
    }

    if (isFirestoreEnabled && db) {
      const snap = await db.collection('users').where('role', '==', 'farmer').get();
      const farmers = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          _id: doc.id,
          name: d.name,
          email: d.email,
          avatar: d.avatar,
          profile: d.profile,
        };
      });

      // Count farms per farmer
      const farmSnap = await db.collection('farms').get();
      const farmCounts = {};
      farmSnap.docs.forEach((doc) => {
        const ownerId = doc.data().ownerId;
        farmCounts[ownerId] = (farmCounts[ownerId] || 0) + 1;
      });

      const data = farmers.map((f) => ({ ...f, farmCount: farmCounts[f._id] || 0 }));
      return res.json({ success: true, data });
    }

    // In-memory fallback
    const farmerUsers = users.filter((u) => u.role === 'farmer').map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      profile: u.profile,
      farmCount: farms.filter((f) => f.ownerId === u._id).length || 1,
    }));
    return res.json({ success: true, data: farmerUsers });
  } catch (err) {
    console.error('Error fetching farmers for expert:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch farmers' });
  }
});

// ── GET /farm/expert/farmers/:farmerId/farms — A farmer's farms (expert) ────
router.get('/expert/farmers/:farmerId/farms', authenticate, async (req, res) => {
  try {
    if (!isExpert(req.user)) {
      return res.status(403).json({ success: false, message: 'Only experts can access this' });
    }

    if (isFirestoreEnabled && db) {
      const snap = await db.collection('farms').where('ownerId', '==', req.params.farmerId).get();
      const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      return res.json({ success: true, data });
    }

    // In-memory fallback
    return res.json({ success: true, data: farms });
  } catch (err) {
    console.error('Error fetching farms for farmer:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch farms' });
  }
});

// ── GET /farm/:id — Single farm (ownership check) ──────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (isFirestoreEnabled && db) {
      const doc = await db.collection('farms').doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }
      const farm = { _id: doc.id, ...doc.data() };
      // Allow owner or expert
      if (farm.ownerId !== req.user._id && !isExpert(req.user)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      return res.json({ success: true, data: farm });
    }

    const farm = farms.find((f) => f._id === req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    return res.json({ success: true, data: farm });
  } catch (err) {
    console.error('Error fetching farm:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch farm' });
  }
});

// ── GET /farm/:id/insights — Computed insights ─────────────────────────────
router.get('/:id/insights', authenticate, async (req, res) => {
  try {
    let farm;

    if (isFirestoreEnabled && db) {
      const doc = await db.collection('farms').doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }
      farm = { _id: doc.id, ...doc.data() };
      if (farm.ownerId !== req.user._id && !isExpert(req.user)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else {
      farm = farms.find((f) => f._id === req.params.id);
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }
    }

    const insights = computeInsights(farm);
    return res.json({ success: true, data: insights });
  } catch (err) {
    console.error('Error computing insights:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute insights' });
  }
});

// ── POST /farm — Create a new farm ─────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can create farms' });
    }

    const { name, location, landSize } = req.body;
    if (!name || !location || !landSize) {
      return res.status(400).json({ success: false, message: 'Name, location, and land size are required' });
    }

    const farmData = {
      name,
      location,
      landSize: Number(landSize),
      ownerId: req.user._id,
      ownerName: req.user.name,
      currentCrops: [],
      expenses: [],
      revenue: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirestoreEnabled && db) {
      const docRef = await db.collection('farms').add(farmData);
      return res.status(201).json({
        success: true,
        message: 'Farm created successfully',
        data: { _id: docRef.id, ...farmData },
      });
    }

    // In-memory fallback
    const newFarm = { _id: generateId('farm'), ...farmData };
    farms.push(newFarm);
    return res.status(201).json({ success: true, message: 'Farm created successfully', data: newFarm });
  } catch (err) {
    console.error('Error creating farm:', err);
    return res.status(500).json({ success: false, message: 'Failed to create farm' });
  }
});

// ── PUT /farm/:id — Update farm (owner only) ───────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can update farms' });
    }

    if (isFirestoreEnabled && db) {
      const docRef = db.collection('farms').doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }

      if (doc.data().ownerId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'You can only edit your own farms' });
      }

      const { name, location, landSize, currentCrops, expenses, revenue } = req.body;
      const updates = { updatedAt: new Date().toISOString() };
      if (name !== undefined) updates.name = name;
      if (location !== undefined) updates.location = location;
      if (landSize !== undefined) updates.landSize = Number(landSize);
      if (currentCrops !== undefined) updates.currentCrops = currentCrops;
      if (expenses !== undefined) updates.expenses = expenses;
      if (revenue !== undefined) updates.revenue = revenue;

      await docRef.update(updates);
      const updatedDoc = await docRef.get();
      return res.json({
        success: true,
        message: 'Farm updated successfully',
        data: { _id: updatedDoc.id, ...updatedDoc.data() },
      });
    }

    // In-memory fallback
    const farm = farms.find((f) => f._id === req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const { name, location, landSize, currentCrops, expenses, revenue } = req.body;
    if (name !== undefined) farm.name = name;
    if (location !== undefined) farm.location = location;
    if (landSize !== undefined) farm.landSize = Number(landSize);
    if (currentCrops !== undefined) farm.currentCrops = currentCrops;
    if (expenses !== undefined) farm.expenses = expenses;
    if (revenue !== undefined) farm.revenue = revenue;

    return res.json({ success: true, message: 'Farm updated successfully', data: farm });
  } catch (err) {
    console.error('Error updating farm:', err);
    return res.status(500).json({ success: false, message: 'Failed to update farm' });
  }
});

// ── DELETE /farm/:id — Delete farm (owner only) ────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can delete farms' });
    }

    if (isFirestoreEnabled && db) {
      const docRef = db.collection('farms').doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }

      if (doc.data().ownerId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'You can only delete your own farms' });
      }

      await docRef.delete();
      return res.json({ success: true, message: 'Farm deleted successfully' });
    }

    // In-memory fallback
    const idx = farms.findIndex((f) => f._id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    farms.splice(idx, 1);
    return res.json({ success: true, message: 'Farm deleted successfully' });
  } catch (err) {
    console.error('Error deleting farm:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete farm' });
  }
});

module.exports = router;
