# HeartConnect Dating App - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Git for version control

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Solly-SM/PP.git
   cd PP
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start MongoDB**
   ```bash
   # Start MongoDB service (varies by OS)
   # On macOS with Homebrew:
   brew services start mongodb-community

   # On Ubuntu:
   sudo systemctl start mongod

   # Or using Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Configure environment variables**
   ```bash
   # Copy and edit the .env file
   cp .env.example .env
   
   # Edit .env with your settings:
   # MONGODB_URI=mongodb://localhost:27017/heartconnect
   # JWT_SECRET=your_unique_secret_key_here
   # PORT=5000
   ```

5. **Start the application**
   ```bash
   # Option 1: Start both backend and frontend
   npm run dev

   # Option 2: Start separately
   # Terminal 1 - Backend
   npm start

   # Terminal 2 - Frontend
   cd client && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🏗️ Production Deployment

### Environment Variables
Create a `.env` file with production values:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-mongo-host:27017/heartconnect-prod
JWT_SECRET=your-super-secure-secret-key
CLIENT_URL=https://your-domain.com

# Optional: Email service (for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: Cloud storage (for file uploads)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Build for Production
```bash
# Build the React frontend
cd client
npm run build
cd ..

# The built files will be in client/build/
```

### Deploy to Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create new app
heroku create your-heartconnect-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secure-secret
heroku config:set MONGODB_URI=your-mongodb-atlas-uri

# Deploy
git push heroku main
```

### Deploy to Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

```bash
# Build and run with Docker
docker build -t heartconnect .
docker run -p 3000:3000 --env-file .env heartconnect
```

## 🔧 Configuration

### Database Configuration
The app uses MongoDB with the following collections:
- `users` - User profiles and authentication
- `matches` - Match relationships between users
- `messages` - Chat messages and conversations

### Security Features
- JWT authentication with secure tokens
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)

### File Upload (Optional)
For production, configure cloud storage:
- Cloudinary for image uploads
- AWS S3 for file storage
- Or any other cloud storage service

## 📊 Monitoring

### Health Checks
- API Health: `GET /api/health`
- Database connectivity is checked on startup

### Logging
- Application logs are output to console
- Consider using Winston or similar for production logging

### Performance
- MongoDB indexes are created automatically
- Consider implementing Redis for caching
- Use PM2 for process management in production

## 🧪 Testing

### Run Tests
```bash
# Backend tests (if implemented)
npm test

# Frontend tests
cd client
npm test
```

### API Testing
Use the provided test script or tools like Postman:
```bash
# Test API endpoints manually
curl http://localhost:5000/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network connectivity

2. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Update dependencies if needed

3. **API CORS Issues**
   - Verify CLIENT_URL in environment variables
   - Check CORS configuration in server/app.js

4. **Authentication Problems**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Clear browser localStorage if needed

### Support
For issues and support:
- Check the README.md for feature documentation
- Review the API endpoints in the routes files
- Check console logs for error messages

## 🔄 Updates and Maintenance

### Database Migrations
When updating the schema:
1. Backup your database
2. Update the Mongoose models
3. Test with sample data
4. Deploy incrementally

### Security Updates
- Regularly update npm dependencies
- Monitor for security vulnerabilities
- Keep MongoDB updated
- Rotate JWT secrets periodically

### Feature Deployment
- Use feature flags for gradual rollouts
- Test in staging environment first
- Monitor application metrics post-deployment