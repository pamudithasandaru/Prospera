const mongoose = require('mongoose');

const marketListingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['wholesale', 'export'],
    required: true
  },
  product: {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'grains', 'spices', 'dairy', 'livestock', 'other'],
      required: true
    },
    variety: String,
    images: [String],
    description: String
  },
  quantity: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['kg', 'tons', 'pieces', 'liters', 'boxes'],
      required: true
    }
  },
  pricing: {
    pricePerUnit: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'premium', 'standard']
    },
    organic: Boolean,
    certifications: [String]
  },
  location: {
    district: String,
    city: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  availability: {
    inStock: {
      type: Boolean,
      default: true
    },
    availableFrom: Date,
    availableUntil: Date
  },
  delivery: {
    available: Boolean,
    methods: [String], // 'pickup', 'delivery', 'shipping'
    cost: Number
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'cancelled'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: [{
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    date: Date
  }]
}, {
  timestamps: true
});

// Price tracking schema
const priceTrackingSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true
  },
  category: String,
  market: {
    type: String,
    required: true // 'Colombo', 'Kandy', etc.
  },
  prices: [{
    date: {
      type: Date,
      default: Date.now
    },
    pricePerKg: Number,
    source: String, // 'government', 'market', 'user-reported'
  }],
  currentPrice: Number,
  priceChange: Number, // percentage
  trend: {
    type: String,
    enum: ['up', 'down', 'stable']
  }
}, {
  timestamps: true
});

// Smart contract for exports
const exportContractSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    name: String,
    category: String,
    quantity: Number,
    unit: String,
    qualityGrade: String
  },
  terms: {
    pricePerUnit: Number,
    totalAmount: Number,
    currency: String,
    deliveryDate: Date,
    deliveryLocation: String,
    paymentTerms: String,
    penaltyClause: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'fulfilled', 'cancelled', 'disputed'],
    default: 'draft'
  },
  signatures: {
    seller: {
      signed: Boolean,
      date: Date
    },
    buyer: {
      signed: Boolean,
      date: Date
    }
  },
  milestones: [{
    description: String,
    dueDate: Date,
    completed: Boolean,
    completedDate: Date
  }],
  documents: [{
    name: String,
    url: String,
    uploadDate: Date
  }]
}, {
  timestamps: true
});

const MarketListing = mongoose.model('MarketListing', marketListingSchema);
const PriceTracking = mongoose.model('PriceTracking', priceTrackingSchema);
const ExportContract = mongoose.model('ExportContract', exportContractSchema);

module.exports = { MarketListing, PriceTracking, ExportContract };
