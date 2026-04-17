const { body, validationResult } = require('express-validator');

// Validation result handler
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

// Registration validation — relaxed password rule
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

// Login validation
exports.validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Question validation — options is array of plain strings
exports.validateQuestion = [
    body('questionText')
        .trim()
        .notEmpty().withMessage('Question text is required')
        .isLength({ min: 5 }).withMessage('Question must be at least 5 characters'),
    body('options')
        .isArray({ min: 4, max: 4 }).withMessage('Question must have exactly 4 options'),
    body('options.*')
        .trim()
        .notEmpty().withMessage('Option text cannot be empty'),
    body('correctAnswerIndex')
        .isInt({ min: 0, max: 3 }).withMessage('Correct answer index must be between 0 and 3'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    body('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard')
];

// Quiz validation
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
        .optional({ nullable: true })
        .if(body('timeLimit').notEmpty())
        .isInt({ min: 1 }).withMessage('Time limit must be at least 1 minute'),
    body('maxAttempts')
        .optional({ nullable: true })
        .if(body('maxAttempts').notEmpty())
        .isInt({ min: 1 }).withMessage('Max attempts must be at least 1'),
    body('passingScore')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100')
];

// Answer submission validation
exports.validateAnswerSubmission = [
    body('questionId')
        .notEmpty().withMessage('Question ID is required'),
    body('selectedAnswerIndex')
        .isInt({ min: 0, max: 3 }).withMessage('Answer index must be between 0 and 3')
];
