import apiClient from './apiClient';
import { Linking } from 'react-native';

export const calendarService = {
  getAuthUrl: async () => {
    const response = await apiClient.get('/calendar/auth-url');
    return response.data;
  },

  checkConnection: async () => {
    const response = await apiClient.get('/calendar/status');
    return response.data;
  },

  getTodayEvents: async () => {
    const response = await apiClient.get('/calendar/today');
    return response.data;
  },

  getWeekEvents: async (weekStartDate) => {
    const response = await apiClient.get(
      `/calendar/week?weekStartDate=${weekStartDate}`
    );
    return response.data;
  },

  disconnect: async () => {
    const response = await apiClient.post('/calendar/disconnect');
    return response.data;
  },

  exchangeCode: async (code) => {
    const response = await apiClient.post('/calendar/exchange-code', { code });
    return response.data;
  },

  openAuthUrl: async () => {
    try {
      const response = await calendarService.getAuthUrl();
      if (response.success && response.data.authUrl) {
        const authUrl = response.data.authUrl;
        
        // Log the URL for debugging
        console.log('Attempting to open auth URL:', authUrl);
        
        // Try to open URL directly (canOpenURL can be too strict)
        try {
          await Linking.openURL(authUrl);
          return true;
        } catch (openError) {
          console.error('Error opening URL:', openError);
          
          // Fallback: Check if URL can be opened
          const canOpen = await Linking.canOpenURL(authUrl);
          if (canOpen) {
            try {
              await Linking.openURL(authUrl);
              return true;
            } catch (retryError) {
              console.error('Retry failed:', retryError);
              throw retryError;
            }
          } else {
            console.error('URL cannot be opened:', authUrl);
            throw new Error('URL cannot be opened by device');
          }
        }
      } else {
        console.error('Invalid response from getAuthUrl:', response);
        throw new Error('Failed to get auth URL from server');
      }
    } catch (error) {
      console.error('Error opening auth URL:', error);
      throw error;
    }
  },
};

