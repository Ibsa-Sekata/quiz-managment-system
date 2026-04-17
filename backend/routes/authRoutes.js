const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateRegistration, validateLogin, validate } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, validate, authController.register);
router.post('/login', validateLogin, validate, authController.login);

// Protected routes
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
