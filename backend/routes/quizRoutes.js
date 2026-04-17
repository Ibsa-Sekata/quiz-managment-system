const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, isAdmin, isApproved } = require('../middleware/auth');
const { validateQuiz, validate } = require('../middleware/validation');

// Admin routes
router.post('/', verifyToken, isAdmin, validateQuiz, validate, quizController.createQuiz);
router.get('/all', verifyToken, isAdmin, quizController.getAllQuizzes);
router.get('/statistics', verifyToken, isAdmin, quizController.getQuizStatistics);
router.put('/:quizId', verifyToken, isAdmin, validateQuiz, validate, quizController.updateQuiz);
router.post('/:quizId/publish', verifyToken, isAdmin, quizController.publishQuiz);
router.post('/:quizId/unpublish', verifyToken, isAdmin, quizController.unpublishQuiz);
router.delete('/:quizId', verifyToken, isAdmin, quizController.deleteQuiz);
router.get('/:quizId/preview', verifyToken, isAdmin, quizController.previewQuiz);

// User routes
router.get('/available', verifyToken, isApproved, quizController.getAvailableQuizzes);
router.get('/:quizId', verifyToken, isApproved, quizController.getQuizById);

module.exports = router;
