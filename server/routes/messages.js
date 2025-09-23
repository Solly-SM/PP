const express = require('express');
const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages/send
// @desc    Send a message
// @access  Private
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { matchId, content, type = 'text' } = req.body;

    if (!matchId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Match ID and content are required'
      });
    }

    // Validate match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const isPartOfMatch = match.users.some(userId => 
      userId.toString() === req.user._id.toString()
    );

    if (!isPartOfMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (match.status !== 'matched') {
      return res.status(400).json({
        success: false,
        message: 'Can only send messages to matched users'
      });
    }

    // Get receiver
    const receiverId = match.users.find(userId => 
      userId.toString() !== req.user._id.toString()
    );

    // Create message
    const message = new Message({
      match: matchId,
      sender: req.user._id,
      receiver: receiverId,
      content: {
        text: typeof content === 'string' ? content : content.text,
        type: type,
        media: content.media
      }
    });

    // Check if this is the first message
    const messageCount = await Message.countDocuments({ match: matchId });
    if (messageCount === 0) {
      message.isConversationStarter = true;
      
      // Start conversation in match
      match.startConversation(req.user._id);
      await match.save();

      // Update conversation stats
      await Promise.all([
        User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.conversations': 1 } }),
        User.findByIdAndUpdate(receiverId, { $inc: { 'stats.conversations': 1 } })
      ]);
    }

    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'firstName lastName photos');

    res.json({
      success: true,
      message: 'Message sent successfully!',
      data: {
        _id: message._id,
        match: message.match,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        status: message.status,
        isConversationStarter: message.isConversationStarter,
        createdAt: message.createdAt,
        formattedTime: message.formattedTime
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// @route   GET /api/messages/:matchId
// @desc    Get messages for a specific match
// @access  Private
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const matchId = req.params.matchId;

    // Validate match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const isPartOfMatch = match.users.some(userId => 
      userId.toString() === req.user._id.toString()
    );

    if (!isPartOfMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages
    const messages = await Message.getConversation(matchId, parseInt(page), parseInt(limit));
    
    // Mark messages as read
    await Message.markAsRead(matchId, req.user._id);

    // Get total count
    const totalMessages = await Message.countDocuments({ match: matchId });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// @route   POST /api/messages/:messageId/react
// @desc    Add/remove reaction to a message
// @access  Private
router.post('/:messageId/react', authMiddleware, async (req, res) => {
  try {
    const { emoji } = req.body;
    const messageId = req.params.messageId;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user is part of the conversation
    const match = await Match.findById(message.match);
    const isPartOfMatch = match.users.some(userId => 
      userId.toString() === req.user._id.toString()
    );

    if (!isPartOfMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.user.toString() === req.user._id.toString()
    );

    if (existingReaction && existingReaction.emoji === emoji) {
      // Remove reaction
      message.removeReaction(req.user._id);
    } else {
      // Add/update reaction
      message.addReaction(req.user._id, emoji);
    }

    await message.save();

    res.json({
      success: true,
      message: 'Reaction updated successfully',
      reactions: message.reactions
    });

  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reaction',
      error: error.message
    });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user._id);

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get matches with conversations
    const matches = await Match.find({
      users: req.user._id,
      status: 'matched',
      'conversation.isStarted': true
    })
    .populate('users', 'firstName lastName photos lastActive isOnline')
    .sort({ 'conversation.lastMessageAt': -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    // Get last message for each conversation
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await Message.findOne({ match: match._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'firstName lastName');

        const otherUser = match.users.find(user => 
          user._id.toString() !== req.user._id.toString()
        );

        const unreadCount = await Message.countDocuments({
          match: match._id,
          receiver: req.user._id,
          status: { $ne: 'read' }
        });

        return {
          matchId: match._id,
          otherUser: {
            _id: otherUser._id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            photos: otherUser.photos,
            lastActive: otherUser.lastActive,
            isOnline: otherUser.isOnline
          },
          lastMessage: lastMessage ? {
            _id: lastMessage._id,
            content: lastMessage.content,
            sender: lastMessage.sender,
            createdAt: lastMessage.createdAt,
            formattedTime: lastMessage.formattedTime
          } : null,
          unreadCount,
          conversationStartedAt: match.conversation.startedAt,
          messageCount: match.conversation.messageCount
        };
      })
    );

    const totalConversations = await Match.countDocuments({
      users: req.user._id,
      status: 'matched',
      'conversation.isStarted': true
    });

    res.json({
      success: true,
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalConversations,
        pages: Math.ceil(totalConversations / limit)
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
});

// @route   GET /api/messages/starters
// @desc    Get conversation starters
// @access  Private
router.get('/starters/:category?', authMiddleware, async (req, res) => {
  try {
    const category = req.params.category;
    const starters = Message.getConversationStarters(category);

    res.json({
      success: true,
      category: category || 'all',
      starters: starters.slice(0, 10) // Return 10 random starters
    });

  } catch (error) {
    console.error('Get conversation starters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation starters',
      error: error.message
    });
  }
});

// @route   POST /api/messages/starters/personalized
// @desc    Get personalized conversation starters based on match
// @access  Private
router.post('/starters/personalized', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({
        success: false,
        message: 'Match ID is required'
      });
    }

    // Get match with user details
    const match = await Match.findById(matchId)
      .populate('users', 'firstName interests lifestyle location');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const isPartOfMatch = match.users.some(userId => 
      userId.toString() === req.user._id.toString()
    );

    if (!isPartOfMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const otherUser = match.users.find(user => 
      user._id.toString() !== req.user._id.toString()
    );

    const personalizedStarters = [];

    // Interest-based starters
    if (otherUser.interests && otherUser.interests.length > 0) {
      const randomInterest = otherUser.interests[Math.floor(Math.random() * otherUser.interests.length)];
      personalizedStarters.push(
        `I see you're into ${randomInterest.name}! How did you get started with that?`,
        `${randomInterest.name} is so cool! What's your favorite thing about it?`
      );
    }

    // Location-based starters
    if (otherUser.location && otherUser.location.city) {
      personalizedStarters.push(
        `I love ${otherUser.location.city}! What's your favorite spot there?`,
        `How long have you been in ${otherUser.location.city}? Any hidden gems you'd recommend?`
      );
    }

    // Lifestyle-based starters
    if (otherUser.lifestyle) {
      if (otherUser.lifestyle.occupation) {
        personalizedStarters.push(
          `Your work sounds interesting! What's the best part about being in ${otherUser.lifestyle.occupation}?`
        );
      }
      
      if (otherUser.lifestyle.exercise === 'regularly' || otherUser.lifestyle.exercise === 'daily') {
        personalizedStarters.push(
          `I noticed you're into fitness! What's your favorite way to stay active?`
        );
      }
    }

    // Common interests starters
    if (match.metadata && match.metadata.commonInterests && match.metadata.commonInterests.length > 0) {
      const commonInterest = match.metadata.commonInterests[0];
      personalizedStarters.push(
        `I love that we both enjoy ${commonInterest}! What got you into it?`,
        `Fellow ${commonInterest} enthusiast! What's your experience level?`
      );
    }

    // Fallback to general starters if no personalized ones
    if (personalizedStarters.length === 0) {
      personalizedStarters.push(...Message.getConversationStarters('general').slice(0, 5));
    }

    res.json({
      success: true,
      personalizedStarters: personalizedStarters.slice(0, 8),
      compatibilityScore: match.compatibilityScore,
      commonInterests: match.metadata?.commonInterests || []
    });

  } catch (error) {
    console.error('Get personalized starters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personalized starters',
      error: error.message
    });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Check if message is too old to delete (e.g., 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (message.createdAt < tenMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to delete'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

module.exports = router;