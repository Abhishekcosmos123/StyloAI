const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  uploadWardrobeItem,
  getWardrobe,
  deleteWardrobeItem,
} = require('../controllers/wardrobeController');

router.post('/upload', authenticate, upload.single('image'), uploadWardrobeItem);
router.get('/', authenticate, getWardrobe);
router.delete('/:itemId', authenticate, deleteWardrobeItem);

module.exports = router;

