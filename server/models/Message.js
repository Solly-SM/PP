const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Reference to the match this message belongs to
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  
  // Sender information
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Receiver information
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message content
  content: {
    text: {
      type: String,
      maxlength: [1000, 'Message must be less than 1000 characters']
    },
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'gif', 'sticker', 'location'],
      default: 'text'
    },
    media: {
      url: String,
      filename: String,
      size: Number,
      mimetype: String
    }
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Read receipt
  readAt: Date,
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  
  // Special message types
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  
  systemMessageType: {
    type: String,
    enum: ['match', 'first-message', 'virtual-date', 'reminder'],
  },
  
  // Reply information (for threading)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Conversation starter information
  isConversationStarter: {
    type: Boolean,
    default: false
  },
  
  conversationStarterData: {
    category: String,
    prompt: String,
    isAIGenerated: { type: Boolean, default: false }
  },
  
  // Reactions/emojis
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message metadata
  metadata: {
    editedAt: Date,
    isEdited: { type: Boolean, default: false },
    originalContent: String,
    translatedContent: [{
      language: String,
      text: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
messageSchema.index({ match: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, status: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  const now = new Date();
  const messageTime = this.createdAt;
  const diff = now - messageTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return messageTime.toLocaleDateString();
});

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(matchId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ match: matchId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'firstName lastName photos')
    .populate('receiver', 'firstName lastName photos')
    .populate('replyTo', 'content.text sender');
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    status: { $ne: 'read' }
  });
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function(matchId, userId) {
  const result = await this.updateMany(
    {
      match: matchId,
      receiver: userId,
      status: { $ne: 'read' }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );
  
  return result.modifiedCount;
};

// Static method to get conversation starters
messageSchema.statics.getConversationStarters = function(category = null) {
  const starters = {
    general: [
      "What's your favorite way to spend a weekend?",
      "If you could travel anywhere right now, where would you go?",
      "What's something you've learned recently that surprised you?",
      "What's your go-to comfort food?",
      "What's the best advice you've ever received?"
    ],
    hobbies: [
      "What hobby have you always wanted to try?",
      "What's something you're passionate about that most people don't know?",
      "If you had unlimited time, what would you learn?",
      "What's your favorite way to be creative?",
      "What activity makes you lose track of time?"
    ],
    lifestyle: [
      "Are you a morning person or a night owl?",
      "What's your ideal way to unwind after a long day?",
      "Coffee or tea? And how do you take it?",
      "What's something you can't live without?",
      "What does your perfect day look like?"
    ],
    fun: [
      "What's the most spontaneous thing you've ever done?",
      "If you could have dinner with anyone, dead or alive, who would it be?",
      "What's your hidden talent?",
      "What's the best concert or live show you've ever been to?",
      "If you could have any superpower, what would it be?"
    ]
  };
  
  if (category && starters[category]) {
    return starters[category];
  }
  
  // Return all starters if no category specified
  return Object.values(starters).flat();
};

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    addedAt: new Date()
  });
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
};

// Pre-save middleware to update match's last message info
messageSchema.pre('save', async function(next) {
  if (this.isNew && !this.isSystemMessage) {
    try {
      const Match = mongoose.model('Match');
      const match = await Match.findById(this.match);
      if (match) {
        match.updateLastMessage();
        await match.save();
      }
    } catch (error) {
      console.error('Error updating match last message:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);