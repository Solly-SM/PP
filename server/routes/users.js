const express = require('express');
const User = require('../models/User');
const Match = require('../models/Match');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:id?
// @desc    Get user profile (own or others)
// @access  Private
router.get('/profile/:id?', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const isOwnProfile = userId.toString() === req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is blocked
    if (user.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot view this profile'
      });
    }

    // Increment profile views if viewing someone else's profile
    if (!isOwnProfile) {
      user.stats.profileViews += 1;
      await user.save();
    }

    // Prepare user response based on privacy settings
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.privacySettings.showAge || isOwnProfile ? user.age : null,
      gender: user.gender,
      bio: user.bio,
      photos: user.photos,
      interests: user.interests,
      lifestyle: user.lifestyle,
      location: user.privacySettings.showLocation || isOwnProfile ? user.location : null,
      lastActive: user.privacySettings.showLastActive || isOwnProfile ? user.lastActive : null,
      isOnline: user.isOnline,
      isVerified: user.isVerified,
      isPremium: user.isPremium
    };

    // Include private info if own profile
    if (isOwnProfile) {
      userResponse.email = user.email;
      userResponse.preferences = user.preferences;
      userResponse.privacySettings = user.privacySettings;
      userResponse.stats = user.stats;
      userResponse.interestedIn = user.interestedIn;
      userResponse.blockedUsers = user.blockedUsers;
    }

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);

    // Fields that can be updated
    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'location', 'interests', 'lifestyle',
      'preferences', 'privacySettings', 'interestedIn'
    ];

    // Filter and apply updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Apply updates
    Object.keys(filteredUpdates).forEach(key => {
      user[key] = filteredUpdates[key];
    });

    await user.save();

    // Return updated user
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender,
      interestedIn: user.interestedIn,
      bio: user.bio,
      photos: user.photos,
      location: user.location,
      interests: user.interests,
      lifestyle: user.lifestyle,
      preferences: user.preferences,
      privacySettings: user.privacySettings,
      stats: user.stats,
      isVerified: user.isVerified,
      isPremium: user.isPremium,
      lastActive: user.lastActive,
      isOnline: user.isOnline
    };

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @route   POST /api/users/photos
// @desc    Upload profile photos
// @access  Private
router.post('/photos', authMiddleware, async (req, res) => {
  try {
    const { url, isPrimary = false } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required'
      });
    }

    const user = await User.findById(req.user._id);

    // If setting as primary, remove primary from other photos
    if (isPrimary) {
      user.photos.forEach(photo => {
        photo.isPrimary = false;
      });
    }

    // Add new photo
    user.photos.push({
      url,
      isPrimary,
      uploadedAt: new Date()
    });

    // Limit to 6 photos
    if (user.photos.length > 6) {
      user.photos = user.photos.slice(-6);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Photo uploaded successfully!',
      photos: user.photos
    });

  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/photos/:photoIndex
// @desc    Delete profile photo
// @access  Private
router.delete('/photos/:photoIndex', authMiddleware, async (req, res) => {
  try {
    const photoIndex = parseInt(req.params.photoIndex);
    const user = await User.findById(req.user._id);

    if (photoIndex < 0 || photoIndex >= user.photos.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo index'
      });
    }

    user.photos.splice(photoIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully!',
      photos: user.photos
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo',
      error: error.message
    });
  }
});

// @route   GET /api/users/discover
// @desc    Get potential matches for discovery
// @access  Private
router.get('/discover', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.user._id);

    // Get users that current user has already interacted with
    const existingMatches = await Match.find({
      users: req.user._id
    }).distinct('users');

    // Find potential matches
    const potentialMatches = await User.findPotentialMatches(req.user._id, {
      interestedIn: user.interestedIn,
      ageRange: user.preferences.ageRange
    })
    .where('_id').nin(existingMatches) // Exclude users already interacted with
    .where('blockedUsers').ne(req.user._id) // Exclude users who blocked current user
    .limit(limit * page)
    .select('firstName lastName age gender bio photos interests location lastActive isOnline isVerified');

    // Calculate compatibility scores and sort
    const matchesWithCompatibility = potentialMatches
      .slice((page - 1) * limit, page * limit)
      .map(potentialMatch => ({
        ...potentialMatch.toObject(),
        compatibilityScore: user.calculateCompatibility(potentialMatch)
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      success: true,
      matches: matchesWithCompatibility,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: potentialMatches.length > page * limit
      }
    });

  } catch (error) {
    console.error('Discover users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover users',
      error: error.message
    });
  }
});

// @route   POST /api/users/report
// @desc    Report a user
// @access  Private
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const { userId, reason, description } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID and reason are required'
      });
    }

    const reportedUser = await User.findById(userId);
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add to user's reported list
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.reportedUsers.includes(userId)) {
      currentUser.reportedUsers.push(userId);
      await currentUser.save();
    }

    // In a production app, you'd save the report to a separate Reports collection
    console.log(`User ${req.user._id} reported user ${userId} for: ${reason} - ${description}`);

    res.json({
      success: true,
      message: 'User reported successfully. Thank you for helping keep our community safe.'
    });

  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report user',
      error: error.message
    });
  }
});

// @route   POST /api/users/block
// @desc    Block a user
// @access  Private
router.post('/block', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself'
      });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser.blockedUsers.includes(userId)) {
      currentUser.blockedUsers.push(userId);
      await currentUser.save();
    }

    // Remove any existing matches
    await Match.deleteMany({
      users: { $all: [req.user._id, userId] }
    });

    res.json({
      success: true,
      message: 'User blocked successfully'
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error.message
    });
  }
});

// @route   POST /api/users/unblock
// @desc    Unblock a user
// @access  Private
router.post('/unblock', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const currentUser = await User.findById(req.user._id);
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== userId.toString()
    );
    await currentUser.save();

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: error.message
    });
  }
});

// @route   GET /api/users/blocked
// @desc    Get blocked users list
// @access  Private
router.get('/blocked', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', 'firstName lastName photos');

    res.json({
      success: true,
      blockedUsers: user.blockedUsers
    });

  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked users',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get additional stats
    const matchCount = await Match.countDocuments({
      users: req.user._id,
      status: 'matched'
    });
    
    const conversationCount = await Match.countDocuments({
      users: req.user._id,
      'conversation.isStarted': true
    });

    const stats = {
      ...user.stats.toObject(),
      matches: matchCount,
      conversations: conversationCount,
      profileCompletion: calculateProfileCompletion(user)
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// Helper function to calculate profile completion
function calculateProfileCompletion(user) {
  let completion = 0;
  const totalFields = 8;

  if (user.firstName && user.lastName) completion++;
  if (user.bio) completion++;
  if (user.photos && user.photos.length > 0) completion++;
  if (user.location && user.location.city) completion++;
  if (user.interests && user.interests.length > 0) completion++;
  if (user.lifestyle && user.lifestyle.occupation) completion++;
  if (user.preferences && user.preferences.ageRange) completion++;
  if (user.isVerified) completion++;

  return Math.round((completion / totalFields) * 100);
}

module.exports = router;