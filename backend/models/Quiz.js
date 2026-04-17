const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters']
    },
    description: {
        type: String,
        required: [true, 'Quiz description is required'],
        trim: true
    },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Question',
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Quiz must contain at least one question'
        }
    },
    timeLimit: {
        type: Number,
        default: null, // in minutes, null means no limit
        min: [1, 'Time limit must be at least 1 minute']
    },
    maxAttempts: {
        type: Number,
        default: null, // null means unlimited attempts
        min: [1, 'Max attempts must be at least 1']
    },
    passingScore: {
        type: Number,
        default: 50,
        min: [0, 'Passing score cannot be negative'],
        max: [100, 'Passing score cannot exceed 100']
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
quizSchema.index({ isPublished: 1, createdBy: 1 });
quizSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
