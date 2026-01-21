New Message from Pamuditha Sandaru  Show  Ignore

Skip to content
Using Gmail with screen readers
1 of 1,102
(no subject)
Inbox

Pamuditha Sandaru
12:07 PM (3 minutes ago)
 

Pamuditha Sandaru
12:07 PM (3 minutes ago)
to me

const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  landSize: {
    type: Number,
    required: true // in acres
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    },
    address: String,
    region: String,
    district: String
  },
  soilData: {
    type: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'peaty', 'chalky', 'silty']
    },
    pH: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicMatter: Number,
    lastTested: Date
  },
  waterSource: {
    type: String,
    enum: ['rain', 'irrigation', 'well', 'river', 'mixed']
  },
  currentCrops: [{
    cropName: String,
    variety: String,
    plantedDate: Date,
    expectedHarvestDate: Date,
    area: Number, // in acres
    status: {
      type: String,
      enum: ['planted', 'growing', 'harvesting', 'harvested'],
      default: 'planted'
    }
  }],
  cropHistory: [{
    cropName: String,
    plantedDate: Date,
    harvestDate: Date,
    yield: Number,
    revenue: Number,
    expenses: Number,
    profit: Number
  }],
  expenses: [{
    category: {
      type: String,
      enum: ['seeds', 'fertilizer', 'pesticides', 'labor', 'equipment', 'water', 'electricity', 'other']
    },
    amount: Number,
    description: String,
    date: Date,
    crop: String
  }],
  revenue: [{
    crop: String,
    quantity: Number,
    unitPrice: Number,
    totalAmount: Number,
    buyer: String,
    date: Date
  }],
  schedules: {
    fertilizer: [{
      fertilizer: String,
      quantity: String,
      applicationDate: Date,
      crop: String,
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }
    }],
    irrigation: [{
      duration: String,
      time: String,
      days: [String],
      crop: String,
      active: Boolean
    }],
    tasks: [{
      task: String,
      dueDate: Date,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
      }
    }]
  },
  diseaseReports: [{
    diseaseName: String,
    crop: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    images: [String],
    symptoms: String,
    treatment: String,
    reportedDate: Date,
    resolvedDate: Date,
    status: {
      type: String,
      enum: ['active', 'under-treatment', 'resolved'],
      default: 'active'
    }
  }],
  documents: [{
    type: String, // 'ownership', 'permit', 'certificate'
    name: String,
    url: String,
    uploadDate: Date
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate total profit/loss
farmSchema.virtual('totalProfit').get(function() {
  const totalRevenue = this.revenue.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
  return totalRevenue - totalExpenses;
});

module.exports = mongoose.model('Farm', farmSchema);



On Wed, 21 Jan 2026 at 12:06, Pamuditha Sandaru <pamudithasandaru2002@gmail.com> wrote:



Pamuditha Sandaru
12:10 PM (0 minutes ago)
to me

Market.js



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
