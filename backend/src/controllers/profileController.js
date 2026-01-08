const User = require('../models/User');

// Setup user profile (onboarding)
const setupProfile = async (req, res) => {
  try {
    const { gender, styleGoals, occasions } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        gender,
        styleGoals,
        occasions,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile setup completed',
      user: {
        id: user._id,
        gender: user.gender,
        styleGoals: user.styleGoals,
        occasions: user.occasions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        styleGoals: user.styleGoals,
        occasions: user.occasions,
        bodyAnalysis: user.bodyAnalysis,
        faceAnalysis: user.faceAnalysis,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { setupProfile, getProfile };

