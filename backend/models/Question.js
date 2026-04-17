const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        minlength: [10, 'Question must be at least 10 characters']
    },
    options: {
        type: [
            {
                text: {
                    type: String,
                    required: true,
                    trim: true
                },
                isCorrect: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        validate: {
            validator: function (v) {
                return v.length === 4;
            },
            message: 'Question must have exactly 4 options'
        }
    },
    correctAnswerIndex: {
        type: Number,
        required: [true, 'Correct answer index is required'],
        min: 0,
        max: 3
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    tags: {
        type: [String],
        default: []
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    explanation: {
        type: String,
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
questionSchema.index({ category: 1, tags: 1 });
questionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Question', questionSchema);
