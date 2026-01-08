import {Platform} from 'react-native';

// Custom fetch wrapper to ensure HTTP (not HTTPS) is used
export const httpFetch = async (url, options = {}) => {
  // Ensure URL is HTTP
  let httpUrl = url;
  if (httpUrl.startsWith('https://')) {
    httpUrl = httpUrl.replace('https://', 'http://');
  }
  
  // For Android, ensure we're using the correct localhost address
  if (Platform.OS === 'android' && httpUrl.includes('localhost')) {
    httpUrl = httpUrl.replace('localhost', '10.0.2.2');
  }
  
  console.log('HTTP Request:', options.method || 'GET', httpUrl);
  
  try {
    const response = await fetch(httpUrl, {
      ...options,
      // Explicitly disable any redirects
      redirect: 'manual',
    });
    
    return response;
  } catch (error) {
    console.error('HTTP Error:', error);
    throw error;
  }
};

