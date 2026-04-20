const sequelize = require('../config/database');
const User = require('./User');
const Question = require('./Question');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizSession = require('./QuizSession');
const SessionAnswer = require('./SessionAnswer');
const Result = require('./Result');
const QuizPermission = require('./QuizPermission');

// User <-> Question
User.hasMany(Question, { foreignKey: 'createdById', as: 'questions' });
Question.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// User <-> Quiz
User.hasMany(Quiz, { foreignKey: 'createdById', as: 'quizzes' });
Quiz.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Quiz <-> QuizQuestion <-> Question
Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId', as: 'quizQuestions' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId' });
Question.hasMany(QuizQuestion, { foreignKey: 'questionId', as: 'quizzes' });
QuizQuestion.belongsTo(Question, { foreignKey: 'questionId', as: 'Question' });

// User <-> QuizSession <-> Quiz
User.hasMany(QuizSession, { foreignKey: 'userId', as: 'sessions' });
QuizSession.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Quiz.hasMany(QuizSession, { foreignKey: 'quizId', as: 'sessions' });
QuizSession.belongsTo(Quiz, { foreignKey: 'quizId', as: 'Quiz' });

// QuizSession <-> SessionAnswer <-> Question
QuizSession.hasMany(SessionAnswer, { foreignKey: 'sessionId', as: 'answers' });
SessionAnswer.belongsTo(QuizSession, { foreignKey: 'sessionId' });
Question.hasMany(SessionAnswer, { foreignKey: 'questionId', as: 'sessionAnswers' });
SessionAnswer.belongsTo(Question, { foreignKey: 'questionId', as: 'Question' });

// User <-> Result <-> Quiz <-> QuizSession
User.hasMany(Result, { foreignKey: 'userId', as: 'results' });
Result.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Quiz.hasMany(Result, { foreignKey: 'quizId', as: 'results' });
Result.belongsTo(Quiz, { foreignKey: 'quizId', as: 'Quiz' });
QuizSession.hasOne(Result, { foreignKey: 'quizSessionId', as: 'result' });
Result.belongsTo(QuizSession, { foreignKey: 'quizSessionId', as: 'QuizSession' });

// QuizPermission
User.hasMany(QuizPermission, { foreignKey: 'userId', as: 'quizPermissions' });
QuizPermission.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Quiz.hasMany(QuizPermission, { foreignKey: 'quizId', as: 'permissions' });
QuizPermission.belongsTo(Quiz, { foreignKey: 'quizId', as: 'Quiz' });
User.hasMany(QuizPermission, { foreignKey: 'grantedById', as: 'grantedPermissions' });
QuizPermission.belongsTo(User, { foreignKey: 'grantedById', as: 'GrantedBy' });

module.exports = {
    sequelize,
    User,
    Question,
    Quiz,
    QuizQuestion,
    QuizSession,
    SessionAnswer,
    Result,
    QuizPermission
};
