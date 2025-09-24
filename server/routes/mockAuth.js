const express = require('express');
const jwt = require('jsonwebtoken');
const mockStorage = require('../mockData');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = mockStorage.findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    req.user = { _id: user._id };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   POST /api/mock-auth/login
// @desc    Mock login
// @access  Public
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple mock login - always return the test user
    if (email === 'john.doe@test.com' && password === 'password123') {
      const user = mockStorage.findUserByEmail(email);
      const token = generateToken(user._id);
      
      res.json({
        success: true,
        message: 'Login successful! Welcome back! 💖',
        token,
        user
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Mock login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// @route   GET /api/mock-auth/me
// @desc    Get current user
// @access  Private
router.get('/me', mockAuthMiddleware, (req, res) => {
  try {
    const user = mockStorage.findUserById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// Export both router and middleware
module.exports = { router, mockAuthMiddleware };