import apiClient from './apiClient';

export const styleHistoryService = {
  trackOutfit: async (outfitId, wornDate, rating, feedback, photos) => {
    const response = await apiClient.post('/style-history/track', {
      outfitId,
      wornDate,
      rating,
      feedback,
      photos,
    });
    return response.data;
  },

  getHistory: async (limit = 30) => {
    const response = await apiClient.get(`/style-history/history?limit=${limit}`);
    return response.data;
  },

  getProgress: async () => {
    const response = await apiClient.get('/style-history/progress');
    return response.data;
  },
};

