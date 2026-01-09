const express = require('express');
const router = express.Router();
const { checkConfig } = require('../controllers/configController');

// Public route to check configuration (for debugging)
router.get('/check', checkConfig);

module.exports = router;

