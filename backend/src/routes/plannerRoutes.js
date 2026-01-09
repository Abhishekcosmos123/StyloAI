const express = require('express');
const router = express.Router();
const { generatePlan, getPlan, confirmDayOutfit } = require('../controllers/plannerController');
const authenticate = require('../middlewares/auth');
const { requirePremium } = require('../middlewares/premium');

// All routes require authentication
router.use(authenticate);

// Premium feature - require premium subscription
router.post('/generate', requirePremium, generatePlan);
router.get('/weekly', requirePremium, getPlan);
router.post('/confirm', requirePremium, confirmDayOutfit);

module.exports = router;

