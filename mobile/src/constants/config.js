// API Base URL - Update this to match your backend URL
export const API_BASE_URL = 'http://localhost:5000/api';

// For Android emulator, use: http://10.0.2.2:5000/api
// For iOS simulator, use: http://localhost:5000/api
// For physical device, use your computer's IP: http://YOUR_IP:5000/api

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
  },
  PROFILE: {
    SETUP: '/profile/setup',
    GET: '/profile',
  },
  ANALYSIS: {
    BODY: '/analysis/body',
    FACE: '/analysis/face',
  },
  WARDROBE: {
    UPLOAD: '/wardrobe/upload',
    GET: '/wardrobe',
    DELETE: '/wardrobe',
  },
  OUTFITS: {
    GENERATE: '/outfits/generate',
    HISTORY: '/outfits/history',
    SAVE: '/outfits',
    DELETE: '/outfits',
  },
};

