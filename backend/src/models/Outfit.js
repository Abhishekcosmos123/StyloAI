const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        wardrobeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Wardrobe',
        },
        category: String,
        imageUrl: String,
      },
    ],
    styleType: {
      type: String,
      enum: ['Casual', 'Attractive', 'Traditional', 'Trend Aligned'],
      required: true,
    },
    occasion: {
      type: String,
      enum: ['Office', 'Party', 'Daily', 'Wedding', 'Travel'],
    },
    weather: {
      type: String,
    },
    shoes: {
      wardrobeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wardrobe',
      },
      imageUrl: String,
    },
    accessories: [
      {
        wardrobeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Wardrobe',
        },
        imageUrl: String,
      },
    ],
    hairstyleSuggestion: {
      type: String,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
outfitSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Outfit', outfitSchema);

