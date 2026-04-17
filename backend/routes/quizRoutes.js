const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, isAdmin, isApproved } = require('../middleware/auth');
const { validateQuiz, validate } = require('../middleware/validation');

// Static routes FIRST (before /:quizId)
router.get('/all', verifyToken, isAdmin, quizController.getAllQuizzes);
router.get('/statistics', verifyToken, isAdmin, quizController.getQuizStatistics);
router.get('/available', verifyToken, isApproved, quizController.getAvailableQuizzes);

// CRUD
router.post('/', verifyToken, isAdmin, validateQuiz, validate, quizController.createQuiz);
router.get('/:quizId', verifyToken, isApproved, quizController.getQuizById);
router.put('/:quizId', verifyToken, isAdmin, validateQuiz, validate, quizController.updateQuiz);
router.delete('/:quizId', verifyToken, isAdmin, quizController.deleteQuiz);
router.post('/:quizId/publish', verifyToken, isAdmin, quizController.publishQuiz);
router.post('/:quizId/unpublish', verifyToken, isAdmin, quizController.unpublishQuiz);
router.get('/:quizId/preview', verifyToken, isAdmin, quizController.previewQuiz);

module.exports = router;
