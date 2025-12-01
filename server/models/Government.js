const mongoose = require('mongoose');

// Government Scheme Schema
const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['subsidy', 'grant', 'loan', 'insurance', 'training', 'other'],
    required: true
  },
  eligibility: {
    criteria: [String],
    farmSizeMin: Number,
    farmSizeMax: Number,
    cropTypes: [String],
    regions: [String]
  },
  benefits: {
    amount: Number,
    percentage: Number,
    description: String
  },
  applicationProcess: {
    steps: [String],
    requiredDocuments: [String],
    deadlines: {
      start: Date,
      end: Date
    },
    applicationUrl: String
  },
  contactInfo: {
    department: String,
    phone: String,
    email: String,
    office: String
  },
  status: {
    type: String,
    enum: ['active', 'upcoming', 'closed'],
    default: 'active'
  },
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    applicationDate: Date,
    status: {
      type: String,
      enum: ['submitted', 'under-review', 'approved', 'rejected'],
      default: 'submitted'
    },
    documents: [{
      name: String,
      url: String
    }],
    remarks: String
  }]
}, {
  timestamps: true
});

// Advisory Schema
const advisorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['weather', 'disease', 'market', 'policy', 'general'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  targetAudience: {
    regions: [String],
    districts: [String],
    cropTypes: [String]
  },
  issuedBy: {
    department: String,
    official: String,
    contact: String
  },
  validFrom: Date,
  validUntil: Date,
  attachments: [{
    name: String,
    type: String,
    url: String
  }],
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Insurance Claim Schema
const insuranceClaimSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm'
  },
  policyNumber: String,
  claimType: {
    type: String,
    enum: ['crop-loss', 'natural-disaster', 'disease-outbreak', 'fire', 'other'],
    required: true
  },
  claimDetails: {
    incidentDate: Date,
    cropAffected: String,
    areaAffected: Number,
    estimatedLoss: Number,
    description: String
  },
  supportingDocuments: [{
    name: String,
    type: String,
    url: String,
    uploadDate: Date
  }],
  assessment: {
    assessor: String,
    assessmentDate: Date,
    actualLoss: Number,
    approvedAmount: Number,
    remarks: String
  },
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'approved', 'rejected', 'paid'],
    default: 'submitted'
  },
  timeline: [{
    status: String,
    date: Date,
    note: String
  }]
}, {
  timestamps: true
});

const Scheme = mongoose.model('Scheme', schemeSchema);
const Advisory = mongoose.model('Advisory', advisorySchema);
const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);

module.exports = { Scheme, Advisory, InsuranceClaim };
