import apiClient from './apiClient';

export const dailyOutfitService = {
  generateToday: async (userMood, city, calendarEvents, regenerate = false) => {
    const response = await apiClient.post('/daily-outfit/generate', {
      userMood,
      city,
      calendarEvents,
      regenerate,
    });
    return response.data;
  },

  getToday: async () => {
    const response = await apiClient.get('/daily-outfit/today');
    return response.data;
  },

  markWorn: async (dailyOutfitId, rating, notes) => {
    const response = await apiClient.post('/daily-outfit/mark-worn', {
      dailyOutfitId,
      rating,
      notes,
    });
    return response.data;
  },
};

