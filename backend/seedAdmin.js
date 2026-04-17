const { sequelize, User } = require('./models');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        await sequelize.sync();

        // Check if admin already exists
        const existing = await User.findOne({ where: { email: 'admin@quiz.com' } });
        if (existing) {
            console.log('Admin already exists! Email: admin@quiz.com');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            fullName: 'Admin',
            email: 'admin@quiz.com',
            password: 'Admin123',
            role: 'admin',
            status: 'approved'
        });

        console.log('');
        console.log('========================================');
        console.log('  Admin created successfully!');
        console.log('========================================');
        console.log('  Email   : ');
        console.log('  Password: Admin123');
        console.log('  Role    : admin');
        console.log('========================================');
        console.log('  Login at: http://localhost:3000/login');
        console.log('========================================');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
