import apiClient from './apiClient';
import {API_ENDPOINTS} from '../../constants/config';

export const profileService = {
  setupProfile: async (gender, styleGoals, occasions) => {
    const response = await apiClient.post(API_ENDPOINTS.PROFILE.SETUP, {
      gender,
      styleGoals,
      occasions,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE.GET);
    return response.data;
  },
};

