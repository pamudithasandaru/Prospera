New Message from Pamuditha Sandaru  Show  Ignore

Skip to content
Using Gmail with screen readers
1 of 1,102
(no subject)
Inbox

Pamuditha Sandaru
12:07 PM (0 minutes ago)
to me



Pamuditha Sandaru
12:07 PM (0 minutes ago)
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





