const DailyOutfit = require('../models/DailyOutfit');
const Outfit = require('../models/Outfit');
const { generateOutfit } = require('./outfitGenerator');
const { getWeatherByCity, getWeatherBasedRecommendations } = require('./weatherService');
const { getTodaysEvents } = require('./calendarService');
const User = require('../models/User');

/**
 * Generate today's outfit suggestion
 */
const generateTodaysOutfit = async (userId, options = {}) => {
  try {
    const { userMood, city, calendarEvents } = options;
    
    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if outfit already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingOutfit = await DailyOutfit.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (existingOutfit && !options.regenerate) {
      const outfit = await Outfit.findById(existingOutfit.outfitId);
      return {
        dailyOutfit: existingOutfit,
        outfit,
        message: 'Today\'s outfit already generated',
      };
    }

    // Get weather data
    let weather = null;
    if (city) {
      weather = await getWeatherByCity(city);
    }

    // Get calendar events if not provided and calendar is connected
    let finalCalendarEvents = calendarEvents;
    if (!finalCalendarEvents || finalCalendarEvents.length === 0) {
      try {
        const calendarEvents = await getTodaysEvents(userId);
        finalCalendarEvents = calendarEvents;
      } catch (error) {
        // Calendar not connected or error - use provided events or empty
        console.log('Calendar not available:', error.message);
      }
    }

    // Determine occasion from calendar events
    let occasion = 'Daily';
    if (finalCalendarEvents && finalCalendarEvents.length > 0) {
      const eventTypes = finalCalendarEvents.map(e => e.type?.toLowerCase() || '');
      if (eventTypes.includes('office') || eventTypes.includes('meeting')) {
        occasion = 'Office';
      } else if (eventTypes.includes('party') || eventTypes.includes('celebration')) {
        occasion = 'Party';
      } else if (eventTypes.includes('wedding')) {
        occasion = 'Wedding';
      } else if (eventTypes.includes('travel')) {
        occasion = 'Travel';
      }
    }

    // Determine style type based on mood and occasion
    let styleType = 'Casual';
    if (userMood === 'professional' || occasion === 'Office') {
      styleType = 'Professional';
    } else if (userMood === 'festive' || occasion === 'Party') {
      styleType = 'Attractive';
    } else if (userMood === 'casual') {
      styleType = 'Casual';
    }

    // Generate outfit
    const outfitData = await generateOutfit(userId, styleType, occasion);
    
    // Create outfit record
    const outfit = new Outfit({
      userId,
      ...outfitData,
      styleType,
      occasion,
      weather: weather?.condition || 'sunny',
      isSaved: false,
    });
    await outfit.save();

    // Create daily outfit record
    const dailyOutfit = new DailyOutfit({
      userId,
      date: today,
      outfitId: outfit._id,
      weather: weather ? {
        temperature: weather.temperature,
        condition: weather.condition,
        humidity: weather.humidity,
      } : null,
      calendarEvents: finalCalendarEvents || [],
      userMood: userMood || 'casual',
      isWorn: false,
    });
    await dailyOutfit.save();

    // Get weather recommendations
    const weatherRecommendations = weather 
      ? getWeatherBasedRecommendations(weather)
      : null;

    return {
      dailyOutfit,
      outfit,
      weather,
      weatherRecommendations,
      message: 'Today\'s outfit generated successfully',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Mark outfit as worn
 */
const markAsWorn = async (userId, dailyOutfitId, rating, notes) => {
  try {
    const dailyOutfit = await DailyOutfit.findOne({
      _id: dailyOutfitId,
      userId,
    });

    if (!dailyOutfit) {
      throw new Error('Daily outfit not found');
    }

    dailyOutfit.isWorn = true;
    dailyOutfit.wornAt = new Date();
    if (rating) dailyOutfit.rating = rating;
    if (notes) dailyOutfit.notes = notes;

    await dailyOutfit.save();

    return dailyOutfit;
  } catch (error) {
    throw error;
  }
};

/**
 * Get today's outfit
 */
const getTodaysOutfit = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyOutfit = await DailyOutfit.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    }).populate('outfitId');

    return dailyOutfit;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateTodaysOutfit,
  markAsWorn,
  getTodaysOutfit,
};

