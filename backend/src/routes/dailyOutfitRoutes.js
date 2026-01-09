const express = require('express');
const router = express.Router();
const { generateToday, getToday, markWorn } = require('../controllers/dailyOutfitController');
const authenticate = require('../middlewares/auth');
const { requirePremium } = require('../middlewares/premium');

// All routes require authentication
router.use(authenticate);

// Premium feature - require premium subscription
router.post('/generate', requirePremium, generateToday);
router.get('/today', requirePremium, getToday);
router.post('/mark-worn', requirePremium, markWorn);

module.exports = router;

