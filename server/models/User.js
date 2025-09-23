const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name must be less than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name must be less than 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        const age = Math.floor((Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 18 && age <= 100;
      },
      message: 'You must be between 18 and 100 years old'
    }
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']
  },
  interestedIn: [{
    type: String,
    enum: ['male', 'female', 'non-binary', 'other']
  }],

  // Profile Information
  bio: {
    type: String,
    maxlength: [500, 'Bio must be less than 500 characters'],
    trim: true
  },
  photos: [{
    url: String,
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Interests and Preferences
  interests: [{
    category: String,
    name: String,
    level: { type: Number, min: 1, max: 5, default: 3 } // 1-5 interest level
  }],
  lifestyle: {
    occupation: String,
    education: {
      level: String,
      field: String,
      school: String
    },
    smoking: { type: String, enum: ['never', 'socially', 'regularly', 'trying-to-quit'] },
    drinking: { type: String, enum: ['never', 'socially', 'regularly'] },
    exercise: { type: String, enum: ['never', 'sometimes', 'regularly', 'daily'] },
    diet: { type: String, enum: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'other'] },
    pets: { type: String, enum: ['love', 'like', 'allergic', 'none'] },
    children: { type: String, enum: ['have', 'want', 'dont-want', 'maybe'] }
  },

  // Matching Preferences
  preferences: {
    ageRange: {
      min: { type: Number, min: 18, max: 100, default: 22 },
      max: { type: Number, min: 18, max: 100, default: 35 }
    },
    maxDistance: { type: Number, default: 50 }, // in miles
    dealBreakers: [{
      category: String,
      value: String
    }]
  },

  // App Specific
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  lastActive: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  
  // Privacy Settings
  privacySettings: {
    showAge: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
    showLastActive: { type: Boolean, default: true }
  },

  // Matching Statistics
  stats: {
    profileViews: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    matches: { type: Number, default: 0 },
    conversations: { type: Number, default: 0 }
  },

  // Account Status
  isPremium: { type: Boolean, default: false },
  premiumExpiry: Date,
  isBlocked: { type: Boolean, default: false },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Index for search optimization
userSchema.index({ firstName: 'text', lastName: 'text', bio: 'text' });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to calculate compatibility score with another user
userSchema.methods.calculateCompatibility = function(otherUser) {
  let score = 0;
  let factors = 0;

  // Age compatibility (20% weight)
  const ageDiff = Math.abs(this.age - otherUser.age);
  const ageScore = Math.max(0, 100 - (ageDiff * 5));
  score += ageScore * 0.2;
  factors++;

  // Interest compatibility (40% weight)
  if (this.interests.length > 0 && otherUser.interests.length > 0) {
    const commonInterests = this.interests.filter(interest1 => 
      otherUser.interests.some(interest2 => 
        interest1.category === interest2.category && interest1.name === interest2.name
      )
    );
    const interestScore = (commonInterests.length / Math.max(this.interests.length, otherUser.interests.length)) * 100;
    score += interestScore * 0.4;
    factors++;
  }

  // Lifestyle compatibility (30% weight)
  let lifestyleScore = 0;
  let lifestyleFactors = 0;
  
  const lifestyleKeys = ['smoking', 'drinking', 'exercise', 'diet'];
  lifestyleKeys.forEach(key => {
    if (this.lifestyle[key] && otherUser.lifestyle[key]) {
      lifestyleScore += this.lifestyle[key] === otherUser.lifestyle[key] ? 100 : 50;
      lifestyleFactors++;
    }
  });
  
  if (lifestyleFactors > 0) {
    score += (lifestyleScore / lifestyleFactors) * 0.3;
    factors++;
  }

  // Education compatibility (10% weight)
  if (this.lifestyle.education?.level && otherUser.lifestyle.education?.level) {
    const educationScore = this.lifestyle.education.level === otherUser.lifestyle.education.level ? 100 : 70;
    score += educationScore * 0.1;
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 50; // Default to 50% if no factors
};

// Static method to find potential matches
userSchema.statics.findPotentialMatches = function(userId, preferences = {}) {
  const query = {
    _id: { $ne: userId },
    isBlocked: false,
    blockedUsers: { $ne: userId }
  };

  // Add gender preference filter
  if (preferences.interestedIn && preferences.interestedIn.length > 0) {
    query.gender = { $in: preferences.interestedIn };
  }

  // Add age range filter
  if (preferences.ageRange) {
    const today = new Date();
    const maxAge = new Date(today.getFullYear() - preferences.ageRange.min, today.getMonth(), today.getDate());
    const minAge = new Date(today.getFullYear() - preferences.ageRange.max, today.getMonth(), today.getDate());
    query.dateOfBirth = { $gte: minAge, $lte: maxAge };
  }

  return this.find(query).select('-password');
};

module.exports = mongoose.model('User', userSchema);