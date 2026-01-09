const mongoose = require('mongoose');

const wardrobeGapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    missingItems: [
      {
        category: {
          type: String,
          enum: ['Tops', 'Bottoms', 'Dresses', 'Footwear', 'Accessories'],
          required: true,
        },
        itemName: String,
        description: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium',
        },
        suggestedColors: [String],
        shoppingLinks: [
          {
            platform: {
              type: String,
              enum: ['Amazon', 'Flipkart', 'Meesho', 'Ajio', 'Myntra', 'Other'],
            },
            url: String,
            price: Number,
            currency: {
              type: String,
              default: 'INR',
            },
          },
        ],
      },
    ],
    analysisDate: {
      type: Date,
      default: Date.now,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
wardrobeGapSchema.index({ userId: 1, analysisDate: -1 });
wardrobeGapSchema.index({ userId: 1, isResolved: 1 });

module.exports = mongoose.model('WardrobeGap', wardrobeGapSchema);

