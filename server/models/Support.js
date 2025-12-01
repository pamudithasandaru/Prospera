const mongoose = require('mongoose');

// Support Ticket Schema
const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'account', 'farm-management', 'marketplace', 'learning', 'payment', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  attachments: [{
    name: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    attachments: [String],
    date: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedDate: Date,
    solution: String
  },
  rating: {
    score: Number,
    feedback: String
  }
}, {
  timestamps: true
});

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'account', 'farm-management', 'marketplace', 'learning', 'payment', 'technical'],
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'si', 'ta'],
    default: 'en'
  },
  tags: [String],
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Chatbot Conversation Schema
const chatbotConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    message: String,
    intent: String,
    confidence: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolved: {
    type: Boolean,
    default: false
  },
  escalated: {
    type: Boolean,
    default: false
  },
  rating: Number
}, {
  timestamps: true
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
const FAQ = mongoose.model('FAQ', faqSchema);
const ChatbotConversation = mongoose.model('ChatbotConversation', chatbotConversationSchema);

module.exports = { SupportTicket, FAQ, ChatbotConversation };
