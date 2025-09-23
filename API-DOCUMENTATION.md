# HeartConnect Dating App - API Documentation

## 🌐 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 API Endpoints

### Health Check
- **GET** `/health`
- **Description**: Check API health status
- **Auth**: None required
- **Response**:
```json
{
  "status": "OK",
  "message": "💖 HeartConnect Dating App API is running!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🔑 Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Description**: Create a new user account
- **Auth**: None required
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1995-05-15",
  "gender": "male",
  "interestedIn": ["female"],
  "interests": [
    {
      "category": "general",
      "name": "Travel",
      "level": 4
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Registration successful! Welcome to HeartConnect! 💖",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "age": 28,
    "gender": "male",
    "isVerified": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Login User
- **POST** `/auth/login`
- **Description**: Authenticate user and get JWT token
- **Auth**: None required
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: Same as register

### Get Current User
- **GET** `/auth/me`
- **Description**: Get current authenticated user info
- **Auth**: Required
- **Response**: User object with full profile data

### Logout User
- **POST** `/auth/logout`
- **Description**: Logout user (sets offline status)
- **Auth**: Required

### Forgot Password
- **POST** `/auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`

### Reset Password
- **POST** `/auth/reset-password`
- **Body**: `{ "token": "reset-token", "newPassword": "newpass123" }`

### Change Password
- **POST** `/auth/change-password`
- **Auth**: Required
- **Body**: `{ "currentPassword": "oldpass", "newPassword": "newpass" }`

---

## 👤 User Management Endpoints

### Get User Profile
- **GET** `/users/profile/:id?`
- **Description**: Get user profile (own or another user's)
- **Auth**: Required
- **Params**: `id` (optional, defaults to current user)

### Update Profile
- **PUT** `/users/profile`
- **Description**: Update user profile information
- **Auth**: Required
- **Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Love traveling and music!",
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "interests": [
    {
      "category": "hobbies",
      "name": "Photography",
      "level": 5
    }
  ],
  "lifestyle": {
    "occupation": "Software Engineer",
    "education": {
      "level": "Bachelor's",
      "field": "Computer Science"
    },
    "smoking": "never",
    "drinking": "socially"
  }
}
```

### Upload Photos
- **POST** `/users/photos`
- **Auth**: Required
- **Body**: `{ "url": "photo-url", "isPrimary": false }`

### Delete Photo
- **DELETE** `/users/photos/:photoIndex`
- **Auth**: Required

### Discover Users
- **GET** `/users/discover`
- **Description**: Get potential matches based on preferences
- **Auth**: Required
- **Query Params**: `page`, `limit`
- **Response**:
```json
{
  "success": true,
  "matches": [
    {
      "_id": "user-id",
      "firstName": "Sarah",
      "lastName": "Smith",
      "age": 26,
      "photos": [...],
      "bio": "Adventure seeker...",
      "compatibilityScore": 92
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

### Block/Unblock User
- **POST** `/users/block` - Block a user
- **POST** `/users/unblock` - Unblock a user
- **Body**: `{ "userId": "user-id" }`

### Report User
- **POST** `/users/report`
- **Body**: `{ "userId": "user-id", "reason": "inappropriate", "description": "..." }`

### Get User Statistics
- **GET** `/users/stats`
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "stats": {
    "profileViews": 150,
    "likes": 45,
    "matches": 12,
    "conversations": 8,
    "profileCompletion": 85
  }
}
```

---

## 💕 Matching Endpoints

### Swipe on User
- **POST** `/matches/swipe`
- **Description**: Like, super-like, or pass on a user
- **Auth**: Required
- **Body**:
```json
{
  "userId": "target-user-id",
  "action": "like" // "like", "super-like", or "pass"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "It's a match! 💖",
  "isNewMatch": true,
  "match": {
    "id": "match-id",
    "status": "matched",
    "compatibilityScore": 89,
    "matchedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Get Matches
- **GET** `/matches`
- **Description**: Get user's matches
- **Auth**: Required
- **Query Params**: `page`, `limit`, `status` (default: "matched")
- **Response**:
```json
{
  "success": true,
  "matches": [
    {
      "id": "match-id",
      "status": "matched",
      "compatibilityScore": 89,
      "matchedAt": "2024-01-01T12:00:00.000Z",
      "conversation": {
        "isStarted": true,
        "messageCount": 5,
        "lastMessageAt": "2024-01-01T13:00:00.000Z"
      },
      "otherUser": {
        "_id": "user-id",
        "firstName": "Sarah",
        "lastName": "Smith",
        "age": 26,
        "photos": [...],
        "isOnline": true
      }
    }
  ]
}
```

### Get Match Details
- **GET** `/matches/:matchId`
- **Auth**: Required

### Unmatch User
- **POST** `/matches/:matchId/unmatch`
- **Auth**: Required

### Schedule Virtual Date
- **POST** `/matches/:matchId/schedule-date`
- **Auth**: Required
- **Body**:
```json
{
  "scheduledAt": "2024-01-02T19:00:00.000Z",
  "activity": "Virtual Coffee Date"
}
```

### Get Recommendations
- **GET** `/matches/recommendations`
- **Description**: Get AI-powered match recommendations
- **Auth**: Required
- **Query Params**: `limit` (default: 10)

---

## 💬 Messaging Endpoints

### Send Message
- **POST** `/messages/send`
- **Description**: Send a message to a match
- **Auth**: Required
- **Body**:
```json
{
  "matchId": "match-id",
  "content": "Hey! How's your day going?",
  "type": "text" // "text", "image", "audio", etc.
}
```

### Get Messages
- **GET** `/messages/:matchId`
- **Description**: Get messages for a specific match
- **Auth**: Required
- **Query Params**: `page`, `limit`

### Get Conversations
- **GET** `/messages/conversations/list`
- **Description**: Get all conversations for user
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "conversations": [
    {
      "matchId": "match-id",
      "otherUser": {
        "_id": "user-id",
        "firstName": "Sarah",
        "photos": [...],
        "isOnline": true
      },
      "lastMessage": {
        "content": { "text": "That sounds great!" },
        "createdAt": "2024-01-01T12:00:00.000Z"
      },
      "unreadCount": 2
    }
  ]
}
```

### Add Message Reaction
- **POST** `/messages/:messageId/react`
- **Body**: `{ "emoji": "❤️" }`

### Get Conversation Starters
- **GET** `/messages/starters/:category?`
- **Description**: Get conversation starter suggestions
- **Categories**: `general`, `hobbies`, `lifestyle`, `fun`

### Get Personalized Starters
- **POST** `/messages/starters/personalized`
- **Body**: `{ "matchId": "match-id" }`
- **Response**: Personalized conversation starters based on match profile

### Get Unread Count
- **GET** `/messages/unread/count`
- **Auth**: Required

---

## 🔄 Real-time Features (Socket.IO)

### Socket Events

#### Client to Server:
- `join` - Join user's room: `{ userId: "user-id" }`
- `send_message` - Send message: `{ receiverId, message, senderId }`
- `typing` - Typing indicator: `{ receiverId, isTyping, senderId }`

#### Server to Client:
- `receive_message` - New message: `{ senderId, message, timestamp }`
- `user_typing` - User typing: `{ senderId, isTyping }`

### Usage Example:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join user's room
socket.emit('join', userId);

// Send message
socket.emit('send_message', {
  receiverId: 'target-user-id',
  message: 'Hello!',
  senderId: 'current-user-id'
});

// Listen for messages
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});
```

---

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🚨 Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## 🏷️ Data Models

### User Model
```javascript
{
  email: String,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  gender: String, // 'male', 'female', 'non-binary', 'other'
  interestedIn: [String],
  bio: String,
  photos: [{
    url: String,
    isPrimary: Boolean,
    uploadedAt: Date
  }],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  interests: [{
    category: String,
    name: String,
    level: Number // 1-5
  }],
  lifestyle: {
    occupation: String,
    education: {
      level: String,
      field: String,
      school: String
    },
    smoking: String, // 'never', 'socially', 'regularly', 'trying-to-quit'
    drinking: String, // 'never', 'socially', 'regularly'
    exercise: String, // 'never', 'sometimes', 'regularly', 'daily'
    diet: String,
    pets: String,
    children: String
  },
  preferences: {
    ageRange: {
      min: Number,
      max: Number
    },
    maxDistance: Number,
    dealBreakers: [Object]
  },
  stats: {
    profileViews: Number,
    likes: Number,
    matches: Number,
    conversations: Number
  }
}
```

### Match Model
```javascript
{
  users: [ObjectId], // References to User
  status: String, // 'pending', 'matched', 'rejected', 'expired'
  initiator: ObjectId, // User who liked first
  compatibilityScore: Number, // 0-100
  matchedVia: String, // 'swipe', 'search', 'recommendation'
  conversation: {
    isStarted: Boolean,
    startedBy: ObjectId,
    startedAt: Date,
    lastMessageAt: Date,
    messageCount: Number
  },
  virtualDate: {
    isScheduled: Boolean,
    scheduledAt: Date,
    activity: String,
    status: String
  }
}
```

## 🧪 Testing
Use tools like Postman, Insomnia, or curl to test the API endpoints. Make sure to:
1. Get a JWT token from login/register
2. Include the token in subsequent requests
3. Check response status codes and messages
4. Test error scenarios (invalid data, unauthorized access, etc.)

## 🔒 Security Notes
- All passwords are hashed using bcrypt
- JWT tokens expire after 30 days
- Input validation is performed on all endpoints
- CORS is configured for frontend domain
- Rate limiting should be implemented for production