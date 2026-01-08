import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import wardrobeReducer from './slices/wardrobeSlice';
import outfitReducer from './slices/outfitSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    wardrobe: wardrobeReducer,
    outfit: outfitReducer,
  },
});

