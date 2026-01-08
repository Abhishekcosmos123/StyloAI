import apiClient from './apiClient';
import {API_ENDPOINTS} from '../../constants/config';

export const wardrobeService = {
  uploadItem: async (imageUri, category, color, styleTags) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'wardrobe.jpg',
    });
    formData.append('category', category);
    if (color) formData.append('color', color);
    if (styleTags) formData.append('styleTags', JSON.stringify(styleTags));

    const response = await apiClient.post(API_ENDPOINTS.WARDROBE.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getWardrobe: async (category) => {
    const url = category
      ? `${API_ENDPOINTS.WARDROBE.GET}?category=${category}`
      : API_ENDPOINTS.WARDROBE.GET;
    const response = await apiClient.get(url);
    return response.data;
  },

  deleteItem: async (itemId) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.WARDROBE.DELETE}/${itemId}`);
    return response.data;
  },
};

