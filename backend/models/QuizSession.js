const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizSession = sequelize.define('QuizSession', {
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
    status: {
        type: DataTypes.ENUM('in-progress', 'submitted', 'completed'),
        defaultValue: 'in-progress'
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correctAnswers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'quiz_sessions'
});

module.exports = QuizSession;
