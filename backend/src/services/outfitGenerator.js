const Wardrobe = require('../models/Wardrobe');
const User = require('../models/User');

/**
 * Rule-based outfit generator
 * This can be expanded to use OpenAI or other AI services later
 */
const generateOutfit = async (userId, styleType, occasion) => {
  try {
    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's wardrobe items
    const wardrobeItems = await Wardrobe.find({ userId });

    if (wardrobeItems.length === 0) {
      throw new Error('No items in wardrobe');
    }

    // Filter items by category
    const tops = wardrobeItems.filter((item) => item.category === 'Tops');
    const bottoms = wardrobeItems.filter((item) => item.category === 'Bottoms');
    const dresses = wardrobeItems.filter((item) => item.category === 'Dresses');
    const footwear = wardrobeItems.filter((item) => item.category === 'Footwear');
    const accessories = wardrobeItems.filter((item) => item.category === 'Accessories');

    // Rule-based matching logic
    let selectedItems = [];
    let selectedShoes = null;
    let selectedAccessories = [];

    // Select main outfit items
    if (dresses.length > 0 && (styleType === 'Elegant' || occasion === 'Wedding')) {
      // Prefer dress for elegant or wedding occasions
      const randomDress = dresses[Math.floor(Math.random() * dresses.length)];
      selectedItems.push({
        wardrobeId: randomDress._id,
        category: randomDress.category,
        imageUrl: randomDress.imageUrl,
      });
    } else if (tops.length > 0 && bottoms.length > 0) {
      // Select top and bottom
      const randomTop = tops[Math.floor(Math.random() * tops.length)];
      const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];

      // Color compatibility check (basic rule)
      const compatible = checkColorCompatibility(randomTop.color, randomBottom.color);

      if (compatible || tops.length === 1 || bottoms.length === 1) {
        selectedItems.push({
          wardrobeId: randomTop._id,
          category: randomTop.category,
          imageUrl: randomTop.imageUrl,
        });
        selectedItems.push({
          wardrobeId: randomBottom._id,
          category: randomBottom.category,
          imageUrl: randomBottom.imageUrl,
        });
      } else {
        // Try to find compatible items
        const compatibleTop = tops.find((top) => checkColorCompatibility(top.color, randomBottom.color));
        const compatibleBottom = bottoms.find((bottom) => checkColorCompatibility(randomTop.color, bottom.color));

        if (compatibleTop) {
          selectedItems.push({
            wardrobeId: compatibleTop._id,
            category: compatibleTop.category,
            imageUrl: compatibleTop.imageUrl,
          });
          selectedItems.push({
            wardrobeId: randomBottom._id,
            category: randomBottom.category,
            imageUrl: randomBottom.imageUrl,
          });
        } else if (compatibleBottom) {
          selectedItems.push({
            wardrobeId: randomTop._id,
            category: randomTop.category,
            imageUrl: randomTop.imageUrl,
          });
          selectedItems.push({
            wardrobeId: compatibleBottom._id,
            category: compatibleBottom.category,
            imageUrl: compatibleBottom.imageUrl,
          });
        } else {
          // Fallback: use random items
          selectedItems.push({
            wardrobeId: randomTop._id,
            category: randomTop.category,
            imageUrl: randomTop.imageUrl,
          });
          selectedItems.push({
            wardrobeId: randomBottom._id,
            category: randomBottom.category,
            imageUrl: randomBottom.imageUrl,
          });
        }
      }
    } else if (dresses.length > 0) {
      const randomDress = dresses[Math.floor(Math.random() * dresses.length)];
      selectedItems.push({
        wardrobeId: randomDress._id,
        category: randomDress.category,
        imageUrl: randomDress.imageUrl,
      });
    }

    // Select shoes
    if (footwear.length > 0) {
      const styleBasedShoes = filterByStyle(footwear, styleType);
      if (styleBasedShoes.length > 0) {
        selectedShoes = styleBasedShoes[Math.floor(Math.random() * styleBasedShoes.length)];
      } else {
        selectedShoes = footwear[Math.floor(Math.random() * footwear.length)];
      }

      selectedShoes = {
        wardrobeId: selectedShoes._id,
        imageUrl: selectedShoes.imageUrl,
      };
    }

    // Select accessories (optional, 1-2 items)
    if (accessories.length > 0) {
      const numAccessories = Math.min(Math.floor(Math.random() * 2) + 1, accessories.length);
      const shuffled = [...accessories].sort(() => 0.5 - Math.random());
      selectedAccessories = shuffled.slice(0, numAccessories).map((acc) => ({
        wardrobeId: acc._id,
        imageUrl: acc.imageUrl,
      }));
    }

    // Generate hairstyle suggestion based on style type
    const hairstyleSuggestion = generateHairstyleSuggestion(styleType, occasion);

    return {
      items: selectedItems,
      shoes: selectedShoes,
      accessories: selectedAccessories,
      hairstyleSuggestion,
    };
  } catch (error) {
    throw error;
  }
};

// Color compatibility check (basic rules)
const checkColorCompatibility = (color1, color2) => {
  if (!color1 || !color2) return true; // If color not specified, allow

  const color1Lower = color1.toLowerCase();
  const color2Lower = color2.toLowerCase();

  // Neutral colors go with everything
  const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown'];
  if (neutrals.includes(color1Lower) || neutrals.includes(color2Lower)) {
    return true;
  }

  // Same color
  if (color1Lower === color2Lower) {
    return true;
  }

  // Complementary colors (basic)
  const complementary = {
    red: ['green', 'blue'],
    blue: ['orange', 'red'],
    yellow: ['purple', 'blue'],
    green: ['red', 'pink'],
    purple: ['yellow', 'green'],
    pink: ['green', 'blue'],
    orange: ['blue', 'purple'],
  };

  if (complementary[color1Lower]?.includes(color2Lower)) {
    return true;
  }

  // Similar colors (analogous)
  const analogous = {
    red: ['orange', 'pink'],
    blue: ['purple', 'green'],
    yellow: ['orange', 'green'],
    green: ['blue', 'yellow'],
    purple: ['blue', 'pink'],
  };

  if (analogous[color1Lower]?.includes(color2Lower)) {
    return true;
  }

  return false;
};

// Filter items by style tags
const filterByStyle = (items, styleType) => {
  const styleMap = {
    Casual: ['casual', 'comfortable', 'relaxed'],
    Attractive: ['sexy', 'attractive', 'stylish'],
    Traditional: ['traditional', 'classic', 'formal'],
    'Trend Aligned': ['trendy', 'fashionable', 'modern'],
  };

  const styleKeywords = styleMap[styleType] || [];
  return items.filter((item) => {
    if (!item.styleTags || item.styleTags.length === 0) return true;
    return item.styleTags.some((tag) =>
      styleKeywords.some((keyword) => tag.toLowerCase().includes(keyword))
    );
  });
};

// Generate hairstyle suggestion
const generateHairstyleSuggestion = (styleType, occasion) => {
  const suggestions = {
    Casual: 'Relaxed waves or a simple ponytail',
    Attractive: 'Loose curls or sleek straight hair',
    Traditional: 'Classic updo or neat bun',
    'Trend Aligned': 'Modern braids or textured waves',
  };

  const occasionSuggestions = {
    Office: 'Professional bun or neat ponytail',
    Party: 'Voluminous curls or elegant updo',
    Wedding: 'Elegant updo with accessories',
    Travel: 'Easy braids or low bun',
    Daily: 'Natural waves or simple style',
  };

  if (occasion && occasionSuggestions[occasion]) {
    return occasionSuggestions[occasion];
  }

  return suggestions[styleType] || 'Style your hair to complement your outfit';
};

module.exports = { generateOutfit };

