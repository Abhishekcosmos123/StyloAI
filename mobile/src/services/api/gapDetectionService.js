import apiClient from './apiClient';

export const gapDetectionService = {
  detectGaps: async () => {
    const response = await apiClient.post('/gaps/detect');
    return response.data;
  },

  getGaps: async () => {
    const response = await apiClient.get('/gaps');
    return response.data;
  },

  markResolved: async (gapId) => {
    const response = await apiClient.post('/gaps/resolve', { gapId });
    return response.data;
  },
};

