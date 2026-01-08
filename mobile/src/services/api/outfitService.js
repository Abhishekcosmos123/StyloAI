import apiClient from './apiClient';
import {API_ENDPOINTS} from '../../constants/config';

export const outfitService = {
  generateOutfit: async (styleType, occasion, weather) => {
    const response = await apiClient.post(API_ENDPOINTS.OUTFITS.GENERATE, {
      styleType,
      occasion,
      weather,
    });
    return response.data;
  },

  getHistory: async (savedOnly = false) => {
    const url = savedOnly
      ? `${API_ENDPOINTS.OUTFITS.HISTORY}?savedOnly=true`
      : API_ENDPOINTS.OUTFITS.HISTORY;
    const response = await apiClient.get(url);
    return response.data;
  },

  saveOutfit: async (outfitId) => {
    const response = await apiClient.post(`${API_ENDPOINTS.OUTFITS.SAVE}/${outfitId}/save`);
    return response.data;
  },

  deleteOutfit: async (outfitId) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.OUTFITS.DELETE}/${outfitId}`);
    return response.data;
  },
};

