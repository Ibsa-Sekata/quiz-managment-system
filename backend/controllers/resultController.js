const { Result, QuizSession, SessionAnswer, Quiz, Question, QuizQuestion, QuizPermission, User } = require('../models');

// ─── Start quiz session ───────────────────────────────────────────────────────
exports.startQuizSession = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        if (!quiz.isPublished) return res.status(400).json({ success: false, message: 'Quiz is not published' });

        // Check quiz permission
        const permission = await QuizPermission.findOne({ where: { userId, quizId } });
        if (!permission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to take this quiz. Please contact your administrator.'
            });
        }

        // Check attempt limit
        if (quiz.maxAttempts) {
            const attemptCount = await Result.count({ where: { userId, quizId } });
            if (attemptCount >= quiz.maxAttempts) {
                return res.status(400).json({ success: false, message: `Maximum attempts (${quiz.maxAttempts}) reached` });
            }
        }

        const quizQuestions = await QuizQuestion.findAll({
            where: { quizId },
            include: [{ model: Question, as: 'Question' }],
            order: [['order', 'ASC']]
        });

        const session = await QuizSession.create({
            userId, quizId,
            totalQuestions: quizQuestions.length,
            status: 'in-progress'
        });

        res.status(201).json({
            success: true,
            message: 'Quiz session started',
            session: {
                sessionId: session.id,
                quizId: quiz.id,
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                totalQuestions: quizQuestions.length,
                questions: quizQuestions.map(qq => ({
                    _id: qq.Question.id,
                    questionText: qq.Question.questionText,
                    options: [
                        { text: qq.Question.optionA },
                        { text: qq.Question.optionB },
                        { text: qq.Question.optionC },
                        { text: qq.Question.optionD }
                    ]
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start quiz session', error: error.message });
    }
};

// ─── Submit answer ────────────────────────────────────────────────────────────
exports.submitAnswer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { questionId, selectedAnswerIndex } = req.body;

        const session = await QuizSession.findByPk(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Quiz session not found' });
        if (session.status !== 'in-progress') return res.status(400).json({ success: false, message: 'Quiz session is not in progress' });

        const question = await Question.findByPk(questionId);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;
        await SessionAnswer.create({ sessionId, questionId, selectedAnswerIndex, isCorrect });

        if (isCorrect) { session.correctAnswers += 1; await session.save(); }

        res.status(200).json({ success: true, message: 'Answer submitted', isCorrect });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit answer', error: error.message });
    }
};

// ─── Submit quiz ──────────────────────────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await QuizSession.findByPk(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Quiz session not found' });
        if (session.status !== 'in-progress') return res.status(400).json({ success: false, message: 'Quiz session is not in progress' });

        const quiz = await Quiz.findByPk(session.quizId);
        const score = (session.correctAnswers / session.totalQuestions) * 100;
        const isPassed = score >= quiz.passingScore;
        const timeSpent = Math.floor((Date.now() - new Date(session.startedAt)) / 1000);

        session.status = 'completed';
        session.score = Math.round(score * 100) / 100;
        session.completedAt = new Date();
        session.timeSpent = timeSpent;
        await session.save();

        const attemptNumber = await Result.count({ where: { userId: session.userId, quizId: session.quizId } });

        const result = await Result.create({
            userId: session.userId,
            quizId: session.quizId,
            quizSessionId: session.id,
            score: Math.round(score * 100) / 100,
            totalQuestions: session.totalQuestions,
            correctAnswers: session.correctAnswers,
            incorrectAnswers: session.totalQuestions - session.correctAnswers,
            timeSpent,
            isPassed,
            attemptNumber: attemptNumber + 1,
            feedback: isPassed ? 'Congratulations! You passed the quiz.' : 'You did not pass. Try again!'
        });

        // Build review
        const sessionAnswers = await SessionAnswer.findAll({
            where: { sessionId: session.id },
            include: [{ model: Question, as: 'Question' }]
        });
        const quizQuestions = await QuizQuestion.findAll({
            where: { quizId: session.quizId },
            include: [{ model: Question, as: 'Question' }],
            order: [['order', 'ASC']]
        });

        const answeredMap = {};
        sessionAnswers.forEach(sa => { answeredMap[sa.questionId] = sa; });

        const review = quizQuestions.map((qq, index) => {
            const q = qq.Question;
            const sa = answeredMap[q.id];
            const options = [q.optionA, q.optionB, q.optionC, q.optionD];
            return {
                number: index + 1,
                questionText: q.questionText,
                options,
                correctAnswerIndex: q.correctAnswerIndex,
                correctAnswerText: options[q.correctAnswerIndex],
                selectedAnswerIndex: sa ? sa.selectedAnswerIndex : null,
                selectedAnswerText: sa ? options[sa.selectedAnswerIndex] : null,
                isCorrect: sa ? sa.isCorrect : false,
                isSkipped: !sa,
                explanation: q.explanation || null
            };
        });

        res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully',
            result: {
                resultId: result.id,
                score: result.score,
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                incorrectAnswers: result.incorrectAnswers,
                isPassed: result.isPassed,
                timeSpent: result.timeSpent,
                feedback: result.feedback,
                passingScore: quiz.passingScore,
                quizTitle: quiz.title,
                review
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
    }
};

// ─── Get current user results ─────────────────────────────────────────────────
exports.getUserResults = async (req, res) => {
    try {
        const userId = req.user.id;
        const { quizId, page = 1, limit = 10 } = req.query;

        let where = { userId };
        if (quizId) where.quizId = quizId;

        const offset = (page - 1) * limit;
        const { count, rows } = await Result.findAndCountAll({
            where,
            include: [{ association: 'Quiz', attributes: ['id', 'title'] }],
            offset, limit: parseInt(limit),
            order: [['completedAt', 'DESC']]
        });

        res.status(200).json({ success: true, total: count, page: parseInt(page), limit: parseInt(limit), results: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
    }
};

// ─── Get result by ID ─────────────────────────────────────────────────────────
exports.getResultById = async (req, res) => {
    try {
        const { resultId } = req.params;
        const result = await Result.findByPk(resultId, {
            include: [
                { association: 'User', attributes: ['id', 'fullName', 'email'] },
                { association: 'Quiz', attributes: ['id', 'title'] },
                { association: 'QuizSession' }
            ]
        });
        if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
        res.status(200).json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch result', error: error.message });
    }
};

// ─── Admin: Get ALL results (all users) ───────────────────────────────────────
exports.getAllResults = async (req, res) => {
    try {
        const { userId, quizId, page = 1, limit = 20 } = req.query;

        let where = {};
        if (userId) where.userId = userId;
        if (quizId) where.quizId = quizId;

        const offset = (page - 1) * limit;
        const { count, rows } = await Result.findAndCountAll({
            where,
            include: [
                { association: 'User', attributes: ['id', 'fullName', 'email'] },
                { association: 'Quiz', attributes: ['id', 'title'] }
            ],
            offset, limit: parseInt(limit),
            order: [['completedAt', 'DESC']]
        });

        res.status(200).json({ success: true, total: count, page: parseInt(page), limit: parseInt(limit), results: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
    }
};

// ─── Admin: Get results for a specific user ───────────────────────────────────
exports.getUserResultsAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, { attributes: ['id', 'fullName', 'email'] });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const results = await Result.findAll({
            where: { userId },
            include: [{ association: 'Quiz', attributes: ['id', 'title', 'passingScore'] }],
            order: [['completedAt', 'DESC']]
        });

        res.status(200).json({ success: true, user, results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user results', error: error.message });
    }
};

// ─── Get quiz performance statistics (Admin) ──────────────────────────────────
exports.getQuizPerformance = async (req, res) => {
    try {
        const { quizId } = req.params;
        const results = await Result.findAll({
            where: { quizId },
            include: [{ association: 'User', attributes: ['id', 'fullName', 'email'] }],
            order: [['completedAt', 'DESC']]
        });

        if (results.length === 0) {
            return res.status(200).json({ success: true, statistics: { totalAttempts: 0, averageScore: 0, passRate: 0, totalUsers: 0 }, results: [] });
        }

        const totalAttempts = results.length;
        const averageScore = Math.round(results.reduce((sum, r) => sum + parseFloat(r.score), 0) / results.length);
        const passedCount = results.filter(r => r.isPassed).length;
        const passRate = Math.round((passedCount / totalAttempts) * 100);
        const totalUsers = new Set(results.map(r => r.userId)).size;

        res.status(200).json({ success: true, statistics: { totalAttempts, averageScore, passRate, totalUsers }, results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch performance statistics', error: error.message });
    }
};

// ─── Get user performance statistics ─────────────────────────────────────────
exports.getUserPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const results = await Result.findAll({ where: { userId } });

        if (results.length === 0) {
            return res.status(200).json({ success: true, statistics: { totalQuizzesTaken: 0, averageScore: 0, passedQuizzes: 0, failedQuizzes: 0 } });
        }

        const totalQuizzesTaken = results.length;
        const averageScore = Math.round(results.reduce((sum, r) => sum + parseFloat(r.score), 0) / results.length);
        const passedQuizzes = results.filter(r => r.isPassed).length;
        const failedQuizzes = totalQuizzesTaken - passedQuizzes;

        res.status(200).json({ success: true, statistics: { totalQuizzesTaken, averageScore, passedQuizzes, failedQuizzes } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch performance statistics', error: error.message });
    }
};

// ─── Admin: Grant quiz permission to user ─────────────────────────────────────
exports.grantPermission = async (req, res) => {
    try {
        const { userId, quizId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        const existing = await QuizPermission.findOne({ where: { userId, quizId } });
        if (existing) return res.status(400).json({ success: false, message: 'Permission already granted' });

        const permission = await QuizPermission.create({ userId, quizId, grantedById: req.user.id });

        res.status(201).json({ success: true, message: `Permission granted to ${user.fullName} for "${quiz.title}"`, permission });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to grant permission', error: error.message });
    }
};

// ─── Admin: Revoke quiz permission from user ──────────────────────────────────
exports.revokePermission = async (req, res) => {
    try {
        const { userId, quizId } = req.body;

        const permission = await QuizPermission.findOne({ where: { userId, quizId } });
        if (!permission) return res.status(404).json({ success: false, message: 'Permission not found' });

        await permission.destroy();
        res.status(200).json({ success: true, message: 'Permission revoked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to revoke permission', error: error.message });
    }
};

// ─── Admin: Get all permissions for a quiz ────────────────────────────────────
exports.getQuizPermissions = async (req, res) => {
    try {
        const { quizId } = req.params;

        const permissions = await QuizPermission.findAll({
            where: { quizId },
            include: [{ association: 'User', attributes: ['id', 'fullName', 'email'] }],
            order: [['grantedAt', 'DESC']]
        });

        res.status(200).json({ success: true, permissions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch permissions', error: error.message });
    }
};

// ─── Admin: Get all permissions for a user ────────────────────────────────────
exports.getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;

        const permissions = await QuizPermission.findAll({
            where: { userId },
            include: [{ association: 'Quiz', attributes: ['id', 'title', 'isPublished'] }],
            order: [['grantedAt', 'DESC']]
        });

        res.status(200).json({ success: true, permissions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user permissions', error: error.message });
    }
};

// ─── Admin: Grant permission to ALL approved users for a quiz ─────────────────
exports.grantPermissionToAll = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        const approvedUsers = await User.findAll({ where: { status: 'approved', role: 'user' } });

        let granted = 0;
        for (const user of approvedUsers) {
            const exists = await QuizPermission.findOne({ where: { userId: user.id, quizId } });
            if (!exists) {
                await QuizPermission.create({ userId: user.id, quizId, grantedById: req.user.id });
                granted++;
            }
        }

        res.status(200).json({ success: true, message: `Permission granted to ${granted} users for "${quiz.title}"` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to grant permissions', error: error.message });
    }
};
