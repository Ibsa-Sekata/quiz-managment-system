const { Quiz, Question, QuizQuestion, QuizSession, Result, User } = require('../models');
const { Op } = require('sequelize');

// Create quiz (Admin only)
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, questions, timeLimit, maxAttempts, passingScore, startDate, endDate } = req.body;

        // Validate questions exist
        const questionDocs = await Question.findAll({ where: { id: questions } });
        if (questionDocs.length !== questions.length) {
            return res.status(400).json({ success: false, message: 'One or more questions not found' });
        }

        const quiz = await Quiz.create({
            title,
            description,
            timeLimit: timeLimit || null,
            maxAttempts: maxAttempts || null,
            passingScore: passingScore || 50,
            startDate: startDate || null,
            endDate: endDate || null,
            createdById: req.user.id,
            isPublished: false
        });

        // Create quiz-question associations with order
        const quizQuestions = questions.map((qId, index) => ({
            quizId: quiz.id,
            questionId: qId,
            order: index + 1
        }));
        await QuizQuestion.bulkCreate(quizQuestions);

        res.status(201).json({ success: true, message: 'Quiz created successfully', quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create quiz', error: error.message });
    }
};

// Get all quizzes (Admin only)
exports.getAllQuizzes = async (req, res) => {
    try {
        const { isPublished, page = 1, limit = 10 } = req.query;
        let where = {};
        if (isPublished !== undefined) where.isPublished = isPublished === 'true';

        const offset = (page - 1) * limit;
        const { count, rows } = await Quiz.findAndCountAll({
            where,
            include: [{ association: 'creator', attributes: ['id', 'fullName', 'email'] }],
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, total: count, page: parseInt(page), limit: parseInt(limit), quizzes: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
    }
};

// Get available quizzes for users
exports.getAvailableQuizzes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const now = new Date();

        const where = {
            isPublished: true,
            [Op.or]: [
                { startDate: null, endDate: null },
                { startDate: { [Op.lte]: now }, endDate: null },
                { startDate: null, endDate: { [Op.gte]: now } },
                { startDate: { [Op.lte]: now }, endDate: { [Op.gte]: now } }
            ]
        };

        const offset = (page - 1) * limit;
        const { count, rows } = await Quiz.findAndCountAll({
            where,
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, total: count, page: parseInt(page), limit: parseInt(limit), quizzes: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findByPk(quizId, {
            include: [
                { association: 'creator', attributes: ['id', 'fullName', 'email'] },
                {
                    model: QuizQuestion,
                    as: 'quizQuestions',
                    include: [{ model: Question, as: 'Question' }],
                    order: [['order', 'ASC']]
                }
            ]
        });

        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        res.status(200).json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
    }
};

// Update quiz (Admin only)
exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, description, questions, timeLimit, maxAttempts, passingScore, startDate, endDate } = req.body;

        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        if (quiz.isPublished) return res.status(400).json({ success: false, message: 'Cannot update a published quiz. Unpublish it first.' });

        if (title) quiz.title = title;
        if (description) quiz.description = description;
        if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
        if (maxAttempts !== undefined) quiz.maxAttempts = maxAttempts;
        if (passingScore !== undefined) quiz.passingScore = passingScore;
        if (startDate) quiz.startDate = startDate;
        if (endDate) quiz.endDate = endDate;
        await quiz.save();

        if (questions) {
            const questionDocs = await Question.findAll({ where: { id: questions } });
            if (questionDocs.length !== questions.length) {
                return res.status(400).json({ success: false, message: 'One or more questions not found' });
            }
            await QuizQuestion.destroy({ where: { quizId } });
            const quizQuestions = questions.map((qId, index) => ({ quizId: quiz.id, questionId: qId, order: index + 1 }));
            await QuizQuestion.bulkCreate(quizQuestions);
        }

        res.status(200).json({ success: true, message: 'Quiz updated successfully', quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update quiz', error: error.message });
    }
};

// Publish quiz (Admin only)
exports.publishQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        const questionCount = await QuizQuestion.count({ where: { quizId } });
        if (questionCount === 0) return res.status(400).json({ success: false, message: 'Quiz must contain at least one question' });

        quiz.isPublished = true;
        await quiz.save();
        res.status(200).json({ success: true, message: 'Quiz published successfully', quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to publish quiz', error: error.message });
    }
};

// Unpublish quiz (Admin only)
exports.unpublishQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        quiz.isPublished = false;
        await quiz.save();
        res.status(200).json({ success: true, message: 'Quiz unpublished successfully', quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to unpublish quiz', error: error.message });
    }
};

// Delete quiz (Admin only)
exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        await QuizQuestion.destroy({ where: { quizId } });
        await quiz.destroy();
        res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete quiz', error: error.message });
    }
};

// Preview quiz (Admin only)
exports.previewQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findByPk(quizId, {
            include: [{
                model: QuizQuestion,
                as: 'quizQuestions',
                include: [{ model: Question, as: 'Question' }],
                order: [['order', 'ASC']]
            }]
        });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        res.status(200).json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to preview quiz', error: error.message });
    }
};

// Get quiz statistics (Admin only)
exports.getQuizStatistics = async (req, res) => {
    try {
        const totalQuizzes = await Quiz.count();
        const publishedQuizzes = await Quiz.count({ where: { isPublished: true } });
        const draftQuizzes = await Quiz.count({ where: { isPublished: false } });
        res.status(200).json({ success: true, statistics: { totalQuizzes, publishedQuizzes, draftQuizzes } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
    }
};
