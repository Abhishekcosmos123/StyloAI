const mongoose = require('mongoose');

const wardrobeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['Tops', 'Bottoms', 'Dresses', 'Footwear', 'Accessories'],
      required: true,
    },
    color: {
      type: String,
      trim: true,
    },
    styleTags: [
      {
        type: String,
      },
    ],
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
wardrobeSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Wardrobe', wardrobeSchema);

