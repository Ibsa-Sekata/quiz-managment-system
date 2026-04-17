const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    answers: {
        type: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                    required: true
                },
                selectedAnswerIndex: {
                    type: Number,
                    required: true
                },
                isCorrect: {
                    type: Boolean,
                    default: false
                },
                answeredAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: []
    },
    status: {
        type: String,
        enum: ['in-progress', 'submitted', 'completed'],
        default: 'in-progress'
    },
    score: {
        type: Number,
        default: null
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    timeSpent: {
        type: Number,
        default: 0 // in seconds
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for faster queries
quizSessionSchema.index({ userId: 1, quizId: 1 });
quizSessionSchema.index({ status: 1 });

module.exports = mongoose.model('QuizSession', quizSessionSchema);
