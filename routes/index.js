const express = require('express');
const AppController = require ('../controllers/AppController.js');
const UsersController = require('../controllers/UsersController.js');

// New router
const router = express.Router();

// Routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

// Export router for server to use
module.exports = router;
