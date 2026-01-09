const Wardrobe = require('../models/Wardrobe');
const WardrobeGap = require('../models/WardrobeGap');
const Outfit = require('../models/Outfit');
const User = require('../models/User');

/**
 * Analyze wardrobe and detect gaps
 */
const detectWardrobeGaps = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all wardrobe items
    const wardrobeItems = await Wardrobe.find({ userId });
    
    // Get user's style goals and occasions
    const styleGoals = user.styleGoals || [];
    const occasions = user.occasions || [];

    // Analyze wardrobe by category
    const categoryCounts = {
      Tops: wardrobeItems.filter(item => item.category === 'Tops').length,
      Bottoms: wardrobeItems.filter(item => item.category === 'Bottoms').length,
      Dresses: wardrobeItems.filter(item => item.category === 'Dresses').length,
      Footwear: wardrobeItems.filter(item => item.category === 'Footwear').length,
      Accessories: wardrobeItems.filter(item => item.category === 'Accessories').length,
    };

    // Get color distribution
    const colors = wardrobeItems.map(item => item.color).filter(Boolean);
    const colorFrequency = {};
    colors.forEach(color => {
      colorFrequency[color] = (colorFrequency[color] || 0) + 1;
    });

    // Detect missing essentials
    const missingItems = [];

    // Essential: At least 3 tops
    if (categoryCounts.Tops < 3) {
      missingItems.push({
        category: 'Tops',
        itemName: 'Basic Tops',
        description: `You have ${categoryCounts.Tops} top(s). Consider adding versatile tops for different occasions.`,
        priority: categoryCounts.Tops === 0 ? 'high' : 'medium',
        suggestedColors: getSuggestedColors(colorFrequency, ['white', 'black', 'navy', 'beige']),
        shoppingLinks: generateShoppingLinks('Tops'),
      });
    }

    // Essential: At least 2 bottoms
    if (categoryCounts.Bottoms < 2) {
      missingItems.push({
        category: 'Bottoms',
        itemName: 'Basic Bottoms',
        description: `You have ${categoryCounts.Bottoms} bottom(s). Add versatile bottoms for different styles.`,
        priority: categoryCounts.Bottoms === 0 ? 'high' : 'medium',
        suggestedColors: getSuggestedColors(colorFrequency, ['black', 'navy', 'beige', 'denim']),
        shoppingLinks: generateShoppingLinks('Bottoms'),
      });
    }

    // Essential: At least 1 pair of footwear
    if (categoryCounts.Footwear < 1) {
      missingItems.push({
        category: 'Footwear',
        itemName: 'Versatile Footwear',
        description: 'Add footwear to complete your outfits. Consider versatile options that work with multiple styles.',
        priority: 'high',
        suggestedColors: ['black', 'brown', 'white'],
        shoppingLinks: generateShoppingLinks('Footwear'),
      });
    }

    // Check for occasion-specific gaps
    if (occasions.includes('Office') && categoryCounts.Tops < 5) {
      missingItems.push({
        category: 'Tops',
        itemName: 'Professional Tops',
        description: 'Add more professional tops for office occasions.',
        priority: 'medium',
        suggestedColors: ['white', 'navy', 'black', 'gray'],
        shoppingLinks: generateShoppingLinks('Tops', 'Office'),
      });
    }

    if (occasions.includes('Party') && categoryCounts.Dresses < 2) {
      missingItems.push({
        category: 'Dresses',
        itemName: 'Party Dresses',
        description: 'Add party dresses for special occasions.',
        priority: 'low',
        suggestedColors: ['black', 'red', 'blue', 'green'],
        shoppingLinks: generateShoppingLinks('Dresses', 'Party'),
      });
    }

    // Check for accessories
    if (categoryCounts.Accessories < 3) {
      missingItems.push({
        category: 'Accessories',
        itemName: 'Versatile Accessories',
        description: 'Add accessories to enhance your outfits. Consider belts, bags, jewelry, and scarves.',
        priority: 'low',
        suggestedColors: ['black', 'brown', 'gold', 'silver'],
        shoppingLinks: generateShoppingLinks('Accessories'),
      });
    }

    // Check for neutral basics
    const neutralColors = ['black', 'white', 'gray', 'grey', 'navy', 'beige', 'brown'];
    const hasNeutrals = colors.some(c => neutralColors.includes(c?.toLowerCase()));
    
    if (!hasNeutrals && wardrobeItems.length > 0) {
      missingItems.push({
        category: 'Tops',
        itemName: 'Neutral Basics',
        description: 'Add neutral-colored basics that can be paired with any outfit.',
        priority: 'medium',
        suggestedColors: ['black', 'white', 'navy', 'beige'],
        shoppingLinks: generateShoppingLinks('Tops', 'Basics'),
      });
    }

    // Create or update gap analysis
    const existingGap = await WardrobeGap.findOne({
      userId,
      isResolved: false,
    });

    if (existingGap) {
      existingGap.missingItems = missingItems;
      existingGap.analysisDate = new Date();
      await existingGap.save();
      return existingGap;
    } else {
      const wardrobeGap = new WardrobeGap({
        userId,
        missingItems,
      });
      await wardrobeGap.save();
      return wardrobeGap;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get suggested colors based on existing wardrobe
 */
const getSuggestedColors = (colorFrequency, defaultColors) => {
  // If user has colors, suggest complementary ones
  const existingColors = Object.keys(colorFrequency);
  if (existingColors.length > 0) {
    // Return a mix of existing and neutral colors
    return [...new Set([...existingColors.slice(0, 2), ...defaultColors.slice(0, 2)])];
  }
  return defaultColors.slice(0, 4);
};

/**
 * Generate shopping links (placeholder - can be enhanced with actual API integration)
 */
const generateShoppingLinks = (category, style = '') => {
  const links = [];
  const searchTerms = `${category} ${style}`.trim().toLowerCase();

  // Amazon
  links.push({
    platform: 'Amazon',
    url: `https://www.amazon.in/s?k=${encodeURIComponent(searchTerms)}`,
    price: null,
    currency: 'INR',
  });

  // Flipkart
  links.push({
    platform: 'Flipkart',
    url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchTerms)}`,
    price: null,
    currency: 'INR',
  });

  // Myntra
  links.push({
    platform: 'Myntra',
    url: `https://www.myntra.com/${encodeURIComponent(searchTerms)}`,
    price: null,
    currency: 'INR',
  });

  // Ajio
  links.push({
    platform: 'Ajio',
    url: `https://www.ajio.com/search/?text=${encodeURIComponent(searchTerms)}`,
    price: null,
    currency: 'INR',
  });

  return links;
};

/**
 * Mark gap as resolved
 */
const markGapAsResolved = async (userId, gapId) => {
  try {
    const gap = await WardrobeGap.findOne({
      _id: gapId,
      userId,
    });

    if (!gap) {
      throw new Error('Wardrobe gap not found');
    }

    gap.isResolved = true;
    await gap.save();

    return gap;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  detectWardrobeGaps,
  markGapAsResolved,
};

