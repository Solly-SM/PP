const express = require('express');
const User = require('../models/User');
const Match = require('../models/Match');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/matches/swipe
// @desc    Swipe on a user (like/pass)
// @access  Private
router.post('/swipe', authMiddleware, async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'like', 'super-like', 'pass'

    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        message: 'User ID and action are required'
      });
    }

    if (!['like', 'super-like', 'pass'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be like, super-like, or pass'
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot swipe on yourself'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if users have already interacted
    let match = await Match.findOne({
      users: { $all: [req.user._id, userId] }
    });

    if (match) {
      // Check if current user already swiped
      const existingInteraction = match.interactions.find(
        interaction => interaction.user.toString() === req.user._id.toString()
      );

      if (existingInteraction) {
        return res.status(400).json({
          success: false,
          message: 'You have already swiped on this user'
        });
      }
    } else {
      // Create new match document
      match = new Match({
        users: [req.user._id, userId],
        initiator: req.user._id,
        matchedVia: 'swipe'
      });
    }

    // Add interaction
    match.addInteraction(req.user._id, action);

    // Calculate compatibility score if it's a new match
    if (match.status === 'matched' && !match.compatibilityScore) {
      const currentUser = await User.findById(req.user._id);
      match.compatibilityScore = currentUser.calculateCompatibility(targetUser);
    }

    await match.save();

    // Update user stats
    if (action === 'like' || action === 'super-like') {
      await User.findByIdAndUpdate(targetUser._id, {
        $inc: { 'stats.likes': 1 }
      });
    }

    const response = {
      success: true,
      message: `Successfully ${action === 'pass' ? 'passed' : 'liked'} user`,
      match: {
        id: match._id,
        status: match.status,
        compatibilityScore: match.compatibilityScore
      }
    };

    // If it's a match, include additional info
    if (match.status === 'matched') {
      response.message = "It's a match! 💖";
      response.isNewMatch = true;
      response.match.matchedAt = match.updatedAt;
      
      // Update both users' match counts
      await Promise.all([
        User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.matches': 1 } }),
        User.findByIdAndUpdate(userId, { $inc: { 'stats.matches': 1 } })
      ]);
    }

    res.json(response);

  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process swipe',
      error: error.message
    });
  }
});

// @route   GET /api/matches
// @desc    Get user's matches
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'matched' } = req.query;
    const skip = (page - 1) * limit;

    const matches = await Match.find({
      users: req.user._id,
      status: status
    })
    .populate('users', 'firstName lastName age gender photos bio location lastActive isOnline isVerified')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Transform matches to include other user info
    const transformedMatches = matches.map(match => {
      const otherUser = match.users.find(user => 
        user._id.toString() !== req.user._id.toString()
      );

      return {
        id: match._id,
        status: match.status,
        compatibilityScore: match.compatibilityScore,
        matchedAt: match.createdAt,
        matchedVia: match.matchedVia,
        conversation: match.conversation,
        virtualDate: match.virtualDate,
        metadata: match.metadata,
        otherUser: {
          _id: otherUser._id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          age: otherUser.age,
          gender: otherUser.gender,
          photos: otherUser.photos,
          bio: otherUser.bio,
          location: otherUser.location,
          lastActive: otherUser.lastActive,
          isOnline: otherUser.isOnline,
          isVerified: otherUser.isVerified
        }
      };
    });

    const totalMatches = await Match.countDocuments({
      users: req.user._id,
      status: status
    });

    res.json({
      success: true,
      matches: transformedMatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMatches,
        pages: Math.ceil(totalMatches / limit)
      }
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get matches',
      error: error.message
    });
  }
});

// @route   GET /api/matches/:matchId
// @desc    Get specific match details
// @access  Private
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('users', 'firstName lastName age gender photos bio location interests lifestyle lastActive isOnline isVerified');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if current user is part of this match
    const isPartOfMatch = match.users.some(user => 
      user._id.toString() === req.user._id.toString()
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

    const response = {
      id: match._id,
      status: match.status,
      compatibilityScore: match.compatibilityScore,
      matchedAt: match.createdAt,
      matchedVia: match.matchedVia,
      conversation: match.conversation,
      virtualDate: match.virtualDate,
      metadata: match.metadata,
      interactions: match.interactions,
      otherUser: {
        _id: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        age: otherUser.age,
        gender: otherUser.gender,
        photos: otherUser.photos,
        bio: otherUser.bio,
        location: otherUser.location,
        interests: otherUser.interests,
        lifestyle: otherUser.lifestyle,
        lastActive: otherUser.lastActive,
        isOnline: otherUser.isOnline,
        isVerified: otherUser.isVerified
      }
    };

    res.json({
      success: true,
      match: response
    });

  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get match details',
      error: error.message
    });
  }
});

// @route   POST /api/matches/:matchId/unmatch
// @desc    Unmatch with a user
// @access  Private
router.post('/:matchId/unmatch', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if current user is part of this match
    const isPartOfMatch = match.users.some(userId => 
      userId.toString() === req.user._id.toString()
    );

    if (!isPartOfMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete the match
    await Match.findByIdAndDelete(req.params.matchId);

    // Update match counts for both users
    await Promise.all(
      match.users.map(userId => 
        User.findByIdAndUpdate(userId, { $inc: { 'stats.matches': -1 } })
      )
    );

    res.json({
      success: true,
      message: 'Successfully unmatched'
    });

  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unmatch',
      error: error.message
    });
  }
});

// @route   POST /api/matches/:matchId/schedule-date
// @desc    Schedule a virtual date
// @access  Private
router.post('/:matchId/schedule-date', authMiddleware, async (req, res) => {
  try {
    const { scheduledAt, activity } = req.body;

    if (!scheduledAt || !activity) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time and activity are required'
      });
    }

    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if current user is part of this match
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
        message: 'Can only schedule dates with matched users'
      });
    }

    // Update virtual date info
    match.virtualDate = {
      isScheduled: true,
      scheduledAt: new Date(scheduledAt),
      activity: activity,
      status: 'scheduled'
    };

    await match.save();

    res.json({
      success: true,
      message: 'Virtual date scheduled successfully!',
      virtualDate: match.virtualDate
    });

  } catch (error) {
    console.error('Schedule date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule date',
      error: error.message
    });
  }
});

// @route   GET /api/matches/recommendations/:userId?
// @desc    Get recommended matches based on advanced algorithm
// @access  Private
router.get('/recommendations/:userId?', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.user._id;
    const { limit = 10 } = req.query;

    const currentUser = await User.findById(targetUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get users that current user has already interacted with
    const existingMatches = await Match.find({
      users: targetUserId
    }).distinct('users');

    // Find potential matches
    const potentialMatches = await User.findPotentialMatches(targetUserId, {
      interestedIn: currentUser.interestedIn,
      ageRange: currentUser.preferences.ageRange
    })
    .where('_id').nin(existingMatches)
    .where('blockedUsers').ne(targetUserId)
    .limit(limit * 2); // Get more for better filtering

    // Advanced compatibility scoring with multiple factors
    const recommendations = potentialMatches
      .map(potentialMatch => {
        const compatibility = currentUser.calculateCompatibility(potentialMatch);
        
        // Additional scoring factors
        let bonus = 0;
        
        // Online users get priority
        if (potentialMatch.isOnline) bonus += 5;
        
        // Verified users get priority
        if (potentialMatch.isVerified) bonus += 3;
        
        // Recent activity gets priority
        const daysSinceActive = Math.floor((Date.now() - potentialMatch.lastActive) / (24 * 60 * 60 * 1000));
        if (daysSinceActive < 1) bonus += 5;
        else if (daysSinceActive < 7) bonus += 2;
        
        // Profile completeness bonus
        const hasPhoto = potentialMatch.photos && potentialMatch.photos.length > 0;
        const hasBio = potentialMatch.bio && potentialMatch.bio.length > 50;
        const hasInterests = potentialMatch.interests && potentialMatch.interests.length > 3;
        
        if (hasPhoto && hasBio && hasInterests) bonus += 10;
        else if (hasPhoto && hasBio) bonus += 5;
        else if (hasPhoto) bonus += 2;

        const finalScore = Math.min(100, compatibility + bonus);

        return {
          _id: potentialMatch._id,
          firstName: potentialMatch.firstName,
          lastName: potentialMatch.lastName,
          age: potentialMatch.age,
          gender: potentialMatch.gender,
          photos: potentialMatch.photos,
          bio: potentialMatch.bio,
          interests: potentialMatch.interests,
          location: potentialMatch.location,
          lastActive: potentialMatch.lastActive,
          isOnline: potentialMatch.isOnline,
          isVerified: potentialMatch.isVerified,
          compatibilityScore: finalScore,
          recommendationReasons: getRecommendationReasons(currentUser, potentialMatch)
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);

    res.json({
      success: true,
      message: `Found ${recommendations.length} recommended matches`,
      recommendations
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Helper function to generate recommendation reasons
function getRecommendationReasons(currentUser, potentialMatch) {
  const reasons = [];

  // Age compatibility
  const ageDiff = Math.abs(currentUser.age - potentialMatch.age);
  if (ageDiff <= 3) {
    reasons.push('Similar age');
  }

  // Common interests
  if (currentUser.interests && potentialMatch.interests) {
    const commonInterests = currentUser.interests.filter(interest1 => 
      potentialMatch.interests.some(interest2 => 
        interest1.name === interest2.name
      )
    );
    
    if (commonInterests.length > 0) {
      reasons.push(`${commonInterests.length} shared interest${commonInterests.length > 1 ? 's' : ''}`);
    }
  }

  // Location proximity
  if (currentUser.location?.city && potentialMatch.location?.city) {
    if (currentUser.location.city === potentialMatch.location.city) {
      reasons.push('Same city');
    } else if (currentUser.location.state === potentialMatch.location.state) {
      reasons.push('Same state');
    }
  }

  // Lifestyle compatibility
  if (currentUser.lifestyle && potentialMatch.lifestyle) {
    if (currentUser.lifestyle.education?.level === potentialMatch.lifestyle.education?.level) {
      reasons.push('Similar education');
    }
    
    if (currentUser.lifestyle.exercise === potentialMatch.lifestyle.exercise) {
      reasons.push('Similar fitness habits');
    }
  }

  // Recent activity
  const daysSinceActive = Math.floor((Date.now() - potentialMatch.lastActive) / (24 * 60 * 60 * 1000));
  if (daysSinceActive < 1) {
    reasons.push('Recently active');
  }

  // Verification
  if (potentialMatch.isVerified) {
    reasons.push('Verified profile');
  }

  return reasons.slice(0, 3); // Return top 3 reasons
}

module.exports = router;