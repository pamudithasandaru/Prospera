const mongoose = require('mongoose');

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['crop-management', 'livestock', 'technology', 'business', 'soil-science', 'irrigation', 'organic-farming', 'pest-management', 'other'],
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    enum: ['en', 'si', 'ta'],
    default: 'en'
  },
  thumbnail: String,
  duration: {
    hours: Number,
    minutes: Number
  },
  modules: [{
    title: String,
    description: String,
    order: Number,
    lessons: [{
      title: String,
      type: {
        type: String,
        enum: ['video', 'article', 'quiz', 'assignment']
      },
      content: String,
      videoUrl: String,
      duration: Number, // in minutes
      order: Number,
      resources: [{
        name: String,
        type: String,
        url: String
      }]
    }]
  }],
  assessments: [{
    title: String,
    type: {
      type: String,
      enum: ['quiz', 'assignment', 'exam']
    },
    passingScore: Number,
    questions: [{
      question: String,
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer']
      },
      options: [String],
      correctAnswer: String,
      points: Number
    }]
  }],
  certificate: {
    available: Boolean,
    template: String,
    criteria: {
      completionPercentage: Number,
      minimumScore: Number
    }
  },
  enrollment: {
    count: {
      type: Number,
      default: 0
    },
    students: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      enrolledDate: Date,
      progress: {
        type: Number,
        default: 0
      },
      completedLessons: [mongoose.Schema.Types.ObjectId],
      score: Number,
      certificateIssued: Boolean,
      certificateUrl: String,
      completedDate: Date
    }]
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
      date: Date
    }]
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: true
  },
  price: Number
}, {
  timestamps: true
});

// Career Path Schema
const careerPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  category: {
    type: String,
    enum: ['crop-specialist', 'soil-technician', 'greenhouse-manager', 'agricultural-engineer', 'farm-manager', 'other']
  },
  level: {
    type: String,
    enum: ['entry', 'intermediate', 'expert']
  },
  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    order: Number,
    mandatory: Boolean
  }],
  skills: [String],
  estimatedDuration: String, // "3 months", "6 months"
  certifications: [String],
  jobOpportunities: [String],
  averageSalary: {
    min: Number,
    max: Number,
    currency: String
  }
}, {
  timestamps: true
});

// Skill Test Schema
const skillTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: String,
  description: String,
  duration: Number, // in minutes
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'practical']
    },
    options: [String],
    correctAnswer: String,
    points: Number,
    explanation: String
  }],
  passingScore: {
    type: Number,
    required: true
  },
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    passed: Boolean,
    date: Date,
    answers: [mongoose.Schema.Types.Mixed]
  }],
  leaderboard: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    rank: Number,
    date: Date
  }]
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
const CareerPath = mongoose.model('CareerPath', careerPathSchema);
const SkillTest = mongoose.model('SkillTest', skillTestSchema);

module.exports = { Course, CareerPath, SkillTest };
