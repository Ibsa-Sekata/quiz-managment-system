const Result = require('../models/Result');
const QuizSession = require('../models/QuizSession');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Start quiz session
exports.startQuizSession = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user._id;

        // Check if quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (!quiz.isPublished) {
            return res.status(400).json({
                success: false,
                message: 'Quiz is not published'
            });
        }

        // Check attempt limit
        if (quiz.maxAttempts) {
            const attemptCount = await Result.countDocuments({ userId, quizId });
            if (attemptCount >= quiz.maxAttempts) {
                return res.status(400).json({
                    success: false,
                    message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`
                });
            }
        }

        // Create quiz session
        const session = new QuizSession({
            userId,
            quizId,
            totalQuestions: quiz.questions.length,
            status: 'in-progress'
        });

        await session.save();

        // Get quiz with questions
        const populatedQuiz = await Quiz.findById(quizId).populate('questions');

        res.status(201).json({
            success: true,
            message: 'Quiz session started',
            session: {
                sessionId: session._id,
                quizId: quiz._id,
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                totalQuestions: quiz.questions.length,
                questions: populatedQuiz.questions.map(q => ({
                    _id: q._id,
                    questionText: q.questionText,
                    options: q.options.map(opt => ({ text: opt.text }))
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to start quiz session',
            error: error.message
        });
    }
};

// Submit answer
exports.submitAnswer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { questionId, selectedAnswerIndex } = req.body;

        const session = await QuizSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Quiz session not found'
            });
        }

        if (session.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Quiz session is not in progress'
            });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;

        // Add answer to session
        session.answers.push({
            questionId,
            selectedAnswerIndex,
            isCorrect
        });

        if (isCorrect) {
            session.correctAnswers += 1;
        }

        await session.save();

        res.status(200).json({
            success: true,
            message: 'Answer submitted',
            isCorrect
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit answer',
            error: error.message
        });
    }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await QuizSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Quiz session not found'
            });
        }

        if (session.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Quiz session is not in progress'
            });
        }

        // Calculate score
        const score = (session.correctAnswers / session.totalQuestions) * 100;
        const quiz = await Quiz.findById(session.quizId);
        const isPassed = score >= quiz.passingScore;

        // Calculate time spent
        const timeSpent = Math.floor((Date.now() - session.startedAt) / 1000);

        // Update session
        session.status = 'completed';
        session.score = Math.round(score);
        session.completedAt = new Date();
        session.timeSpent = timeSpent;
        await session.save();

        // Create result
        const result = new Result({
            userId: session.userId,
            quizId: session.quizId,
            quizSessionId: session._id,
            score: Math.round(score),
            totalQuestions: session.totalQuestions,
            correctAnswers: session.correctAnswers,
            incorrectAnswers: session.totalQuestions - session.correctAnswers,
            timeSpent,
            isPassed,
            attemptNumber: await Result.countDocuments({ userId: session.userId, quizId: session.quizId }) + 1
        });

        await result.save();

        res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully',
            result: {
                score: result.score,
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                incorrectAnswers: result.incorrectAnswers,
                isPassed: result.isPassed,
                timeSpent: result.timeSpent,
                feedback: isPassed ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz. Try again!'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit quiz',
            error: error.message
        });
    }
};

// Get user results
exports.getUserResults = async (req, res) => {
    try {
        const userId = req.user._id;
        const { quizId, page = 1, limit = 10 } = req.query;

        let filter = { userId };
        if (quizId) filter.quizId = quizId;

        const skip = (page - 1) * limit;
        const results = await Result.find(filter)
            .populate('quizId', 'title')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ completedAt: -1 });

        const total = await Result.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch results',
            error: error.message
        });
    }
};

// Get result by ID
exports.getResultById = async (req, res) => {
    try {
        const { resultId } = req.params;

        const result = await Result.findById(resultId)
            .populate('userId', 'fullName email')
            .populate('quizId', 'title')
            .populate('quizSessionId');

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            });
        }

        res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch result',
            error: error.message
        });
    }
};

// Get quiz performance statistics (Admin only)
exports.getQuizPerformance = async (req, res) => {
    try {
        const { quizId } = req.params;

        const results = await Result.find({ quizId });
        if (results.length === 0) {
            return res.status(200).json({
                success: true,
                statistics: {
                    totalAttempts: 0,
                    averageScore: 0,
                    passRate: 0,
                    totalUsers: 0
                }
            });
        }

        const totalAttempts = results.length;
        const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
        const passedCount = results.filter(r => r.isPassed).length;
        const passRate = Math.round((passedCount / totalAttempts) * 100);
        const totalUsers = new Set(results.map(r => r.userId.toString())).size;

        res.status(200).json({
            success: true,
            statistics: {
                totalAttempts,
                averageScore,
                passRate,
                totalUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance statistics',
            error: error.message
        });
    }
};

// Get user performance statistics
exports.getUserPerformance = async (req, res) => {
    try {
        const userId = req.user._id;

        const results = await Result.find({ userId });
        if (results.length === 0) {
            return res.status(200).json({
                success: true,
                statistics: {
                    totalQuizzesTaken: 0,
                    averageScore: 0,
                    passedQuizzes: 0,
                    failedQuizzes: 0
                }
            });
        }

        const totalQuizzesTaken = results.length;
        const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
        const passedQuizzes = results.filter(r => r.isPassed).length;
        const failedQuizzes = totalQuizzesTaken - passedQuizzes;

        res.status(200).json({
            success: true,
            statistics: {
                totalQuizzesTaken,
                averageScore,
                passedQuizzes,
                failedQuizzes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance statistics',
            error: error.message
        });
    }
};
