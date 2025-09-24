// Mock data storage for testing without MongoDB
let users = new Map();
let currentUserId = 1;

// Mock user for testing
const mockUser = {
  _id: 'test-user-1',
  email: 'john.doe@test.com',
  firstName: 'John',
  lastName: 'Doe',
  age: 29,
  gender: 'male',
  interestedIn: ['female'],
  isVerified: false,
  photos: [],
  bio: '',
  location: {
    city: '',
    state: '',
    country: ''
  },
  interests: [
    { name: 'Travel', category: 'lifestyle' },
    { name: 'Music', category: 'entertainment' }
  ],
  lifestyle: {
    occupation: ''
  },
  preferences: {
    ageRange: { min: 22, max: 35 },
    maxDistance: 50
  },
  privacySettings: {
    showAge: true,
    showLocation: true,
    showLastActive: true
  },
  stats: {
    profileViews: 0,
    likes: 0,
    matches: 0
  },
  isPremium: false,
  premiumExpiry: null,
  lastActive: new Date(),
  isOnline: true,
  createdAt: new Date()
};

// Initialize with mock user
users.set('test-user-1', mockUser);

const mockStorage = {
  // User methods
  findUserById: (id) => {
    return users.get(id);
  },
  
  findUserByEmail: (email) => {
    for (let user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },
  
  createUser: (userData) => {
    const id = `user-${currentUserId++}`;
    const user = {
      _id: id,
      ...userData,
      photos: [],
      interests: userData.interests || [],
      createdAt: new Date()
    };
    users.set(id, user);
    return user;
  },
  
  updateUser: (id, updates) => {
    const user = users.get(id);
    if (!user) return null;
    
    Object.keys(updates).forEach(key => {
      if (key === 'photos') {
        // Special handling for photos array
        user.photos = updates.photos;
      } else if (typeof updates[key] === 'object' && updates[key] !== null) {
        // Merge object fields
        user[key] = { ...user[key], ...updates[key] };
      } else {
        user[key] = updates[key];
      }
    });
    
    users.set(id, user);
    return user;
  },
  
  // Mock authentication
  validatePassword: (password, hashedPassword) => {
    // Simple mock - in real app would use bcrypt
    return password === 'password123';
  },
  
  hashPassword: (password) => {
    // Simple mock - in real app would use bcrypt
    return `hashed_${password}`;
  }
};

module.exports = mockStorage;