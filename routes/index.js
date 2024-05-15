const express = require('express');
const AppController = require ('../controllers/AppController.js');

// New router
const router = express.Router();

// Routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Export router for server to use
module.exports = router;
