const User = require('../models/User');

/**
 * Middleware to check if user has premium subscription
 */
const requirePremium = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required for this feature',
        isPremium: false,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  requirePremium,
};

