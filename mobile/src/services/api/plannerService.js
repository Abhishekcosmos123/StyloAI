import apiClient from './apiClient';

export const plannerService = {
  generatePlan: async (weekStartDate, city, regenerate = false) => {
    const response = await apiClient.post('/planner/generate', {
      weekStartDate,
      city,
      regenerate,
    });
    return response.data;
  },

  getPlan: async (weekStartDate) => {
    const response = await apiClient.get(`/planner/weekly?weekStartDate=${weekStartDate}`);
    return response.data;
  },

  confirmOutfit: async (plannerId, date, outfitId) => {
    const response = await apiClient.post('/planner/confirm', {
      plannerId,
      date,
      outfitId,
    });
    return response.data;
  },
};

