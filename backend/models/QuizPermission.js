const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tracks which users have been granted permission to take which quizzes
const QuizPermission = sequelize.define('QuizPermission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'quizzes', key: 'id' }
    },
    grantedById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    grantedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'quiz_permissions',
    indexes: [
        { unique: true, fields: ['user_id', 'quiz_id'] }
    ]
});

module.exports = QuizPermission;
