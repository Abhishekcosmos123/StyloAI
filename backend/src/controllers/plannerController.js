const { generateWeeklyPlan, getWeeklyPlan, confirmOutfit } = require('../services/plannerService');
const { requirePremium } = require('../middlewares/premium');

/**
 * Generate weekly outfit plan
 */
const generatePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weekStartDate, city, regenerate } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'weekStartDate is required',
      });
    }

    const planner = await generateWeeklyPlan(userId, weekStartDate, {
      city,
      regenerate,
    });

    res.json({
      success: true,
      data: planner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get weekly plan
 */
const getPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weekStartDate } = req.query;

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'weekStartDate is required',
      });
    }

    const planner = await getWeeklyPlan(userId, weekStartDate);

    if (!planner) {
      return res.json({
        success: true,
        data: null,
        message: 'No plan found for this week',
      });
    }

    res.json({
      success: true,
      data: planner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Confirm outfit for a day
 */
const confirmDayOutfit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plannerId, date, outfitId } = req.body;

    if (!plannerId || !date || !outfitId) {
      return res.status(400).json({
        success: false,
        message: 'plannerId, date, and outfitId are required',
      });
    }

    const planner = await confirmOutfit(userId, plannerId, date, outfitId);

    res.json({
      success: true,
      data: planner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generatePlan,
  getPlan,
  confirmDayOutfit,
};

