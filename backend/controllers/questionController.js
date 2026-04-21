const { Question, Quiz, QuizQuestion } = require('../models');
const { Op } = require('sequelize');

// Create single question (Admin only)
exports.createQuestion = async (req, res) => {
    try {
        const { questionText, options, correctAnswerIndex, category, tags, difficulty, explanation } = req.body;

        const question = await Question.create({
            questionText,
            optionA: options[0],
            optionB: options[1],
            optionC: options[2],
            optionD: options[3],
            correctAnswerIndex,
            category,
            tags: tags || [],
            difficulty: difficulty || 'medium',
            explanation,
            createdById: req.user.id
        });

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

// Bulk create questions (Admin only)
exports.bulkCreateQuestions = async (req, res) => {
    try {
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Questions array is required' });
        }

        const created = [];
        const errors = [];

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            try {
                if (!q.questionText || !q.options || q.options.length !== 4 || !q.category) {
                    errors.push({ index: i + 1, message: 'Missing required fields' });
                    continue;
                }
                if (q.options.some(o => !o || !String(o).trim())) {
                    errors.push({ index: i + 1, message: 'All 4 options must have text' });
                    continue;
                }
                const question = await Question.create({
                    questionText: q.questionText,
                    optionA: q.options[0],
                    optionB: q.options[1],
                    optionC: q.options[2],
                    optionD: q.options[3],
                    correctAnswerIndex: q.correctAnswerIndex || 0,
                    category: q.category,
                    tags: q.tags || [],
                    difficulty: q.difficulty || 'medium',
                    explanation: q.explanation || null,
                    createdById: req.user.id
                });
                created.push(question);
            } catch (err) {
                errors.push({ index: i + 1, message: err.message });
            }
        }

        res.status(201).json({
            success: true,
            message: `${created.length} question(s) created${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
            created: created.length,
            failed: errors.length,
            errors
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to bulk create questions', error: error.message });
    }
};

// Get all questions (Admin only)
exports.getAllQuestions = async (req, res) => {
    try {
        const { category, difficulty, tags, page = 1, limit = 10 } = req.query;

        let where = {};
        if (category) where.category = category;
        if (difficulty) where.difficulty = difficulty;
        if (tags) where.tags = { [Op.contains]: tags.split(',') };

        const offset = (page - 1) * limit;
        const { count, rows } = await Question.findAndCountAll({
            where,
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            questions: rows
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

        const question = await Question.findByPk(questionId, {
            include: [{ association: 'creator', attributes: ['id', 'fullName', 'email'] }]
        });

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

        const question = await Question.findByPk(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if question is used in any quiz
        const quizCount = await QuizQuestion.count({ where: { questionId } });
        if (quizCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update question that is used in active quizzes'
            });
        }

        if (questionText) question.questionText = questionText;
        if (options) {
            question.optionA = options[0];
            question.optionB = options[1];
            question.optionC = options[2];
            question.optionD = options[3];
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

        const question = await Question.findByPk(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if question is used in any quiz
        const quizCount = await QuizQuestion.count({ where: { questionId } });
        if (quizCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete question that is used in active quizzes'
            });
        }

        await question.destroy();

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

        const offset = (page - 1) * limit;
        const { count, rows } = await Question.findAndCountAll({
            where: { category },
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            questions: rows
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
        const totalQuestions = await Question.count();
        const easyQuestions = await Question.count({ where: { difficulty: 'easy' } });
        const mediumQuestions = await Question.count({ where: { difficulty: 'medium' } });
        const hardQuestions = await Question.count({ where: { difficulty: 'hard' } });

        const categories = await Question.findAll({
            attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('category')), 'category']],
            raw: true
        });

        res.status(200).json({
            success: true,
            statistics: {
                totalQuestions,
                easyQuestions,
                mediumQuestions,
                hardQuestions,
                categories: categories.map(c => c.category)
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
