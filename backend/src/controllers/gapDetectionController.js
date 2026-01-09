const { detectWardrobeGaps, markGapAsResolved } = require('../services/gapDetectionService');
const { requirePremium } = require('../middlewares/premium');

/**
 * Detect wardrobe gaps
 */
const detectGaps = async (req, res) => {
  try {
    const userId = req.user._id;
    const gapAnalysis = await detectWardrobeGaps(userId);

    res.json({
      success: true,
      data: gapAnalysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get latest gap analysis
 */
const getGaps = async (req, res) => {
  try {
    const userId = req.user._id;
    const WardrobeGap = require('../models/WardrobeGap');
    
    const gapAnalysis = await WardrobeGap.findOne({
      userId,
      isResolved: false,
    }).sort({ analysisDate: -1 });

    res.json({
      success: true,
      data: gapAnalysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark gap as resolved
 */
const markResolved = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gapId } = req.body;

    if (!gapId) {
      return res.status(400).json({
        success: false,
        message: 'gapId is required',
      });
    }

    const gap = await markGapAsResolved(userId, gapId);

    res.json({
      success: true,
      data: gap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  detectGaps,
  getGaps,
  markResolved,
};

