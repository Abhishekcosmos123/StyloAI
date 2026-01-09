const express = require('express');
const router = express.Router();
const { trackOutfit, getHistory, getProgress } = require('../controllers/styleHistoryController');
const authenticate = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

router.post('/track', trackOutfit);
router.get('/history', getHistory);
router.get('/progress', getProgress);

module.exports = router;

