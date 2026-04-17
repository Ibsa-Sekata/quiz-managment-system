const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 5000]
        }
    },
    optionA: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    optionB: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    optionC: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    optionD: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    correctAnswerIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 3
        }
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium'
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'questions'
});

module.exports = Question;
