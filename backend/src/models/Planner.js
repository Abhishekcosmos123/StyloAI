const mongoose = require('mongoose');

const plannerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    outfits: [
      {
        date: {
          type: Date,
          required: true,
        },
        outfitId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Outfit',
        },
        occasion: String,
        weather: {
          temperature: Number,
          condition: String,
        },
        isConfirmed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
plannerSchema.index({ userId: 1, weekStartDate: -1 });

module.exports = mongoose.model('Planner', plannerSchema);

