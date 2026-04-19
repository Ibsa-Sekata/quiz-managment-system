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
                const [u, q] = await Promise.all([api.get('/users/statistics'), api.get('/quizzes/statistics')]);
                setStats({
                    totalUsers: u.data.statistics.totalUsers,
                    pendingRequests: u.data.statistics.pendingUsers,
                    totalQuizzes: q.data.statistics.totalQuizzes,
                    publishedQuizzes: q.data.statistics.publishedQuizzes
                });
            } catch { toast.error('Failed to fetch statistics'); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    const cards = [
        { icon: FiUsers, title: 'Total Users', value: stats.totalUsers, color: 'border-blue-500', bg: 'bg-blue-500', link: '/admin/users' },
        { icon: FiUsers, title: 'Pending Approvals', value: stats.pendingRequests, color: 'border-yellow-500', bg: 'bg-yellow-500', link: '/admin/users' },
        { icon: FiBook, title: 'Total Quizzes', value: stats.totalQuizzes, color: 'border-green-500', bg: 'bg-green-500', link: '/admin/quizzes' },
        { icon: FiBarChart2, title: 'Published Quizzes', value: stats.publishedQuizzes, color: 'border-purple-500', bg: 'bg-purple-500', link: '/admin/quizzes' },
    ];

    const quickLinks = [
        { to: '/admin/users', icon: FiUsers, label: 'Manage Users', desc: 'Approve or reject registrations', bg: 'bg-blue-100 dark:bg-blue-900/30', icon_c: 'text-blue-600 dark:text-blue-400' },
        { to: '/admin/quizzes', icon: FiBook, label: 'Manage Quizzes', desc: 'Create and publish quizzes', bg: 'bg-green-100 dark:bg-green-900/30', icon_c: 'text-green-600 dark:text-green-400' },
        { to: '/admin/questions', icon: FiPlus, label: 'Manage Questions', desc: 'Create and organize questions', bg: 'bg-purple-100 dark:bg-purple-900/30', icon_c: 'text-purple-600 dark:text-purple-400' },
    ];

    return (
        <div className="animate-fade-in">
            <h2 className="page-title mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {cards.map(c => (
                    <Link key={c.title} to={c.link} className={`card p-6 border-l-4 ${c.color} hover:shadow-md transition-shadow`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-dark-muted">{c.title}</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-dark-text mt-1">{loading ? '…' : c.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center`}>
                                <c.icon className="text-xl text-white" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {quickLinks.map(l => (
                    <Link key={l.to} to={l.to} className="card p-6 hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${l.bg} rounded-2xl flex items-center justify-center`}>
                                <l.icon className={`${l.icon_c} text-xl`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-dark-text">{l.label}</h3>
                                <p className="text-sm text-gray-500 dark:text-dark-muted">{l.desc}</p>
                            </div>
                        </div>
                    </Link>
                ))}
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

    const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
            {/* Sidebar */}
            <aside className="w-56 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex-shrink-0 hidden md:block">
                <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                    <p className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">Admin Panel</p>
                </div>
                <nav className="p-3 space-y-1">
                    {navItems.map(item => (
                        <Link key={item.path} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive(item.path, item.exact)
                                    ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-dark-bg'
                                }`}>
                            <item.icon size={17} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile bottom nav */}
            <div className="md:hidden w-full fixed bottom-0 left-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border flex z-40">
                {navItems.map(item => (
                    <Link key={item.path} to={item.path}
                        className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition ${isActive(item.path, item.exact) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-dark-muted'
                            }`}>
                        <item.icon size={20} />
                        <span className="mt-0.5">{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Main */}
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
