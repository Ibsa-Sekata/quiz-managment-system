const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Result = sequelize.define('Result', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quizzes',
            key: 'id'
        }
    },
    quizSessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quiz_sessions',
            key: 'id'
        }
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correctAnswers: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    incorrectAnswers: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    isPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    attemptNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'results'
});

module.exports = Result;
