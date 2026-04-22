const { User, Result, QuizSession, SessionAnswer, QuizPermission, Question, Quiz, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all pending registration requests (Admin only)
exports.getPendingRequests = async (req, res) => {
    try {
        const pendingUsers = await User.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: pendingUsers.length,
            users: pendingUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending requests',
            error: error.message
        });
    }
};

// Approve user registration (Admin only)
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'User is not in pending status'
            });
        }

        user.status = 'approved';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User approved successfully',
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to approve user',
            error: error.message
        });
    }
};

// Reject user registration (Admin only)
exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'User is not in pending status'
            });
        }

        user.status = 'rejected';
        user.rejectionReason = reason || 'No reason provided';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User rejected successfully',
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reject user',
            error: error.message
        });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const { status, role, page = 1, limit = 10 } = req.query;

        let where = {};
        if (status) where.status = status;
        if (role) where.role = role;

        const offset = (page - 1) * limit;
        const { count, rows } = await User.findAndCountAll({
            where,
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            users: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (fullName) user.fullName = fullName;
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// Get user statistics (Admin only)
exports.getUserStatistics = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const approvedUsers = await User.count({ where: { status: 'approved' } });
        const pendingUsers = await User.count({ where: { status: 'pending' } });
        const rejectedUsers = await User.count({ where: { status: 'rejected' } });
        const adminUsers = await User.count({ where: { role: 'admin' } });

        res.status(200).json({
            success: true,
            statistics: {
                totalUsers,
                approvedUsers,
                pendingUsers,
                rejectedUsers,
                adminUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { userId } = req.params;
        const targetUserId = parseInt(userId, 10);

        if (Number.isNaN(targetUserId)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid user id'
            });
        }

        if (req.user.id === targetUserId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findByPk(targetUserId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Admin accounts cannot be deleted'
            });
        }

        const [createdQuestionsCount, createdQuizzesCount] = await Promise.all([
            Question.count({ where: { createdById: targetUserId }, transaction }),
            Quiz.count({ where: { createdById: targetUserId }, transaction })
        ]);

        if (createdQuestionsCount > 0 || createdQuizzesCount > 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with authored quizzes or questions'
            });
        }

        const sessions = await QuizSession.findAll({
            where: { userId: targetUserId },
            attributes: ['id'],
            transaction
        });

        const sessionIds = sessions.map((session) => session.id);

        await Promise.all([
            Result.destroy({ where: { userId: targetUserId }, transaction }),
            QuizPermission.destroy({ where: { userId: targetUserId }, transaction }),
            QuizPermission.destroy({ where: { grantedById: targetUserId }, transaction })
        ]);

        if (sessionIds.length > 0) {
            await SessionAnswer.destroy({ where: { sessionId: sessionIds }, transaction });
        }

        await QuizSession.destroy({ where: { userId: targetUserId }, transaction });
        await user.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};
