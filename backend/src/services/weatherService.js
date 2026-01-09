const axios = require('axios');

/**
 * Get weather data from OpenWeatherMap API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
const getWeatherData = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured. Using default weather.');
      return getDefaultWeather();
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    const response = await axios.get(url);
    const data = response.data;

    return {
      temperature: Math.round(data.main.temp),
      condition: mapWeatherCondition(data.weather[0].main),
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Weather API Error:', error.message);
    // Return default weather if API fails
    return getDefaultWeather();
  }
};

/**
 * Get weather by city name
 */
const getWeatherByCity = async (cityName) => {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey) {
      return getDefaultWeather();
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
    
    const response = await axios.get(url);
    const data = response.data;

    return {
      temperature: Math.round(data.main.temp),
      condition: mapWeatherCondition(data.weather[0].main),
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
    };
  } catch (error) {
    console.error('Weather API Error:', error.message);
    return getDefaultWeather();
  }
};

/**
 * Map OpenWeatherMap condition to our format
 */
const mapWeatherCondition = (condition) => {
  const conditionMap = {
    'Clear': 'sunny',
    'Clouds': 'cloudy',
    'Rain': 'rainy',
    'Drizzle': 'rainy',
    'Thunderstorm': 'rainy',
    'Snow': 'snowy',
    'Mist': 'cloudy',
    'Fog': 'cloudy',
    'Haze': 'cloudy',
  };
  
  return conditionMap[condition] || 'sunny';
};

/**
 * Get default weather when API is not available
 */
const getDefaultWeather = () => {
  return {
    temperature: 25,
    condition: 'sunny',
    humidity: 60,
    windSpeed: 5,
    description: 'Clear sky',
    icon: '01d',
  };
};

/**
 * Get outfit recommendations based on weather
 */
const getWeatherBasedRecommendations = (weather) => {
  const recommendations = {
    sunny: {
      message: 'Sunny day! Wear light, breathable fabrics.',
      suggestions: ['Light colors', 'Sunglasses', 'Hat', 'Sunscreen'],
    },
    rainy: {
      message: 'Rainy weather! Stay dry and comfortable.',
      suggestions: ['Waterproof jacket', 'Umbrella', 'Boots', 'Layers'],
    },
    cloudy: {
      message: 'Cloudy day! Perfect for layered outfits.',
      suggestions: ['Light layers', 'Comfortable shoes', 'Versatile pieces'],
    },
    snowy: {
      message: 'Cold weather! Bundle up and stay warm.',
      suggestions: ['Warm layers', 'Winter coat', 'Boots', 'Gloves'],
    },
  };

  return recommendations[weather.condition] || recommendations.cloudy;
};

module.exports = {
  getWeatherData,
  getWeatherByCity,
  getWeatherBasedRecommendations,
};

