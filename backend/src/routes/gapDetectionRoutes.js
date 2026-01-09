const express = require('express');
const router = express.Router();
const { detectGaps, getGaps, markResolved } = require('../controllers/gapDetectionController');
const authenticate = require('../middlewares/auth');
const { requirePremium } = require('../middlewares/premium');

// All routes require authentication
router.use(authenticate);

// Premium feature - require premium subscription
router.post('/detect', requirePremium, detectGaps);
router.get('/', requirePremium, getGaps);
router.post('/resolve', requirePremium, markResolved);

module.exports = router;

