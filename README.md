# StyloAI

AI-powered personal styling mobile app with React Native frontend and Node.js backend.

## Project Structure

```
StyloAI/
├── backend/          # Node.js + Express + MongoDB backend
├── mobile/           # React Native CLI frontend
└── README.md         # This file
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and JWT secret

4. Start MongoDB (if running locally)

5. Run the server:
   ```bash
   npm run dev
   ```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. For iOS:
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

4. For Android:
   ```bash
   npm run android
   ```

5. Update API URL in `mobile/src/constants/config.js`:
   - For Android emulator: `http://10.0.2.2:5000/api`
   - For iOS simulator: `http://localhost:5000/api`
   - For physical device: `http://YOUR_COMPUTER_IP:5000/api`

## Features

### Authentication
- Email & password registration/login
- JWT token-based authentication
- Social login placeholders (Google/Apple)

### Onboarding
- Gender selection
- Style goals selection
- Occasion preferences
- Body & face photo upload

### Wardrobe Management
- Upload clothing items by category
- Organize by: Tops, Bottoms, Dresses, Footwear, Accessories
- View and delete items

### AI Outfit Generator
- Generate outfits based on style type
- Filter by occasion
- View outfit, shoes, accessories, and hairstyle suggestions
- Save favorite outfits

### Profile
- View user profile
- Manage preferences
- Settings (coming soon)

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Cloudinary (optional) for image storage

### Frontend
- React Native CLI
- React Navigation (Stack + Bottom Tabs)
- Redux Toolkit for state management
- Axios for API calls
- React Native Image Picker
- AsyncStorage for persistence

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `POST /api/profile/setup` - Setup profile (onboarding)
- `GET /api/profile` - Get user profile

### Analysis
- `POST /api/analysis/body` - Upload body image
- `POST /api/analysis/face` - Upload face image

### Wardrobe
- `POST /api/wardrobe/upload` - Upload wardrobe item
- `GET /api/wardrobe` - Get wardrobe items
- `DELETE /api/wardrobe/:itemId` - Delete wardrobe item

### Outfits
- `POST /api/outfits/generate` - Generate new outfit
- `GET /api/outfits/history` - Get outfit history
- `POST /api/outfits/:outfitId/save` - Save outfit
- `DELETE /api/outfits/:outfitId` - Delete outfit

## Development Notes

- All API routes except `/api/auth/*` require JWT authentication
- Include token in header: `Authorization: Bearer <token>`
- Image uploads are limited to 5MB
- Supported image formats: JPEG, JPG, PNG, GIF

## Future Enhancements

- OpenAI integration for advanced outfit generation
- Outfit planner calendar
- Social sharing features
- Premium subscription features
- Advanced AI body/face analysis
- Style recommendations based on weather
- Outfit history analytics

## License

ISC

