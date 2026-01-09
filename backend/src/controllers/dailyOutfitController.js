const { generateTodaysOutfit, markAsWorn, getTodaysOutfit } = require('../services/dailyOutfitService');
const { requirePremium } = require('../middlewares/premium');

/**
 * Generate today's outfit
 */
const generateToday = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userMood, city, calendarEvents, regenerate } = req.body;

    const result = await generateTodaysOutfit(userId, {
      userMood,
      city,
      calendarEvents,
      regenerate,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get today's outfit
 */
const getToday = async (req, res) => {
  try {
    const userId = req.user._id;
    const dailyOutfit = await getTodaysOutfit(userId);

    if (!dailyOutfit) {
      return res.json({
        success: true,
        data: null,
        message: 'No outfit generated for today',
      });
    }

    res.json({
      success: true,
      data: dailyOutfit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark outfit as worn
 */
const markWorn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dailyOutfitId, rating, notes } = req.body;

    const dailyOutfit = await markAsWorn(userId, dailyOutfitId, rating, notes);

    res.json({
      success: true,
      data: dailyOutfit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateToday,
  getToday,
  markWorn,
};

