const express = require('express');
const router = express.Router();
const { generateOccasionOutfit, getOccasionGuides } = require('../controllers/occasionController');
const authenticate = require('../middlewares/auth');
const { requirePremium } = require('../middlewares/premium');

// All routes require authentication
router.use(authenticate);

// Premium feature - require premium subscription
router.post('/generate', requirePremium, generateOccasionOutfit);
router.get('/guides', requirePremium, getOccasionGuides);

module.exports = router;

