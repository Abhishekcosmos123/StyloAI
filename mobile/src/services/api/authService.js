import apiClient from './apiClient';
import {API_ENDPOINTS} from '../../constants/config';

export const authService = {
  register: async (email, phone, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      email,
      phone,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },
};

