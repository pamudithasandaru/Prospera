const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const { protect } = require('../middleware/auth');

// @route   POST /api/farm/register
// @desc    Register a new farm
// @access  Private
router.post('/register', protect, async (req, res) => {
  try {
    const farm = await Farm.create({
      owner: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Farm registered successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/farm/my-farms
// @desc    Get all farms owned by logged in user
// @access  Private
router.get('/my-farms', protect, async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user.id });
    
    res.json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/farm/:id
// @desc    Get single farm
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id).populate('owner', 'name email phone');
    
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/farm/:id
// @desc    Update farm
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Make sure user is farm owner
    if (farm.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this farm'
      });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Farm updated successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/farm/:id/crop
// @desc    Add a crop to farm
// @access  Private
router.post('/:id/crop', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    if (farm.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    farm.currentCrops.push(req.body);
    await farm.save();

    res.json({
      success: true,
      message: 'Crop added successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/farm/:id/expense
// @desc    Add expense
// @access  Private
router.post('/:id/expense', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    if (farm.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    farm.expenses.push(req.body);
    await farm.save();

    res.json({
      success: true,
      message: 'Expense added successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/farm/:id/revenue
// @desc    Add revenue
// @access  Private
router.post('/:id/revenue', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    if (farm.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    farm.revenue.push(req.body);
    await farm.save();

    res.json({
      success: true,
      message: 'Revenue added successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/farm/:id/dashboard
// @desc    Get farm dashboard data (profit/loss, expenses, revenue)
// @access  Private
router.get('/:id/dashboard', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const totalRevenue = farm.revenue.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalExpenses = farm.expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalRevenue - totalExpenses;

    // Get monthly data for charts
    const monthlyData = {};
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        profit,
        roi: totalExpenses > 0 ? ((profit / totalExpenses) * 100).toFixed(2) : 0,
        currentCrops: farm.currentCrops.length,
        recentExpenses: farm.expenses.slice(-10),
        recentRevenue: farm.revenue.slice(-10)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/farm/:id/disease-report
// @desc    Report disease
// @access  Private
router.post('/:id/disease-report', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    farm.diseaseReports.push({
      ...req.body,
      reportedDate: Date.now()
    });
    await farm.save();

    // TODO: Send alerts to nearby farms

    res.json({
      success: true,
      message: 'Disease report submitted successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/farm/:id/schedule/fertilizer
// @desc    Add fertilizer schedule
// @access  Private
router.post('/:id/schedule/fertilizer', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    farm.schedules.fertilizer.push(req.body);
    await farm.save();

    res.json({
      success: true,
      message: 'Fertilizer schedule added successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
