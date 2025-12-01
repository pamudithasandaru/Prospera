const express = require('express');
const router = express.Router();
const { MarketListing, PriceTracking, ExportContract } = require('../models/Market');
const { protect } = require('../middleware/auth');

// @route   POST /api/market/listing
// @desc    Create market listing
// @access  Private
router.post('/listing', protect, async (req, res) => {
  try {
    const listing = await MarketListing.create({
      seller: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/market/listings
// @desc    Get all market listings with filters
// @access  Public
router.get('/listings', async (req, res) => {
  try {
    const { type, category, location, minPrice, maxPrice, status } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (category) query['product.category'] = category;
    if (status) query.status = status;
    else query.status = 'active';
    
    if (minPrice || maxPrice) {
      query['pricing.pricePerUnit'] = {};
      if (minPrice) query['pricing.pricePerUnit'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.pricePerUnit'].$lte = Number(maxPrice);
    }

    const listings = await MarketListing.find(query)
      .populate('seller', 'name phone profile.verificationBadge')
      .sort('-createdAt')
      .limit(50);

    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/market/listing/:id
// @desc    Get single listing
// @access  Public
router.get('/listing/:id', async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id)
      .populate('seller', 'name email phone address profile');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/market/my-listings
// @desc    Get user's listings
// @access  Private
router.get('/my-listings', protect, async (req, res) => {
  try {
    const listings = await MarketListing.find({ seller: req.user.id })
      .sort('-createdAt');

    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/market/listing/:id
// @desc    Update listing
// @access  Private
router.put('/listing/:id', protect, async (req, res) => {
  try {
    let listing = await MarketListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    listing = await MarketListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/market/listing/:id/inquiry
// @desc    Send inquiry about listing
// @access  Private
router.post('/listing/:id/inquiry', protect, async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    listing.inquiries.push({
      buyer: req.user.id,
      message: req.body.message,
      date: Date.now()
    });

    await listing.save();

    res.json({
      success: true,
      message: 'Inquiry sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/market/prices
// @desc    Get commodity price tracking
// @access  Public
router.get('/prices', async (req, res) => {
  try {
    const { product, market, category } = req.query;
    
    let query = {};
    if (product) query.product = new RegExp(product, 'i');
    if (market) query.market = market;
    if (category) query.category = category;

    const prices = await PriceTracking.find(query)
      .sort('-updatedAt')
      .limit(50);

    res.json({
      success: true,
      count: prices.length,
      data: prices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/market/contract
// @desc    Create export contract
// @access  Private
router.post('/contract', protect, async (req, res) => {
  try {
    const contract = await ExportContract.create({
      seller: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/market/contracts
// @desc    Get user's contracts
// @access  Private
router.get('/contracts', protect, async (req, res) => {
  try {
    const contracts = await ExportContract.find({
      $or: [{ seller: req.user.id }, { buyer: req.user.id }]
    }).populate('seller buyer', 'name email phone');

    res.json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
