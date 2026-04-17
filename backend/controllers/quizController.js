const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const Result = require('../models/Result');

// Create quiz (Admin only)
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, questions, timeLimit, maxAttempts, passingScore, startDate, endDate } = req.body;

        // Validate questions exist
        const questionDocs = await Question.find({ _id: { $in: questions } });
        if (questionDocs.length !== questions.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more questions not found'
            });
        }

        const quiz = new Quiz({
            title,
            description,
            questions,
            timeLimit,
            maxAttempts,
            passingScore: passingScore || 50,
            startDate,
            endDate,
            createdBy: req.user._id,
            isPublished: false
        });

        await quiz.save();

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create quiz',
            error: error.message
        });
    }
};

// Get all quizzes (Admin only)
exports.getAllQuizzes = async (req, res) => {
    try {
        const { isPublished, page = 1, limit = 10 } = req.query;

        let filter = {};
        if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

        const skip = (page - 1) * limit;
        const quizzes = await Quiz.find(filter)
            .populate('createdBy', 'fullName email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Quiz.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            quizzes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quizzes',
            error: error.message
        });
    }
};

// Get available quizzes for users
exports.getAvailableQuizzes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const now = new Date();

        const skip = (page - 1) * limit;
        const quizzes = await Quiz.find({
            isPublished: true,
            $or: [
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } },
                { startDate: { $lte: now }, endDate: { $gte: now } }
            ]
        })
            .select('-questions')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Quiz.countDocuments({
            isPublished: true,
            $or: [
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } },
                { startDate: { $lte: now }, endDate: { $gte: now } }
            ]
        });

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            quizzes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quizzes',
            error: error.message
        });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId)
            .populate('createdBy', 'fullName email')
            .populate('questions');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            success: true,
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quiz',
            error: error.message
        });
    }
};

// Update quiz (Admin only)
exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, description, questions, timeLimit, maxAttempts, passingScore, startDate, endDate } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.isPublished) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update published quiz'
            });
        }

        if (title) quiz.title = title;
        if (description) quiz.description = description;
        if (questions) {
            const questionDocs = await Question.find({ _id: { $in: questions } });
            if (questionDocs.length !== questions.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more questions not found'
                });
            }
            quiz.questions = questions;
        }
        if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
        if (maxAttempts !== undefined) quiz.maxAttempts = maxAttempts;
        if (passingScore !== undefined) quiz.passingScore = passingScore;
        if (startDate) quiz.startDate = startDate;
        if (endDate) quiz.endDate = endDate;

        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update quiz',
            error: error.message
        });
    }
};

// Publish quiz (Admin only)
exports.publishQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Quiz must contain at least one question'
            });
        }

        quiz.isPublished = true;
        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Quiz published successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to publish quiz',
            error: error.message
        });
    }
};

// Unpublish quiz (Admin only)
exports.unpublishQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        quiz.isPublished = false;
        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Quiz unpublished successfully',
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to unpublish quiz',
            error: error.message
        });
    }
};

// Delete quiz (Admin only)
exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        await Quiz.findByIdAndDelete(quizId);

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete quiz',
            error: error.message
        });
    }
};

// Preview quiz (Admin only)
exports.previewQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            success: true,
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to preview quiz',
            error: error.message
        });
    }
};

// Get quiz statistics (Admin only)
exports.getQuizStatistics = async (req, res) => {
    try {
        const totalQuizzes = await Quiz.countDocuments();
        const publishedQuizzes = await Quiz.countDocuments({ isPublished: true });
        const draftQuizzes = await Quiz.countDocuments({ isPublished: false });

        res.status(200).json({
            success: true,
            statistics: {
                totalQuizzes,
                publishedQuizzes,
                draftQuizzes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};
