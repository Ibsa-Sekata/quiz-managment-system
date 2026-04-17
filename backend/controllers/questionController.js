const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// Create question (Admin only)
exports.createQuestion = async (req, res) => {
    try {
        const { questionText, options, correctAnswerIndex, category, tags, difficulty, explanation } = req.body;

        const question = new Question({
            questionText,
            options: options.map((text, index) => ({
                text,
                isCorrect: index === correctAnswerIndex
            })),
            correctAnswerIndex,
            category,
            tags: tags || [],
            difficulty: difficulty || 'medium',
            explanation,
            createdBy: req.user._id
        });

        await question.save();

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create question',
            error: error.message
        });
    }
};

// Get all questions (Admin only)
exports.getAllQuestions = async (req, res) => {
    try {
        const { category, difficulty, tags, page = 1, limit = 10 } = req.query;

        let filter = {};
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (tags) filter.tags = { $in: tags.split(',') };

        const skip = (page - 1) * limit;
        const questions = await Question.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Question.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch questions',
            error: error.message
        });
    }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findById(questionId).populate('createdBy', 'fullName email');
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.status(200).json({
            success: true,
            question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch question',
            error: error.message
        });
    }
};

// Update question (Admin only)
exports.updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { questionText, options, correctAnswerIndex, category, tags, difficulty, explanation } = req.body;

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if question is used in any quiz
        const quizCount = await Quiz.countDocuments({ questions: questionId });
        if (quizCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update question that is used in active quizzes'
            });
        }

        if (questionText) question.questionText = questionText;
        if (options) {
            question.options = options.map((text, index) => ({
                text,
                isCorrect: index === correctAnswerIndex
            }));
        }
        if (correctAnswerIndex !== undefined) question.correctAnswerIndex = correctAnswerIndex;
        if (category) question.category = category;
        if (tags) question.tags = tags;
        if (difficulty) question.difficulty = difficulty;
        if (explanation) question.explanation = explanation;

        await question.save();

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update question',
            error: error.message
        });
    }
};

// Delete question (Admin only)
exports.deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if question is used in any quiz
        const quizCount = await Quiz.countDocuments({ questions: questionId });
        if (quizCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete question that is used in active quizzes'
            });
        }

        await Question.findByIdAndDelete(questionId);

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete question',
            error: error.message
        });
    }
};

// Get questions by category
exports.getQuestionsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;
        const questions = await Question.find({ category })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Question.countDocuments({ category });

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch questions',
            error: error.message
        });
    }
};

// Get question statistics (Admin only)
exports.getQuestionStatistics = async (req, res) => {
    try {
        const totalQuestions = await Question.countDocuments();
        const easyQuestions = await Question.countDocuments({ difficulty: 'easy' });
        const mediumQuestions = await Question.countDocuments({ difficulty: 'medium' });
        const hardQuestions = await Question.countDocuments({ difficulty: 'hard' });

        const categories = await Question.distinct('category');

        res.status(200).json({
            success: true,
            statistics: {
                totalQuestions,
                easyQuestions,
                mediumQuestions,
                hardQuestions,
                categories
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
