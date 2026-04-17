const { body, validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

exports.validateRegistration = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.validateLogin = [
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

exports.validateQuestion = [
    body('questionText')
        .trim()
        .notEmpty().withMessage('Question text is required')
        .isLength({ min: 5 }).withMessage('Question must be at least 5 characters'),
    body('options')
        .isArray({ min: 4, max: 4 }).withMessage('Question must have exactly 4 options'),
    body('correctAnswerIndex')
        .notEmpty().withMessage('Correct answer index is required')
        .isInt({ min: 0, max: 3 }).withMessage('Correct answer index must be between 0 and 3'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    body('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard')
];

exports.validateQuiz = [
    body('title')
        .trim()
        .notEmpty().withMessage('Quiz title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Quiz description is required'),
    body('questions')
        .isArray({ min: 1 }).withMessage('Quiz must contain at least one question'),
    body('timeLimit')
        .customSanitizer(value => (value === '' ? null : value))
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 }).withMessage('Time limit must be at least 1 minute'),
    body('maxAttempts')
        .customSanitizer(value => (value === '' ? null : value))
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 }).withMessage('Max attempts must be at least 1'),
    body('passingScore')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100')
];

exports.validateAnswerSubmission = [
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('selectedAnswerIndex')
        .isInt({ min: 0, max: 3 }).withMessage('Answer index must be between 0 and 3')
];
