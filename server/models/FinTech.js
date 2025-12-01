const mongoose = require('mongoose');

// Loan Schema
const loanSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    enum: ['seed-loan', 'fertilizer-loan', 'equipment-loan', 'working-capital', 'other'],
    required: true
  },
  amount: {
    requested: {
      type: Number,
      required: true
    },
    approved: Number,
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  purpose: String,
  terms: {
    interestRate: Number,
    duration: Number, // in months
    repaymentSchedule: {
      type: String,
      enum: ['monthly', 'quarterly', 'half-yearly', 'harvest-based']
    },
    collateral: String
  },
  creditScore: {
    score: Number,
    factors: {
      farmSize: Number,
      cropHistory: Number,
      repaymentHistory: Number,
      totalRevenue: Number
    }
  },
  status: {
    type: String,
    enum: ['applied', 'under-review', 'approved', 'disbursed', 'rejected', 'closed'],
    default: 'applied'
  },
  disbursement: {
    date: Date,
    method: String,
    reference: String
  },
  repayment: [{
    dueDate: Date,
    amount: Number,
    paidDate: Date,
    paidAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'partial']
    }
  }],
  documents: [{
    name: String,
    type: String,
    url: String
  }]
}, {
  timestamps: true
});

// Equipment Lease Schema
const leaseSchema = new mongoose.Schema({
  lessee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  equipmentDetails: {
    name: String,
    category: String,
    description: String,
    value: Number
  },
  leaseTerms: {
    startDate: Date,
    endDate: Date,
    monthlyPayment: Number,
    totalCost: Number,
    securityDeposit: Number,
    maintenanceIncluded: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'terminated'],
    default: 'pending'
  },
  payments: [{
    dueDate: Date,
    amount: Number,
    paidDate: Date,
    status: String
  }],
  contract: {
    url: String,
    signedDate: Date
  }
}, {
  timestamps: true
});

const Loan = mongoose.model('Loan', loanSchema);
const Lease = mongoose.model('Lease', leaseSchema);

module.exports = { Loan, Lease };
