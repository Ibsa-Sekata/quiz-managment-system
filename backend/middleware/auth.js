const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    next();
};

// Check if user is approved
exports.isApproved = (req, res, next) => {
    if (req.user.status !== 'approved') {
        return res.status(403).json({ success: false, message: 'Your account has not been approved yet.' });
    }
    next();
};
