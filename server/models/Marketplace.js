const mongoose = require('mongoose');

// Marketplace Product Schema (Equipment, Seeds, etc.)
const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['machinery', 'seeds', 'fertilizers', 'drones', 'greenhouse-equipment', 'irrigation-systems', 'tools', 'other'],
    required: true
  },
  subcategory: String,
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one image is required']
  },
  videos: [String],
  model3D: String, // URL to 3D model for AR view
  specifications: {
    brand: String,
    model: String,
    yearManufactured: Number,
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'for-parts']
    },
    warranty: {
      available: Boolean,
      duration: String,
      terms: String
    },
    serviceHistory: [{
      date: Date,
      description: String,
      cost: Number,
      documents: [String]
    }],
    technicalSpecs: mongoose.Schema.Types.Mixed
  },
  pricing: {
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    negotiable: Boolean,
    saleType: {
      type: String,
      enum: ['sale', 'rent', 'lease'],
      default: 'sale'
    },
    rentalPrice: {
      daily: Number,
      weekly: Number,
      monthly: Number
    }
  },
  inventory: {
    quantity: {
      type: Number,
      default: 1
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  shipping: {
    available: Boolean,
    methods: [String],
    cost: Number,
    freeShippingThreshold: Number,
    estimatedDelivery: String,
    international: Boolean
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: Number,
      review: String,
      images: [String],
      date: Date,
      helpful: Number
    }]
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive', 'pending-approval'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Order Schema
const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  orderDetails: {
    quantity: Number,
    pricePerUnit: Number,
    totalAmount: Number,
    currency: String
  },
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  shipping: {
    method: String,
    cost: Number,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'bank-transfer', 'cash-on-delivery', 'mobile-payment']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  timeline: [{
    status: String,
    date: Date,
    note: String
  }]
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Product, Order };
