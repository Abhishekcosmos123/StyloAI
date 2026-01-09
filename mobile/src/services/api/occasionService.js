import apiClient from './apiClient';

export const occasionService = {
  generateOutfit: async (occasion, styleType) => {
    const response = await apiClient.post('/occasions/generate', {
      occasion,
      styleType,
    });
    return response.data;
  },

  getGuides: async () => {
    const response = await apiClient.get('/occasions/guides');
    return response.data;
  },
};

