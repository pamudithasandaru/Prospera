const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'expert', 'government', 'admin'],
    default: 'farmer'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Sri Lanka' },
    postalCode: String
  },
  profile: {
    avatar: String,
    bio: String,
    language: {
      type: String,
      enum: ['en', 'si', 'ta'],
      default: 'en'
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationBadge: {
      type: String,
      enum: ['none', 'government', 'expert', 'premium'],
      default: 'none'
    }
  },
  farmDetails: {
    landSize: Number, // in acres
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      region: String,
      district: String
    },
    soilType: String,
    waterSource: String,
    crops: [String]
  },
  stats: {
    completedCourses: { type: Number, default: 0 },
    certificates: [{ 
      courseId: mongoose.Schema.Types.ObjectId,
      issuedDate: Date,
      certificateUrl: String
    }],
    reputation: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 }
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
