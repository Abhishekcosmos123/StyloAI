const { generateOutfit } = require('../services/outfitGenerator');
const Outfit = require('../models/Outfit');
const { requirePremium } = require('../middlewares/premium');

/**
 * Generate outfit for specific occasion
 */
const generateOccasionOutfit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { occasion, styleType } = req.body;

    if (!occasion) {
      return res.status(400).json({
        success: false,
        message: 'occasion is required',
      });
    }

    const validOccasions = ['Office', 'Party', 'Wedding', 'Interview', 'Festival', 'Travel'];
    if (!validOccasions.includes(occasion)) {
      return res.status(400).json({
        success: false,
        message: `occasion must be one of: ${validOccasions.join(', ')}`,
      });
    }

    // Determine style type based on occasion if not provided
    let finalStyleType = styleType || 'Casual';
    if (occasion === 'Office' || occasion === 'Interview') {
      finalStyleType = 'Professional';
    } else if (occasion === 'Party' || occasion === 'Festival') {
      finalStyleType = 'Attractive';
    }

    // Generate outfit
    const outfitData = await generateOutfit(userId, finalStyleType, occasion);

    // Create outfit record
    const outfit = new Outfit({
      userId,
      ...outfitData,
      styleType: finalStyleType,
      occasion,
      isSaved: false,
    });
    await outfit.save();

    // Get styling guide for occasion
    const stylingGuide = getOccasionStylingGuide(occasion);

    res.json({
      success: true,
      data: {
        outfit,
        stylingGuide,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get styling guide for occasion
 */
const getOccasionStylingGuide = (occasion) => {
  const guides = {
    Office: {
      title: 'Office Styling Guide',
      tips: [
        'Choose professional, well-fitted clothing',
        'Stick to neutral colors or subtle patterns',
        'Ensure clothes are clean and wrinkle-free',
        'Wear comfortable yet professional footwear',
        'Keep accessories minimal and elegant',
      ],
      do: [
        'Wear tailored pieces',
        'Choose appropriate length for skirts/dresses',
        'Layer with blazers or cardigans',
      ],
      dont: [
        'Avoid overly casual items',
        'Skip revealing or flashy clothing',
        'Avoid excessive accessories',
      ],
    },
    Party: {
      title: 'Party Styling Guide',
      tips: [
        'Express your personality with bold choices',
        'Experiment with colors and patterns',
        'Add statement accessories',
        'Choose comfortable yet stylish footwear',
        'Consider the party theme',
      ],
      do: [
        'Wear something that makes you feel confident',
        'Add sparkle or shine for evening parties',
        'Consider the venue and dress code',
      ],
      dont: [
        'Don\'t overdress or underdress',
        'Avoid uncomfortable shoes for long parties',
      ],
    },
    Wedding: {
      title: 'Wedding Styling Guide',
      tips: [
        'Choose elegant and sophisticated pieces',
        'Avoid white (unless you\'re the bride)',
        'Consider the wedding theme and venue',
        'Wear comfortable shoes for dancing',
        'Add elegant accessories',
      ],
      do: [
        'Dress appropriately for the wedding type',
        'Consider the season and weather',
        'Wear something you can move in comfortably',
      ],
      dont: [
        'Don\'t wear white to someone else\'s wedding',
        'Avoid overly casual attire',
        'Don\'t upstage the bride',
      ],
    },
    Interview: {
      title: 'Interview Styling Guide',
      tips: [
        'Dress professionally and conservatively',
        'Choose well-fitted, clean clothing',
        'Stick to neutral colors',
        'Wear comfortable, professional shoes',
        'Keep accessories minimal',
      ],
      do: [
        'Research the company dress code',
        'Ensure clothes are clean and pressed',
        'Wear something that makes you feel confident',
      ],
      dont: [
        'Avoid casual or flashy clothing',
        'Don\'t wear strong perfumes',
        'Avoid distracting accessories',
      ],
    },
    Festival: {
      title: 'Festival Styling Guide',
      tips: [
        'Wear comfortable, weather-appropriate clothing',
        'Choose items you don\'t mind getting dirty',
        'Layer for changing temperatures',
        'Wear comfortable, closed-toe shoes',
        'Add fun accessories and colors',
      ],
      do: [
        'Consider the weather forecast',
        'Wear sunscreen and hats',
        'Bring a light jacket or sweater',
      ],
      dont: [
        'Avoid expensive or delicate items',
        'Don\'t wear uncomfortable shoes',
      ],
    },
    Travel: {
      title: 'Travel Styling Guide',
      tips: [
        'Choose comfortable, versatile pieces',
        'Layer for different climates',
        'Wear comfortable shoes for walking',
        'Pack items that mix and match',
        'Consider the destination culture',
      ],
      do: [
        'Research the destination weather',
        'Pack versatile, wrinkle-resistant items',
        'Wear comfortable layers for flights',
      ],
      dont: [
        'Avoid overpacking',
        'Don\'t wear uncomfortable shoes for long travel',
      ],
    },
  };

  return guides[occasion] || {
    title: 'Styling Guide',
    tips: ['Choose clothing that makes you feel confident and comfortable'],
    do: [],
    dont: [],
  };
};

/**
 * Get all occasion guides
 */
const getOccasionGuides = async (req, res) => {
  try {
    const occasions = ['Office', 'Party', 'Wedding', 'Interview', 'Festival', 'Travel'];
    const guides = occasions.map(occ => ({
      occasion: occ,
      guide: getOccasionStylingGuide(occ),
    }));

    res.json({
      success: true,
      data: guides,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateOccasionOutfit,
  getOccasionGuides,
};

