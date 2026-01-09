const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  paymentCallback,
  getPremiumPlans,
  checkPremiumStatus,
} = require('../controllers/paymentController');
const authenticate = require('../middlewares/auth');

// Public route for webhook (PhonePe will call this)
router.post('/callback', paymentCallback);

// All other routes require authentication
router.use(authenticate);

router.get('/plans', getPremiumPlans);
router.get('/status', checkPremiumStatus);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

module.exports = router;

