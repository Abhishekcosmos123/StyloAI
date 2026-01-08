const User = require('../models/User');
const { uploadImage } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Upload and analyze body image
const uploadBodyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user._id;

    // Upload to Cloudinary (or use local storage)
    let imageUrl;
    try {
      imageUrl = await uploadImage(req.file, 'styloai/body');
    } catch (error) {
      // Fallback to local URL if Cloudinary not configured
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Basic analysis (can be expanded with AI)
    const analysisData = {
      uploadedAt: new Date(),
      // Placeholder for AI analysis results
      // This can be expanded to call OpenAI or other AI services
      analysis: 'Body image uploaded successfully. AI analysis pending.',
    };

    // Update user's body analysis
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'bodyAnalysis.imageUrl': imageUrl,
        'bodyAnalysis.analysisData': analysisData,
        'bodyAnalysis.uploadedAt': new Date(),
      },
      { new: true }
    );

    // Clean up local file after upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      message: 'Body image uploaded and analyzed',
      bodyAnalysis: user.bodyAnalysis,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Upload and analyze face image
const uploadFaceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user._id;

    // Upload to Cloudinary (or use local storage)
    let imageUrl;
    try {
      imageUrl = await uploadImage(req.file, 'styloai/face');
    } catch (error) {
      // Fallback to local URL if Cloudinary not configured
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Basic analysis (can be expanded with AI)
    const analysisData = {
      uploadedAt: new Date(),
      // Placeholder for AI analysis results
      analysis: 'Face image uploaded successfully. AI analysis pending.',
    };

    // Update user's face analysis
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'faceAnalysis.imageUrl': imageUrl,
        'faceAnalysis.analysisData': analysisData,
        'faceAnalysis.uploadedAt': new Date(),
      },
      { new: true }
    );

    // Clean up local file after upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      message: 'Face image uploaded and analyzed',
      faceAnalysis: user.faceAnalysis,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadBodyImage, uploadFaceImage };

