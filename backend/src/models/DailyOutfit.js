const mongoose = require('mongoose');

const dailyOutfitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    outfitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit',
      required: true,
    },
    weather: {
      temperature: Number,
      condition: String, // sunny, rainy, cloudy, etc.
      humidity: Number,
    },
    calendarEvents: [
      {
        title: String,
        time: String,
        type: String, // office, party, meeting, etc.
      },
    ],
    userMood: {
      type: String,
      enum: ['energetic', 'relaxed', 'professional', 'casual', 'festive'],
    },
    isWorn: {
      type: Boolean,
      default: false,
    },
    wornAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
dailyOutfitSchema.index({ userId: 1, date: -1 });
dailyOutfitSchema.index({ userId: 1, date: 1 }, { unique: true }); // One outfit per day per user

module.exports = mongoose.model('DailyOutfit', dailyOutfitSchema);

