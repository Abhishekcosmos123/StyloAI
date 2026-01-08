import apiClient from './apiClient';
import {API_ENDPOINTS} from '../../constants/config';

export const analysisService = {
  uploadBodyImage: async (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'body.jpg',
    });

    const response = await apiClient.post(API_ENDPOINTS.ANALYSIS.BODY, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadFaceImage: async (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'face.jpg',
    });

    const response = await apiClient.post(API_ENDPOINTS.ANALYSIS.FACE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

