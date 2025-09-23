const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Match details
  status: {
    type: String,
    enum: ['pending', 'matched', 'rejected', 'expired'],
    default: 'pending'
  },
  
  // Who initiated the match (liked first)
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Compatibility score when matched
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Match method/source
  matchedVia: {
    type: String,
    enum: ['swipe', 'search', 'recommendation', 'interest-based', 'location-based'],
    default: 'swipe'
  },
  
  // Interaction tracking
  interactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['like', 'super-like', 'pass', 'block', 'report']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Conversation status
  conversation: {
    isStarted: { type: Boolean, default: false },
    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: Date,
    lastMessageAt: Date,
    messageCount: { type: Number, default: 0 }
  },
  
  // Virtual date information
  virtualDate: {
    isScheduled: { type: Boolean, default: false },
    scheduledAt: Date,
    activity: String,
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  },
  
  // Match expiry (if no conversation started)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  },
  
  // Metadata
  metadata: {
    mutualFriends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    commonInterests: [String],
    locationDistance: Number // in miles
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
matchSchema.index({ users: 1, status: 1 });
matchSchema.index({ initiator: 1, createdAt: -1 });
matchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual to get the other user in a match
matchSchema.virtual('otherUser').get(function() {
  return this.users.find(user => user.toString() !== this.currentUser?.toString());
});

// Static method to find matches for a user
matchSchema.statics.findUserMatches = function(userId, status = 'matched') {
  return this.find({
    users: userId,
    status: status
  }).populate('users', '-password').sort({ createdAt: -1 });
};

// Static method to check if two users have already interacted
matchSchema.statics.hasInteraction = async function(userId1, userId2) {
  const match = await this.findOne({
    users: { $all: [userId1, userId2] }
  });
  
  if (!match) return false;
  
  const interaction = match.interactions.find(
    interaction => interaction.user.toString() === userId1.toString()
  );
  
  return interaction ? interaction.action : false;
};

// Instance method to add interaction
matchSchema.methods.addInteraction = function(userId, action) {
  // Remove any existing interaction from this user
  this.interactions = this.interactions.filter(
    interaction => interaction.user.toString() !== userId.toString()
  );
  
  // Add new interaction
  this.interactions.push({
    user: userId,
    action: action,
    timestamp: new Date()
  });
  
  // Update match status based on interactions
  const interactions = this.interactions;
  const hasLike = interactions.some(i => ['like', 'super-like'].includes(i.action));
  const otherUserLike = interactions.find(i => 
    i.user.toString() !== userId.toString() && ['like', 'super-like'].includes(i.action)
  );
  
  if (hasLike && otherUserLike && this.status === 'pending') {
    this.status = 'matched';
  } else if (action === 'pass' || action === 'block') {
    this.status = 'rejected';
  }
};

// Instance method to start conversation
matchSchema.methods.startConversation = function(userId) {
  if (this.status !== 'matched') {
    throw new Error('Can only start conversation with matched users');
  }
  
  this.conversation.isStarted = true;
  this.conversation.startedBy = userId;
  this.conversation.startedAt = new Date();
};

// Instance method to update last message info
matchSchema.methods.updateLastMessage = function() {
  this.conversation.lastMessageAt = new Date();
  this.conversation.messageCount += 1;
};

// Pre-save middleware to calculate compatibility score
matchSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'matched') {
    try {
      const User = mongoose.model('User');
      const users = await User.find({ _id: { $in: this.users } });
      
      if (users.length === 2) {
        this.compatibilityScore = users[0].calculateCompatibility(users[1]);
        
        // Calculate common interests
        const commonInterests = users[0].interests
          .filter(interest1 => 
            users[1].interests.some(interest2 => 
              interest1.category === interest2.category && interest1.name === interest2.name
            )
          )
          .map(interest => interest.name);
        
        this.metadata.commonInterests = commonInterests;
      }
    } catch (error) {
      console.error('Error calculating compatibility:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Match', matchSchema);