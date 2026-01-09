const mongoose = require('mongoose');

const styleHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    outfitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit',
      required: true,
    },
    wornDate: {
      type: Date,
      required: true,
    },
    occasion: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    photos: [
      {
        imageUrl: String,
        cloudinaryPublicId: String,
      },
    ],
    styleScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    improvementSuggestions: [String],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
styleHistorySchema.index({ userId: 1, wornDate: -1 });
styleHistorySchema.index({ userId: 1, styleScore: -1 });

module.exports = mongoose.model('StyleHistory', styleHistorySchema);

