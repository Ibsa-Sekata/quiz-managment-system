import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FiUsers, FiBook, FiBarChart3, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingRequests: 0,
        totalQuizzes: 0,
        publishedQuizzes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [userStats, quizStats] = await Promise.all([
                api.get('/users/statistics'),
                api.get('/quizzes/statistics')
            ]);

            setStats({
                totalUsers: userStats.data.statistics.totalUsers,
                pendingRequests: userStats.data.statistics.pendingUsers,
                totalQuizzes: quizStats.data.statistics.totalQuizzes,
                publishedQuizzes: quizStats.data.statistics.publishedQuizzes
            });
        } catch (error) {
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                </div>
                <Icon className="text-3xl text-gray-400" />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage quizzes, questions, and users</p>
            </div>

            {/* Stats Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={FiUsers}
                        title="Total Users"
                        value={stats.totalUsers}
                        color="border-blue-500"
                    />
                    <StatCard
                        icon={FiUsers}
                        title="Pending Approvals"
                        value={stats.pendingRequests}
                        color="border-yellow-500"
                    />
                    <StatCard
                        icon={FiBook}
                        title="Total Quizzes"
                        value={stats.totalQuizzes}
                        color="border-green-500"
                    />
                    <StatCard
                        icon={FiBarChart3}
                        title="Published Quizzes"
                        value={stats.publishedQuizzes}
                        color="border-purple-500"
                    />
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/users"
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiUsers className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Manage Users</h3>
                            <p className="text-sm text-gray-600">Approve or reject registrations</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/admin/quizzes"
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FiBook className="text-green-600 text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Manage Quizzes</h3>
                            <p className="text-sm text-gray-600">Create and publish quizzes</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/admin/questions"
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiPlus className="text-purple-600 text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Manage Questions</h3>
                            <p className="text-sm text-gray-600">Create and organize questions</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
