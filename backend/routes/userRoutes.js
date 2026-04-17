const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin, isApproved } = require('../middleware/auth');

// Admin routes
router.get('/pending-requests', verifyToken, isAdmin, userController.getPendingRequests);
router.post('/approve/:userId', verifyToken, isAdmin, userController.approveUser);
router.post('/reject/:userId', verifyToken, isAdmin, userController.rejectUser);
router.get('/all', verifyToken, isAdmin, userController.getAllUsers);
router.get('/statistics', verifyToken, isAdmin, userController.getUserStatistics);

// User routes
router.get('/:userId', verifyToken, userController.getUserById);
router.put('/profile', verifyToken, isApproved, userController.updateProfile);

module.exports = router;
