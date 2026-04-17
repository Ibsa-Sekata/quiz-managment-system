const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionAnswer = sequelize.define('SessionAnswer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quiz_sessions',
            key: 'id'
        }
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'questions',
            key: 'id'
        }
    },
    selectedAnswerIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 3
        }
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    answeredAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'session_answers'
});

module.exports = SessionAnswer;
