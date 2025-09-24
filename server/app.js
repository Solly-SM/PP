const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📊 Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '💖 HeartConnect Dating App API is running!',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO for real-time messaging
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // User joins
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`👤 User ${userId} joined`);
  });

  // Handle private messages
  socket.on('send_message', (data) => {
    const { receiverId, message, senderId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        senderId,
        message,
        timestamp: new Date()
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { receiverId, isTyping, senderId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        senderId,
        isTyping
      });
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    // Remove user from active users
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    console.log('👤 User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '🔍 Endpoint not found' 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 HeartConnect server running on port ${PORT}`);
  console.log(`💖 Dating app backend is live!`);
});

module.exports = { app, io };