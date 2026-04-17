const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { verifyToken, isAdmin, isApproved } = require('../middleware/auth');
const { validateQuestion, validate } = require('../middleware/validation');

// Admin routes
router.post('/', verifyToken, isAdmin, validateQuestion, validate, questionController.createQuestion);
router.get('/all', verifyToken, isAdmin, questionController.getAllQuestions);
router.get('/statistics', verifyToken, isAdmin, questionController.getQuestionStatistics);
router.get('/category/:category', verifyToken, isAdmin, questionController.getQuestionsByCategory);
router.get('/:questionId', verifyToken, isAdmin, questionController.getQuestionById);
router.put('/:questionId', verifyToken, isAdmin, validateQuestion, validate, questionController.updateQuestion);
router.delete('/:questionId', verifyToken, isAdmin, questionController.deleteQuestion);

module.exports = router;
