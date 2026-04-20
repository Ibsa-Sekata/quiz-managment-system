const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { verifyToken, isAdmin, isApproved } = require('../middleware/auth');
const { validateAnswerSubmission, validate } = require('../middleware/validation');

// ── User routes ──────────────────────────────────────────────────────────────
router.get('/user/results', verifyToken, isApproved, resultController.getUserResults);
router.get('/user/performance', verifyToken, isApproved, resultController.getUserPerformance);

// ── Admin routes ─────────────────────────────────────────────────────────────
router.get('/admin/all', verifyToken, isAdmin, resultController.getAllResults);
router.get('/admin/user/:userId', verifyToken, isAdmin, resultController.getUserResultsAdmin);
router.get('/quiz/:quizId/performance', verifyToken, isAdmin, resultController.getQuizPerformance);

// ── Permission routes (Admin) ─────────────────────────────────────────────────
router.post('/permissions/grant', verifyToken, isAdmin, resultController.grantPermission);
router.post('/permissions/revoke', verifyToken, isAdmin, resultController.revokePermission);
router.get('/permissions/quiz/:quizId', verifyToken, isAdmin, resultController.getQuizPermissions);
router.get('/permissions/user/me', verifyToken, isApproved, resultController.getMyPermissions);
router.get('/permissions/user/:userId', verifyToken, isAdmin, resultController.getUserPermissions);
router.post('/permissions/grant-all/:quizId', verifyToken, isAdmin, resultController.grantPermissionToAll);

// ── Quiz session routes ───────────────────────────────────────────────────────
router.post('/:quizId/start', verifyToken, isApproved, resultController.startQuizSession);
router.post('/:sessionId/answer', verifyToken, isApproved, validateAnswerSubmission, validate, resultController.submitAnswer);
router.post('/:sessionId/submit', verifyToken, isApproved, resultController.submitQuiz);
router.get('/:resultId', verifyToken, resultController.getResultById);

module.exports = router;
