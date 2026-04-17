const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizQuestion = sequelize.define('QuizQuestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quizzes',
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
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'quiz_questions'
});

module.exports = QuizQuestion;
