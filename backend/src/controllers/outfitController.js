const Outfit = require('../models/Outfit');
const { generateOutfit } = require('../services/outfitGenerator');

// Generate new outfit
const generateNewOutfit = async (req, res) => {
  try {
    const { styleType, occasion, weather } = req.body;
    const userId = req.user._id;

    // Validate styleType
    const validStyleTypes = ['Casual', 'Attractive', 'Traditional', 'Trend Aligned'];
    if (!validStyleTypes.includes(styleType)) {
      return res.status(400).json({ message: 'Invalid style type' });
    }

    // Generate outfit using rule-based logic
    const outfitData = await generateOutfit(userId, styleType, occasion);

    // Save outfit to database
    const outfit = new Outfit({
      userId,
      items: outfitData.items,
      styleType,
      occasion,
      weather,
      shoes: outfitData.shoes,
      accessories: outfitData.accessories,
      hairstyleSuggestion: outfitData.hairstyleSuggestion,
      isSaved: false,
    });

    await outfit.save();

    res.json({
      message: 'Outfit generated successfully',
      outfit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get outfit history
const getOutfitHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { savedOnly } = req.query;

    const query = { userId };
    if (savedOnly === 'true') {
      query.isSaved = true;
    }

    const outfits = await Outfit.find(query)
      .populate('items.wardrobeId', 'category imageUrl color')
      .populate('shoes.wardrobeId', 'category imageUrl color')
      .populate('accessories.wardrobeId', 'category imageUrl color')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      outfits,
      count: outfits.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save outfit
const saveOutfit = async (req, res) => {
  try {
    const { outfitId } = req.params;
    const userId = req.user._id;

    const outfit = await Outfit.findOne({ _id: outfitId, userId });
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    outfit.isSaved = true;
    await outfit.save();

    res.json({
      message: 'Outfit saved successfully',
      outfit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete outfit
const deleteOutfit = async (req, res) => {
  try {
    const { outfitId } = req.params;
    const userId = req.user._id;

    const outfit = await Outfit.findOne({ _id: outfitId, userId });
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    await Outfit.findByIdAndDelete(outfitId);

    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateNewOutfit,
  getOutfitHistory,
  saveOutfit,
  deleteOutfit,
};

