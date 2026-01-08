# StyloAI Backend

Backend API for StyloAI - AI-powered personal styling mobile app.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Cloudinary for image storage (optional)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT tokens
     - `CLOUDINARY_*`: Optional Cloudinary credentials for image storage

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas (cloud)

4. **Run the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

5. **API Base URL**
   - Development: `http://localhost:5000`
   - Health check: `http://localhost:5000/api/health`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `POST /api/profile/setup` - Setup user profile (onboarding)
- `GET /api/profile` - Get user profile

### Analysis
- `POST /api/analysis/body` - Upload body image
- `POST /api/analysis/face` - Upload face image

### Wardrobe
- `POST /api/wardrobe/upload` - Upload wardrobe item
- `GET /api/wardrobe` - Get user's wardrobe
- `DELETE /api/wardrobe/:itemId` - Delete wardrobe item

### Outfits
- `POST /api/outfits/generate` - Generate new outfit
- `GET /api/outfits/history` - Get outfit history
- `POST /api/outfits/:outfitId/save` - Save outfit
- `DELETE /api/outfits/:outfitId` - Delete outfit

## Notes

- All routes except `/api/auth/*` require JWT authentication
- Include token in header: `Authorization: Bearer <token>`
- Image uploads are limited to 5MB
- Supported image formats: JPEG, JPG, PNG, GIF

