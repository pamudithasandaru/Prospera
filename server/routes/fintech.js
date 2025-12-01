const express = require('express');
const router = express.Router();
const { Loan, Lease } = require('../models/FinTech');
const { protect } = require('../middleware/auth');
const Farm = require('../models/Farm');

// LOAN ROUTES
// @route   POST /api/fintech/loan/apply
// @desc    Apply for a loan
// @access  Private
router.post('/loan/apply', protect, async (req, res) => {
  try {
    // Calculate credit score
    const farms = await Farm.find({ owner: req.user.id });
    let creditScore = 50; // Base score

    if (farms.length > 0) {
      const totalRevenue = farms.reduce((sum, farm) => {
        return sum + farm.revenue.reduce((s, r) => s + r.totalAmount, 0);
      }, 0);

      const totalExpenses = farms.reduce((sum, farm) => {
        return sum + farm.expenses.reduce((s, e) => s + e.amount, 0);
      }, 0);

      const totalLandSize = farms.reduce((sum, farm) => sum + farm.landSize, 0);

      // Score calculation
      if (totalLandSize > 5) creditScore += 15;
      else if (totalLandSize > 2) creditScore += 10;
      else if (totalLandSize > 1) creditScore += 5;

      if (totalRevenue > 500000) creditScore += 20;
      else if (totalRevenue > 200000) creditScore += 15;
      else if (totalRevenue > 100000) creditScore += 10;

      const profit = totalRevenue - totalExpenses;
      if (profit > 200000) creditScore += 15;
      else if (profit > 100000) creditScore += 10;
      else if (profit > 50000) creditScore += 5;
    }

    const loan = await Loan.create({
      borrower: req.user.id,
      ...req.body,
      creditScore: {
        score: Math.min(creditScore, 100),
        factors: {
          farmSize: farms.length,
          cropHistory: farms.reduce((sum, f) => sum + f.cropHistory.length, 0),
          repaymentHistory: 100, // Default good history
          totalRevenue: farms.reduce((sum, f) => 
            sum + f.revenue.reduce((s, r) => s + r.totalAmount, 0), 0)
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/fintech/my-loans
// @desc    Get user's loans
// @access  Private
router.get('/my-loans', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ borrower: req.user.id })
      .sort('-createdAt');

    res.json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/fintech/loan/:id
// @desc    Get single loan
// @access  Private
router.get('/loan/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('borrower', 'name email phone');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.borrower._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/fintech/loan/:id/repayment
// @desc    Record loan repayment
// @access  Private
router.post('/loan/:id/repayment', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.borrower.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Find the repayment entry and update it
    const repayment = loan.repayment.find(
      r => r._id.toString() === req.body.repaymentId
    );

    if (!repayment) {
      return res.status(404).json({
        success: false,
        message: 'Repayment entry not found'
      });
    }

    repayment.paidDate = Date.now();
    repayment.paidAmount = req.body.amount;
    repayment.status = repayment.paidAmount >= repayment.amount ? 'paid' : 'partial';

    await loan.save();

    res.json({
      success: true,
      message: 'Repayment recorded successfully',
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/fintech/credit-score
// @desc    Get user's farm credit score
// @access  Private
router.get('/credit-score', protect, async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user.id });
    const loans = await Loan.find({ borrower: req.user.id });

    let creditScore = 50; // Base score
    const factors = {
      farmSize: 0,
      cropHistory: 0,
      repaymentHistory: 0,
      totalRevenue: 0,
      profitMargin: 0
    };

    if (farms.length > 0) {
      const totalLandSize = farms.reduce((sum, farm) => sum + farm.landSize, 0);
      const totalRevenue = farms.reduce((sum, farm) => {
        return sum + farm.revenue.reduce((s, r) => s + r.totalAmount, 0);
      }, 0);
      const totalExpenses = farms.reduce((sum, farm) => {
        return sum + farm.expenses.reduce((s, e) => s + e.amount, 0);
      }, 0);
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      // Land size score (max 15 points)
      if (totalLandSize > 5) {
        creditScore += 15;
        factors.farmSize = 15;
      } else if (totalLandSize > 2) {
        creditScore += 10;
        factors.farmSize = 10;
      } else if (totalLandSize > 1) {
        creditScore += 5;
        factors.farmSize = 5;
      }

      // Revenue score (max 20 points)
      if (totalRevenue > 500000) {
        creditScore += 20;
        factors.totalRevenue = 20;
      } else if (totalRevenue > 200000) {
        creditScore += 15;
        factors.totalRevenue = 15;
      } else if (totalRevenue > 100000) {
        creditScore += 10;
        factors.totalRevenue = 10;
      }

      // Profit score (max 15 points)
      if (profitMargin > 30) {
        creditScore += 15;
        factors.profitMargin = 15;
      } else if (profitMargin > 20) {
        creditScore += 10;
        factors.profitMargin = 10;
      } else if (profitMargin > 10) {
        creditScore += 5;
        factors.profitMargin = 5;
      }

      // Crop history (max 10 points)
      const cropHistoryLength = farms.reduce((sum, f) => sum + f.cropHistory.length, 0);
      if (cropHistoryLength > 10) {
        creditScore += 10;
        factors.cropHistory = 10;
      } else if (cropHistoryLength > 5) {
        creditScore += 5;
        factors.cropHistory = 5;
      }
    }

    // Repayment history (max 20 points)
    if (loans.length > 0) {
      const paidLoans = loans.filter(l => l.status === 'closed').length;
      const totalLoans = loans.length;
      const repaymentRate = (paidLoans / totalLoans) * 100;

      if (repaymentRate === 100) {
        creditScore += 20;
        factors.repaymentHistory = 20;
      } else if (repaymentRate > 75) {
        creditScore += 15;
        factors.repaymentHistory = 15;
      } else if (repaymentRate > 50) {
        creditScore += 10;
        factors.repaymentHistory = 10;
      }
    } else {
      // No loan history - neutral
      creditScore += 10;
      factors.repaymentHistory = 10;
    }

    const finalScore = Math.min(creditScore, 100);
    let rating = 'Poor';
    if (finalScore >= 80) rating = 'Excellent';
    else if (finalScore >= 70) rating = 'Good';
    else if (finalScore >= 60) rating = 'Fair';

    res.json({
      success: true,
      data: {
        score: finalScore,
        rating,
        factors,
        recommendations: [
          finalScore < 70 ? 'Maintain consistent revenue records to improve score' : null,
          loans.length === 0 ? 'Consider taking a small loan and repaying on time to build credit history' : null,
          farms.length === 0 ? 'Register your farm to start building credit score' : null
        ].filter(Boolean)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// LEASE ROUTES
// @route   POST /api/fintech/lease/apply
// @desc    Apply for equipment lease
// @access  Private
router.post('/lease/apply', protect, async (req, res) => {
  try {
    const lease = await Lease.create({
      lessee: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Lease application submitted successfully',
      data: lease
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/fintech/my-leases
// @desc    Get user's leases
// @access  Private
router.get('/my-leases', protect, async (req, res) => {
  try {
    const leases = await Lease.find({ lessee: req.user.id })
      .populate('equipment', 'name images')
      .sort('-createdAt');

    res.json({
      success: true,
      count: leases.length,
      data: leases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
