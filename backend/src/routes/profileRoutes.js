const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const { setupProfile, getProfile } = require('../controllers/profileController');

router.post('/setup', authenticate, setupProfile);
router.get('/', authenticate, getProfile);

module.exports = router;

