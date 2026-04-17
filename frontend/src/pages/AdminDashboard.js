import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FiUsers, FiBook, FiBarChart2, FiPlus, FiGrid } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';
import ManageUsers from './admin/ManageUsers';
import ManageQuestions from './admin/ManageQuestions';
import ManageQuizzes from './admin/ManageQuizzes';

const Overview = () => {
    const [stats, setStats] = useState({ totalUsers: 0, pendingRequests: 0, totalQuizzes: 0, publishedQuizzes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            } catch { toast.error('Failed to fetch statistics'); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    const StatCard = ({ icon: Icon, title, value, color, bg }) => (
        <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon className="text-xl text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                <StatCard icon={FiUsers} title="Total Users" value={stats.totalUsers} color="border-blue-500" bg="bg-blue-500" />
                <StatCard icon={FiUsers} title="Pending Approvals" value={stats.pendingRequests} color="border-yellow-500" bg="bg-yellow-500" />
                <StatCard icon={FiBook} title="Total Quizzes" value={stats.totalQuizzes} color="border-green-500" bg="bg-green-500" />
                <StatCard icon={FiBarChart2} title="Published Quizzes" value={stats.publishedQuizzes} color="border-purple-500" bg="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Link to="/admin/users" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition">
                            <FiUsers className="text-blue-600 group-hover:text-white text-xl transition" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Manage Users</h3>
                            <p className="text-sm text-gray-500">Approve or reject registrations</p>
                        </div>
                    </div>
                </Link>
                <Link to="/admin/quizzes" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition">
                            <FiBook className="text-green-600 group-hover:text-white text-xl transition" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Manage Quizzes</h3>
                            <p className="text-sm text-gray-500">Create and publish quizzes</p>
                        </div>
                    </div>
                </Link>
                <Link to="/admin/questions" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition">
                            <FiPlus className="text-purple-600 group-hover:text-white text-xl transition" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Manage Questions</h3>
                            <p className="text-sm text-gray-500">Create and organize questions</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const location = useLocation();

    const navItems = [
        { path: '/admin', label: 'Overview', icon: FiGrid, exact: true },
        { path: '/admin/users', label: 'Users', icon: FiUsers },
        { path: '/admin/questions', label: 'Questions', icon: FiPlus },
        { path: '/admin/quizzes', label: 'Quizzes', icon: FiBook },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-56 bg-white shadow-sm flex-shrink-0 hidden md:block">
                <div className="p-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</p>
                </div>
                <nav className="p-3 space-y-1">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive(item.path, item.exact)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={17} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile nav */}
            <div className="md:hidden w-full fixed bottom-0 left-0 bg-white border-t border-gray-200 flex z-40">
                {navItems.map(item => (
                    <Link key={item.path} to={item.path}
                        className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition ${isActive(item.path, item.exact) ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                        <item.icon size={20} />
                        <span className="mt-0.5">{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
                <Routes>
                    <Route index element={<Overview />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="questions" element={<ManageQuestions />} />
                    <Route path="quizzes" element={<ManageQuizzes />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
