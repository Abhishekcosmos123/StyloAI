// API Base URL - Update this to match your backend URL
export const API_BASE_URL = 'http://10.0.2.2:5001/api';

// For Android emulator, use: http://10.0.2.2:5001/api
// For iOS simulator, use: http://localhost:5001/api
// For physical device, use your computer's IP: http://192.168.1.21:5001/api
// export const API_BASE_URL = __DEV__ 
//   ? 'http://10.0.2.2:5001/api'  // Android emulator
//   : 'http://192.168.1.21:5001/api';  // Production/Physical device

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

