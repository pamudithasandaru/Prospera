const express = require('express');
const router = express.Router();
const { Product, Order } = require('../models/Marketplace');
const { protect } = require('../middleware/auth');

// PRODUCT ROUTES
// @route   POST /api/marketplace/product
// @desc    Create product listing
// @access  Private
router.post('/product', protect, async (req, res) => {
  try {
    const product = await Product.create({
      seller: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/marketplace/products
// @desc    Get all products with filters
// @access  Public
router.get('/products', async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      condition, 
      minPrice, 
      maxPrice, 
      location, 
      saleType,
      page = 1,
      limit = 20 
    } = req.query;
    
    let query = { status: 'active' };
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (condition) query['specifications.condition'] = condition;
    if (saleType) query['pricing.saleType'] = saleType;
    
    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.price'].$lte = Number(maxPrice);
    }

    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    const products = await Product.find(query)
      .populate('seller', 'name phone profile.verificationBadge')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/marketplace/product/:id
// @desc    Get single product
// @access  Public
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email phone address profile');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/marketplace/product/:id
// @desc    Update product
// @access  Private
router.put('/product/:id', protect, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/marketplace/product/:id
// @desc    Delete product
// @access  Private
router.delete('/product/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await product.remove();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/marketplace/product/:id/review
// @desc    Add product review
// @access  Private
router.post('/product/:id/review', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.ratings.reviews.push({
      user: req.user.id,
      rating: req.body.rating,
      review: req.body.review,
      images: req.body.images || [],
      date: Date.now(),
      helpful: 0
    });

    // Recalculate average rating
    const totalRating = product.ratings.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.ratings.average = totalRating / product.ratings.reviews.length;
    product.ratings.count = product.ratings.reviews.length;

    await product.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/marketplace/my-products
// @desc    Get user's products
// @access  Private
router.get('/my-products', protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort('-createdAt');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ORDER ROUTES
// @route   POST /api/marketplace/order
// @desc    Create an order
// @access  Private
router.post('/order', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.body.product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const order = await Order.create({
      buyer: req.user.id,
      seller: product.seller,
      ...req.body,
      timeline: [{ status: 'pending', date: Date.now() }]
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/marketplace/my-orders
// @desc    Get user's orders (as buyer or seller)
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { role } = req.query; // 'buyer' or 'seller'
    
    let query = {};
    if (role === 'buyer') {
      query.buyer = req.user.id;
    } else if (role === 'seller') {
      query.seller = req.user.id;
    } else {
      query = { $or: [{ buyer: req.user.id }, { seller: req.user.id }] };
    }

    const orders = await Order.find(query)
      .populate('buyer seller', 'name email phone')
      .populate('product', 'name images pricing')
      .sort('-createdAt');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/marketplace/order/:id/status
// @desc    Update order status
// @access  Private
router.put('/order/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only seller can update status
    if (order.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    order.status = req.body.status;
    order.timeline.push({
      status: req.body.status,
      date: Date.now(),
      note: req.body.note
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
