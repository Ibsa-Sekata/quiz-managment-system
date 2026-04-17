const User = require('../models/User');

// Get all pending registration requests (Admin only)
exports.getPendingRequests = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: 'pending' }).sort({ createdAt: -1 });

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

        const user = await User.findById(userId);
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

        const user = await User.findById(userId);
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

        let filter = {};
        if (status) filter.status = status;
        if (role) filter.role = role;

        const skip = (page - 1) * limit;
        const users = await User.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            users
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

        const user = await User.findById(userId);
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
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (fullName) user.fullName = fullName;
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
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
        const totalUsers = await User.countDocuments();
        const approvedUsers = await User.countDocuments({ status: 'approved' });
        const pendingUsers = await User.countDocuments({ status: 'pending' });
        const rejectedUsers = await User.countDocuments({ status: 'rejected' });
        const adminUsers = await User.countDocuments({ role: 'admin' });

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
