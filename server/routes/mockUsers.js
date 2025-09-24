const express = require('express');
const mockStorage = require('../mockData');
const { mockAuthMiddleware } = require('./mockAuth');

const router = express.Router();

// @route   GET /api/mock-users/profile/:id?
// @desc    Get user profile (own or others)
// @access  Private
router.get('/profile/:id?', mockAuthMiddleware, (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const isOwnProfile = userId.toString() === req.user._id.toString();

    const user = mockStorage.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user profile
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      photos: user.photos,
      interests: user.interests,
      lifestyle: user.lifestyle,
      location: user.location,
      lastActive: user.lastActive,
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

// @route   PUT /api/mock-users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', mockAuthMiddleware, (req, res) => {
  try {
    const updates = req.body;
    
    // Fields that can be updated
    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'location', 'interests', 'lifestyle',
      'preferences', 'privacySettings', 'interestedIn'
    ];

    // Filter updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Update user
    const user = mockStorage.updateUser(req.user._id, filteredUpdates);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user
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

// @route   POST /api/mock-users/photos
// @desc    Upload profile photos
// @access  Private
router.post('/photos', mockAuthMiddleware, (req, res) => {
  try {
    const { url, isPrimary = false } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required'
      });
    }

    const user = mockStorage.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

    // Update user with new photos
    const updatedUser = mockStorage.updateUser(req.user._id, { photos: user.photos });

    res.json({
      success: true,
      message: 'Photo uploaded successfully!',
      photos: updatedUser.photos
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

// @route   DELETE /api/mock-users/photos/:photoIndex
// @desc    Delete profile photo
// @access  Private
router.delete('/photos/:photoIndex', mockAuthMiddleware, (req, res) => {
  try {
    const photoIndex = parseInt(req.params.photoIndex);
    const user = mockStorage.findUserById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (photoIndex < 0 || photoIndex >= user.photos.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo index'
      });
    }

    user.photos.splice(photoIndex, 1);
    
    // Update user with modified photos
    const updatedUser = mockStorage.updateUser(req.user._id, { photos: user.photos });

    res.json({
      success: true,
      message: 'Photo deleted successfully!',
      photos: updatedUser.photos
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

module.exports = router;