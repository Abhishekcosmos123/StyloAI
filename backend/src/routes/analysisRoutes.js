const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { uploadBodyImage, uploadFaceImage } = require('../controllers/analysisController');

router.post('/body', authenticate, upload.single('image'), uploadBodyImage);
router.post('/face', authenticate, upload.single('image'), uploadFaceImage);

module.exports = router;

