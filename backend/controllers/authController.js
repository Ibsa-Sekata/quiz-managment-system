const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '2h'
    });
};

// Register user
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create new user with pending status
        const user = await User.create({
            fullName,
            email,
            password,
            status: 'pending',
            role: 'user'
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please wait for admin approval.',
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is approved
        if (user.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Your account has not been approved yet.'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Logout user
exports.logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
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
