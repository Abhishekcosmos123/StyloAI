import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '../../constants/config';
import {Platform} from 'react-native';

// Ensure we're using HTTP, not HTTPS - strip any https://
let baseURL = API_BASE_URL;
if (baseURL.startsWith('https://')) {
  baseURL = baseURL.replace('https://', 'http://');
}

// For iOS simulator, ensure we use localhost (not 127.0.0.1) to avoid SSL issues
if (Platform.OS === 'ios' && baseURL.includes('localhost')) {
  // Keep localhost as is - iOS handles it better
  baseURL = baseURL.replace(/127\.0\.0\.1/g, 'localhost');
}

// Remove any trailing slashes
baseURL = baseURL.replace(/\/+$/, '');

// Create axios instance with explicit HTTP configuration
const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't throw on 4xx errors
  validateStatus: (status) => status < 500,
  // Explicitly disable any SSL/HTTPS upgrades
  maxRedirects: 0, // Prevent redirects that might cause SSL issues
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure URL is HTTP, not HTTPS - critical for iOS
    if (config.url && config.url.startsWith('https://')) {
      config.url = config.url.replace('https://', 'http://');
    }
    if (config.baseURL && config.baseURL.startsWith('https://')) {
      config.baseURL = config.baseURL.replace('https://', 'http://');
    }
    
    // Ensure full URL is HTTP
    const fullUrl = (config.baseURL || '') + (config.url || '');
    if (fullUrl.startsWith('https://')) {
      const httpUrl = fullUrl.replace('https://', 'http://');
      if (config.baseURL && fullUrl.startsWith(config.baseURL)) {
        config.baseURL = httpUrl.substring(0, config.baseURL.length);
        config.url = httpUrl.substring(config.baseURL.length);
      } else {
        config.url = httpUrl;
      }
    }
    
    // For iOS, explicitly set protocol to HTTP
    if (Platform.OS === 'ios') {
      config.url = config.url?.replace(/^https:\/\//i, 'http://');
      config.baseURL = config.baseURL?.replace(/^https:\/\//i, 'http://');
    }
    
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request URL for debugging
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log error details for debugging
    if (error.code === 'ERR_NETWORK' || error.message?.includes('SSL') || error.message?.includes('TLS') || error.code === 'ERR_BAD_REQUEST') {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: API_BASE_URL,
        url: error.config?.url,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
        platform: Platform.OS,
      });
      
      // If it's an SSL/TLS error, provide helpful message
      if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
        console.error('SSL/TLS Error detected. Ensure:');
        console.error('1. Backend is running on HTTP (not HTTPS)');
        console.error('2. Info.plist has proper ATS settings');
        console.error('3. Using localhost (not 127.0.0.1) for iOS simulator');
      }
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You can dispatch logout action here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;

