const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateQuestion, validate } = require('../middleware/validation');

// Static routes FIRST
router.get('/all', verifyToken, isAdmin, questionController.getAllQuestions);
router.get('/statistics', verifyToken, isAdmin, questionController.getQuestionStatistics);
router.get('/category/:category', verifyToken, isAdmin, questionController.getQuestionsByCategory);

// CRUD
router.post('/', verifyToken, isAdmin, validateQuestion, validate, questionController.createQuestion);
router.post('/bulk', verifyToken, isAdmin, questionController.bulkCreateQuestions);
router.get('/:questionId', verifyToken, isAdmin, questionController.getQuestionById);
router.put('/:questionId', verifyToken, isAdmin, validateQuestion, validate, questionController.updateQuestion);
router.delete('/:questionId', verifyToken, isAdmin, questionController.deleteQuestion);

module.exports = router;
