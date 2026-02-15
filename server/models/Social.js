const mongoose = require('mongoose');

// Social Post Schema
const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      required: true,
      maxlength: 5000
    },
    images: [String],
    videos: [String],
    documents: [{
      name: String,
      url: String
    }]
  },
  type: {
    type: String,
    enum: ['post', 'article', 'question', 'success-story', 'alert'],
    default: 'post'
  },
  category: {
    type: String,
    enum: ['general', 'crop-management', 'livestock', 'technology', 'market-news', 'weather', 'other']
  },
  tags: [String],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    date: Date,
    likes: Number
  }],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Community Group Schema
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  category: {
    type: String,
    enum: ['organic-farming', 'dairy', 'hydroponics', 'technology', 'regional', 'crop-specific', 'general'],
    required: true
  },
  coverImage: String,
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedDate: Date,
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  stats: {
    memberCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    }
  },
  rules: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Knowledge Article Schema
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: String,
  coverImage: String,
  category: {
    type: String,
    enum: ['soil-health', 'pest-control', 'irrigation', 'crop-rotation', 'organic-farming', 'technology', 'market-trends', 'climate', 'other'],
    required: true
  },
  tags: [String],
  readTime: Number, // in minutes
  language: {
    type: String,
    enum: ['en', 'si', 'ta'],
    default: 'en'
  },
  attachments: [{
    name: String,
    type: String,
    url: String
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Expert Session Schema
const expertSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: String,
  description: String,
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  type: {
    type: String,
    enum: ['ama', 'webinar', 'workshop', 'q&a'],
    default: 'ama'
  },
  platform: String, // 'zoom', 'meet', 'in-platform'
  meetingLink: String,
  maxParticipants: Number,
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredDate: Date
  }],
  questions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    question: String,
    answer: String,
    upvotes: Number,
    date: Date
  }],
  recording: {
    available: Boolean,
    url: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);
const Group = mongoose.model('Group', groupSchema);
const Article = mongoose.model('Article', articleSchema);
const ExpertSession = mongoose.model('ExpertSession', expertSessionSchema);

module.exports = { Post, Group, Article, ExpertSession };
