const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
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
    quizSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizSession',
        required: true
    },
    score: {
        type: Number,
        required: [true, 'Score is required'],
        min: [0, 'Score cannot be negative'],
        max: [100, 'Score cannot exceed 100']
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    incorrectAnswers: {
        type: Number,
        required: true
    },
    timeSpent: {
        type: Number,
        required: true, // in seconds
        min: [0, 'Time spent cannot be negative']
    },
    isPassed: {
        type: Boolean,
        required: true
    },
    feedback: {
        type: String,
        default: null
    },
    attemptNumber: {
        type: Number,
        default: 1
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for faster queries
resultSchema.index({ userId: 1, quizId: 1 });
resultSchema.index({ userId: 1, completedAt: -1 });
resultSchema.index({ quizId: 1, completedAt: -1 });

module.exports = mongoose.model('Result', resultSchema);
