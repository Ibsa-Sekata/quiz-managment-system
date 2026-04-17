const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [3, 255]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1
        }
    },
    maxAttempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1
        }
    },
    passingScore: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        validate: {
            min: 0,
            max: 100
        }
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
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
    tableName: 'quizzes'
});

module.exports = Quiz;
