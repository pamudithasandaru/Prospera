const express = require('express');
const router = express.Router();
const { Scheme, Advisory, InsuranceClaim } = require('../models/Government');
const { protect, authorize } = require('../middleware/auth');

// SCHEME ROUTES
// @route   POST /api/government/scheme
// @desc    Create government scheme
// @access  Private (government/admin only)
router.post('/scheme', protect, authorize('government', 'admin'), async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      data: scheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/government/schemes
// @desc    Get all schemes
// @access  Public
router.get('/schemes', async (req, res) => {
  try {
    const { type, status } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    else query.status = 'active';

    const schemes = await Scheme.find(query).sort('-createdAt');

    res.json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/government/scheme/:id
// @desc    Get single scheme
// @access  Public
router.get('/scheme/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.json({
      success: true,
      data: scheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/government/scheme/:id/apply
// @desc    Apply for a scheme
// @access  Private
router.post('/scheme/:id/apply', protect, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    scheme.applications.push({
      user: req.user.id,
      applicationDate: Date.now(),
      documents: req.body.documents,
      status: 'submitted'
    });

    await scheme.save();

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ADVISORY ROUTES
// @route   POST /api/government/advisory
// @desc    Create advisory
// @access  Private (government/admin only)
router.post('/advisory', protect, authorize('government', 'admin'), async (req, res) => {
  try {
    const advisory = await Advisory.create(req.body);

    // TODO: Send notifications to targeted users

    res.status(201).json({
      success: true,
      message: 'Advisory created successfully',
      data: advisory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/government/advisories
// @desc    Get all advisories
// @access  Public
router.get('/advisories', async (req, res) => {
  try {
    const { type, priority, region } = req.query;
    
    let query = { isActive: true };
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (region) query['targetAudience.regions'] = region;

    const advisories = await Advisory.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: advisories.length,
      data: advisories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// INSURANCE CLAIM ROUTES
// @route   POST /api/government/insurance-claim
// @desc    Submit insurance claim
// @access  Private
router.post('/insurance-claim', protect, async (req, res) => {
  try {
    const claim = await InsuranceClaim.create({
      farmer: req.user.id,
      ...req.body,
      timeline: [{ status: 'submitted', date: Date.now() }]
    });

    res.status(201).json({
      success: true,
      message: 'Insurance claim submitted successfully',
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/government/my-claims
// @desc    Get user's insurance claims
// @access  Private
router.get('/my-claims', protect, async (req, res) => {
  try {
    const claims = await InsuranceClaim.find({ farmer: req.user.id })
      .sort('-createdAt');

    res.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/government/insurance-claim/:id
// @desc    Update insurance claim status
// @access  Private (government/admin only)
router.put('/insurance-claim/:id', protect, authorize('government', 'admin'), async (req, res) => {
  try {
    const claim = await InsuranceClaim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    if (req.body.status) {
      claim.status = req.body.status;
      claim.timeline.push({
        status: req.body.status,
        date: Date.now(),
        note: req.body.note
      });
    }

    if (req.body.assessment) {
      claim.assessment = req.body.assessment;
    }

    await claim.save();

    res.json({
      success: true,
      message: 'Claim updated successfully',
      data: claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/government/my-applications
// @desc    Get user's scheme applications
// @access  Private
router.get('/my-applications', protect, async (req, res) => {
  try {
    const schemes = await Scheme.find({
      'applications.user': req.user.id
    });

    const applications = [];
    schemes.forEach(scheme => {
      const userApps = scheme.applications.filter(
        app => app.user.toString() === req.user.id
      );
      userApps.forEach(app => {
        applications.push({
          scheme: {
            id: scheme._id,
            name: scheme.name,
            type: scheme.type
          },
          ...app.toObject()
        });
      });
    });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
