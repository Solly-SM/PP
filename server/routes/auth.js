const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      interestedIn
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate age (18+)
    const birthDate = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 18 years old to register'
      });
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: birthDate,
      gender,
      interestedIn: interestedIn || [gender === 'male' ? 'female' : 'male'],
      verificationCode,
      preferences: {
        ageRange: {
          min: Math.max(18, age - 5),
          max: age + 10
        }
      }
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response (excluding password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender,
      interestedIn: user.interestedIn,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to HeartConnect! 💖',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Update last active and online status
    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response (excluding password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender,
      interestedIn: user.interestedIn,
      isVerified: user.isVerified,
      photos: user.photos,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      lifestyle: user.lifestyle,
      preferences: user.preferences,
      stats: user.stats,
      isPremium: user.isPremium,
      lastActive: user.lastActive,
      isOnline: user.isOnline
    };

    res.json({
      success: true,
      message: 'Login successful! Welcome back! 💖',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (set offline status)
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Update user offline status
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastActive: new Date()
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender,
      interestedIn: user.interestedIn,
      isVerified: user.isVerified,
      photos: user.photos,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      lifestyle: user.lifestyle,
      preferences: user.preferences,
      privacySettings: user.privacySettings,
      stats: user.stats,
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      lastActive: user.lastActive,
      isOnline: user.isOnline,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate reset token (in production, send this via email)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.verificationCode = resetToken; // Reusing field for simplicity
    await user.save();

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      // In production, remove this debug info
      debugInfo: process.env.NODE_ENV === 'development' ? { resetToken } : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({ verificationCode: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear verification code
    user.password = newPassword;
    user.verificationCode = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password (for logged in users)
// @access  Private
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

module.exports = router;