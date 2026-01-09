const { trackWornOutfit, getStyleHistory, getStyleProgress } = require('../services/styleHistoryService');

/**
 * Track worn outfit
 */
const trackOutfit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { outfitId, wornDate, rating, feedback, photos } = req.body;

    if (!outfitId || !wornDate) {
      return res.status(400).json({
        success: false,
        message: 'outfitId and wornDate are required',
      });
    }

    const history = await trackWornOutfit(userId, outfitId, wornDate, rating, feedback, photos);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get style history
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 30;

    const history = await getStyleHistory(userId, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get style progress/analytics
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await getStyleProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  trackOutfit,
  getHistory,
  getProgress,
};

