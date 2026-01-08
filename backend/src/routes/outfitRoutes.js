const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const {
  generateNewOutfit,
  getOutfitHistory,
  saveOutfit,
  deleteOutfit,
} = require('../controllers/outfitController');

router.post('/generate', authenticate, generateNewOutfit);
router.get('/history', authenticate, getOutfitHistory);
router.post('/:outfitId/save', authenticate, saveOutfit);
router.delete('/:outfitId', authenticate, deleteOutfit);

module.exports = router;

