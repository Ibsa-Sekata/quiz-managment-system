const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { verifyToken, isAdmin, isApproved } = require('../middleware/auth');
const { validateAnswerSubmission, validate } = require('../middleware/validation');

// User routes
router.post('/:quizId/start', verifyToken, isApproved, resultController.startQuizSession);
router.post('/:sessionId/answer', verifyToken, isApproved, validateAnswerSubmission, validate, resultController.submitAnswer);
router.post('/:sessionId/submit', verifyToken, isApproved, resultController.submitQuiz);
router.get('/user/results', verifyToken, isApproved, resultController.getUserResults);
router.get('/user/performance', verifyToken, isApproved, resultController.getUserPerformance);
router.get('/:resultId', verifyToken, resultController.getResultById);

// Admin routes
router.get('/quiz/:quizId/performance', verifyToken, isAdmin, resultController.getQuizPerformance);

module.exports = router;
