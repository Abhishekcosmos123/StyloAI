const express = require('express');
const router = express.Router();
const {
  getAuthUrl,
  handleCallback,
  exchangeCode,
  getTodayEvents,
  getWeekEvents,
  checkConnection,
  disconnect,
} = require('../controllers/calendarController');
const authenticate = require('../middlewares/auth');
const { requirePremium } = require('../middlewares/premium');

// Public route for OAuth callback
router.get('/callback', handleCallback);

// All other routes require authentication
router.use(authenticate);

// Premium feature - require premium subscription
router.get('/auth-url', requirePremium, getAuthUrl);
router.post('/exchange-code', requirePremium, exchangeCode); // Manual code exchange
router.get('/status', requirePremium, checkConnection);
router.get('/today', requirePremium, getTodayEvents);
router.get('/week', requirePremium, getWeekEvents);
router.post('/disconnect', requirePremium, disconnect);

module.exports = router;

