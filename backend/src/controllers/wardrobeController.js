const Wardrobe = require('../models/Wardrobe');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const fs = require('fs');

// Upload wardrobe item
const uploadWardrobeItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { category, color, styleTags } = req.body;
    const userId = req.user._id;

    // Validate category
    const validCategories = ['Tops', 'Bottoms', 'Dresses', 'Footwear', 'Accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Upload to Cloudinary (or use local storage)
    let imageUrl;
    let cloudinaryPublicId = null;
    try {
      imageUrl = await uploadImage(req.file, `styloai/wardrobe/${userId}`);
    } catch (error) {
      // Fallback to local URL if Cloudinary not configured
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Parse styleTags if it's a string
    let parsedStyleTags = [];
    if (styleTags) {
      parsedStyleTags = typeof styleTags === 'string' ? JSON.parse(styleTags) : styleTags;
    }

    // Create wardrobe item
    const wardrobeItem = new Wardrobe({
      userId,
      category,
      color: color || '',
      styleTags: parsedStyleTags,
      imageUrl,
      cloudinaryPublicId,
    });

    await wardrobeItem.save();

    // Clean up local file after upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json({
      message: 'Wardrobe item uploaded successfully',
      item: wardrobeItem,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Get user's wardrobe
const getWardrobe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.query;

    const query = { userId };
    if (category) {
      query.category = category;
    }

    const wardrobeItems = await Wardrobe.find(query).sort({ createdAt: -1 });

    res.json({
      items: wardrobeItems,
      count: wardrobeItems.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete wardrobe item
const deleteWardrobeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const item = await Wardrobe.findOne({ _id: itemId, userId });
    if (!item) {
      return res.status(404).json({ message: 'Wardrobe item not found' });
    }

    // Delete image from Cloudinary if exists
    if (item.imageUrl && item.imageUrl.includes('cloudinary')) {
      try {
        await deleteImage(item.imageUrl);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Wardrobe.findByIdAndDelete(itemId);

    res.json({ message: 'Wardrobe item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadWardrobeItem, getWardrobe, deleteWardrobeItem };

