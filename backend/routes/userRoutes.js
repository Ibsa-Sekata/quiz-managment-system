const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin, isApproved } = require('../middleware/auth');

// Static routes FIRST
router.get('/pending-requests', verifyToken, isAdmin, userController.getPendingRequests);
router.get('/all', verifyToken, isAdmin, userController.getAllUsers);
router.get('/statistics', verifyToken, isAdmin, userController.getUserStatistics);
router.put('/profile', verifyToken, isApproved, userController.updateProfile);

// Admin actions
router.post('/approve/:userId', verifyToken, isAdmin, userController.approveUser);
router.post('/reject/:userId', verifyToken, isAdmin, userController.rejectUser);
router.delete('/:userId', verifyToken, isAdmin, userController.deleteUser);

// Dynamic routes LAST
router.get('/:userId', verifyToken, userController.getUserById);

module.exports = router;
