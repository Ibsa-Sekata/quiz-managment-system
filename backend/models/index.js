const sequelize = require('../config/database');
const User = require('./User');
const Question = require('./Question');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizSession = require('./QuizSession');
const SessionAnswer = require('./SessionAnswer');
const Result = require('./Result');

// Define associations
User.hasMany(Question, { foreignKey: 'createdById', as: 'questions' });
Question.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

User.hasMany(Quiz, { foreignKey: 'createdById', as: 'quizzes' });
Quiz.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId', as: 'quizQuestions' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId' });

Question.hasMany(QuizQuestion, { foreignKey: 'questionId', as: 'quizzes' });
QuizQuestion.belongsTo(Question, { foreignKey: 'questionId' });

User.hasMany(QuizSession, { foreignKey: 'userId', as: 'sessions' });
QuizSession.belongsTo(User, { foreignKey: 'userId' });

Quiz.hasMany(QuizSession, { foreignKey: 'quizId', as: 'sessions' });
QuizSession.belongsTo(Quiz, { foreignKey: 'quizId' });

QuizSession.hasMany(SessionAnswer, { foreignKey: 'sessionId', as: 'answers' });
SessionAnswer.belongsTo(QuizSession, { foreignKey: 'sessionId' });

Question.hasMany(SessionAnswer, { foreignKey: 'questionId', as: 'sessionAnswers' });
SessionAnswer.belongsTo(Question, { foreignKey: 'questionId' });

User.hasMany(Result, { foreignKey: 'userId', as: 'results' });
Result.belongsTo(User, { foreignKey: 'userId' });

Quiz.hasMany(Result, { foreignKey: 'quizId', as: 'results' });
Result.belongsTo(Quiz, { foreignKey: 'quizId' });

QuizSession.hasOne(Result, { foreignKey: 'quizSessionId', as: 'result' });
Result.belongsTo(QuizSession, { foreignKey: 'quizSessionId' });

module.exports = {
    sequelize,
    User,
    Question,
    Quiz,
    QuizQuestion,
    QuizSession,
    SessionAnswer,
    Result
};
