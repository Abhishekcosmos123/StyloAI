const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
    },
    styleGoals: [
      {
        type: String,
        enum: ['Professional', 'Casual', 'Trendy', 'Elegant', 'Minimal'],
      },
    ],
    occasions: [
      {
        type: String,
        enum: ['Office', 'Party', 'Daily', 'Wedding', 'Travel'],
      },
    ],
    bodyAnalysis: {
      imageUrl: String,
      analysisData: mongoose.Schema.Types.Mixed,
      uploadedAt: Date,
    },
    faceAnalysis: {
      imageUrl: String,
      analysisData: mongoose.Schema.Types.Mixed,
      uploadedAt: Date,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

