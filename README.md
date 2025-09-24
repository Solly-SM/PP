# HeartConnect - Unique Dating App

A fully functional and unique dating app with innovative features designed to create meaningful connections.

## 🌟 Unique Features

- **Interest-Based Matching**: Advanced algorithm matching users based on hobbies, goals, and lifestyle compatibility
- **Virtual Date Planning**: Built-in activity suggestions and virtual date rooms
- **Compatibility Scoring**: Multi-factor compatibility analysis
- **AI Conversation Starters**: Personalized icebreakers based on user profiles
- **Enhanced Safety Features**: Advanced verification and reporting systems
- **Gamification Elements**: Achievement system for meaningful interactions
- **Real-time Messaging**: Instant chat with media sharing capabilities

## 🚀 Technology Stack

- **Frontend**: React.js with modern UI components
- **Backend**: Node.js with Express framework
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT-based secure authentication
- **File Storage**: Multer for image uploads

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables (create `.env` file from template):
   ```bash
   cp .env.example .env
   # Edit .env with your settings:
   # MONGODB_URI=mongodb://localhost:27017/heartconnect
   # JWT_SECRET=your_jwt_secret_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Development

- `npm run dev` - Start both client and server in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend client
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run build` - Build for production

## 📱 Features Overview

### User Management
- Secure registration and login
- Profile creation with photos and interests
- Email verification and password recovery

### Matching System
- Advanced compatibility algorithm
- Interest-based recommendations
- Location-based filtering
- Preference customization

### Communication
- Real-time messaging
- Virtual date rooms
- Conversation starters
- Media sharing

### Safety & Security
- Profile verification
- Reporting system
- Block/unblock functionality
- Content moderation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details