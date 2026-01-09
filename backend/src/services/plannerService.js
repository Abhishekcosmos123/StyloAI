const Planner = require('../models/Planner');
const Outfit = require('../models/Outfit');
const DailyOutfit = require('../models/DailyOutfit');
const { generateOutfit } = require('./outfitGenerator');
const { getWeatherByCity } = require('./weatherService');
const { getWeekEvents } = require('./calendarService');
const User = require('../models/User');

/**
 * Generate weekly outfit plan
 */
const generateWeeklyPlan = async (userId, weekStartDate, options = {}) => {
  try {
    const { city } = options;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate week dates
    const startDate = new Date(weekStartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Check if plan already exists
    const existingPlan = await Planner.findOne({
      userId,
      weekStartDate: { $gte: startDate, $lte: endDate },
      isActive: true,
    });

    if (existingPlan && !options.regenerate) {
      return existingPlan;
    }

    // Get previously worn outfits to avoid repetition
    const wornOutfits = await DailyOutfit.find({
      userId,
      isWorn: true,
      wornAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    }).populate('outfitId');

    const wornOutfitIds = new Set(wornOutfits.map(wo => wo.outfitId?._id?.toString()));

    // Generate outfits for each day
    const outfits = [];
    const currentDate = new Date(startDate);

    // Get week's calendar events if calendar is connected
    let weekEvents = [];
    try {
      weekEvents = await getWeekEvents(userId, startDate);
    } catch (error) {
      console.log('Calendar not available for planner:', error.message);
    }

    while (currentDate <= endDate) {
      // Get weather for the day (simplified - using current weather)
      let weather = null;
      if (city) {
        weather = await getWeatherByCity(city);
      }

      // Determine occasion from calendar events for this day
      let occasion = 'Daily';
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Find events for this day
      const dayEvents = weekEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= dayStart && eventDate <= dayEnd;
      });

      if (dayEvents.length > 0) {
        // Use the first event's type to determine occasion
        const eventType = dayEvents[0].type;
        if (eventType === 'office') {
          occasion = 'Office';
        } else if (eventType === 'party') {
          occasion = 'Party';
        } else if (eventType === 'travel') {
          occasion = 'Travel';
        }
      } else {
        // Fallback to day of week
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          occasion = 'Party'; // Weekend
        }
      }

      // Generate outfit
      const styleType = occasion === 'Office' ? 'Professional' : 'Casual';
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

      // Check if this outfit was recently worn
      const isRecentlyWorn = wornOutfitIds.has(outfit._id.toString());

      outfits.push({
        date: new Date(currentDate),
        outfitId: outfit._id,
        occasion,
        weather: weather ? {
          temperature: weather.temperature,
          condition: weather.condition,
        } : null,
        isConfirmed: false,
        isRecentlyWorn,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create or update planner
    let planner;
    if (existingPlan) {
      planner = existingPlan;
      planner.outfits = outfits;
      planner.weekEndDate = endDate;
    } else {
      planner = new Planner({
        userId,
        weekStartDate: startDate,
        weekEndDate: endDate,
        outfits,
        isActive: true,
      });
    }

    await planner.save();

    return planner;
  } catch (error) {
    throw error;
  }
};

/**
 * Get weekly plan
 */
const getWeeklyPlan = async (userId, weekStartDate) => {
  try {
    const startDate = new Date(weekStartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const planner = await Planner.findOne({
      userId,
      weekStartDate: { $gte: startDate, $lte: endDate },
      isActive: true,
    }).populate('outfits.outfitId');

    return planner;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm outfit for a specific day
 */
const confirmOutfit = async (userId, plannerId, date, outfitId) => {
  try {
    const planner = await Planner.findOne({
      _id: plannerId,
      userId,
    });

    if (!planner) {
      throw new Error('Planner not found');
    }

    const outfitEntry = planner.outfits.find(
      o => o.date.toDateString() === new Date(date).toDateString()
    );

    if (outfitEntry) {
      outfitEntry.outfitId = outfitId;
      outfitEntry.isConfirmed = true;
    } else {
      planner.outfits.push({
        date: new Date(date),
        outfitId,
        isConfirmed: true,
      });
    }

    await planner.save();

    return planner;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateWeeklyPlan,
  getWeeklyPlan,
  confirmOutfit,
};

