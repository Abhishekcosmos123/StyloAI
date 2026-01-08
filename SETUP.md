# StyloAI Setup Guide

Complete setup instructions for StyloAI backend and mobile app.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- React Native development environment:
  - For iOS: Xcode and CocoaPods
  - For Android: Android Studio and Android SDK
- npm or yarn

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/styloai
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important Notes:**
- Replace `MONGODB_URI` with your MongoDB connection string
- Generate a strong random string for `JWT_SECRET`
- Cloudinary is optional - if not configured, images will be stored locally

### 3. Start MongoDB

**Local MongoDB:**
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

**MongoDB Atlas (Cloud):**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and update `MONGODB_URI` in `.env`

### 4. Run Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend will be available at `http://localhost:5000`

Test the health endpoint: `http://localhost:5000/api/health`

## Mobile App Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Configure API URL

Edit `mobile/src/constants/config.js` and update `API_BASE_URL`:

**For Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

**For iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

**For Physical Device:**
1. Find your computer's IP address:
   - macOS/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
2. Update the URL:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
   ```
3. Make sure your phone and computer are on the same network
4. Ensure backend server is accessible (check firewall settings)

### 4. Run Mobile App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Start Metro Bundler:**
```bash
npm start
```

## Testing the Setup

### 1. Test Backend

```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"message":"StyloAI API is running","status":"ok"}
```

### 2. Test Mobile App

1. Open the app on your device/emulator
2. Register a new account
3. Complete onboarding
4. Upload wardrobe items
5. Generate an outfit

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, ensure IP is whitelisted

**Port Already in Use:**
- Change `PORT` in `.env`
- Or kill the process using port 5000

**Image Upload Fails:**
- Check `uploads` directory exists in `backend/`
- Verify file permissions
- If using Cloudinary, check credentials

### Mobile App Issues

**Cannot Connect to Backend:**
- Verify backend is running
- Check API URL in `config.js`
- For physical device, ensure same network
- Check firewall settings

**Metro Bundler Issues:**
```bash
# Clear cache and restart
npm start -- --reset-cache
```

**iOS Build Errors:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android Build Errors:**
```bash
cd android
./gradlew clean
cd ..
```

## Project Structure

```
StyloAI/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary config
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/      # Auth, upload middleware
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   └── app.js            # Express app
│   ├── uploads/              # Local image storage
│   ├── package.json
│   └── .env                  # Environment variables
│
└── mobile/
    ├── src/
    │   ├── screens/          # Screen components
    │   ├── components/       # Reusable components
    │   ├── navigation/       # Navigation setup
    │   ├── services/         # API services
    │   ├── store/            # Redux store
    │   ├── constants/        # Constants & config
    │   └── assets/           # Images, fonts
    ├── App.js
    ├── index.js
    └── package.json
```

## Next Steps

1. Customize the UI colors in `mobile/src/constants/colors.js`
2. Add more style types or occasions as needed
3. Integrate OpenAI API for advanced outfit generation
4. Add push notifications
5. Implement premium features
6. Add social sharing

## Support

For issues or questions, check:
- Backend logs in terminal
- Metro bundler logs
- React Native debugger
- MongoDB logs

## License

ISC

