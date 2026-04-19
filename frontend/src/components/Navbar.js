import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLink = "text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition text-sm";

    return (
        <nav className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow">
                            <span className="text-white font-bold text-lg">Q</span>
                        </div>
                        <span className="text-lg font-bold text-gray-800 dark:text-dark-text hidden sm:inline tracking-tight">
                            Quiz<span className="text-primary-600 dark:text-primary-400">System</span>
                        </span>
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className={navLink}>
                            Dashboard
                        </Link>
                        {user?.role === 'user' && (
                            <Link to="/results" className={navLink}>Results</Link>
                        )}

                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-yellow-400"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                        </button>

                        {/* User info + logout */}
                        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-dark-border">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-semibold text-gray-800 dark:text-dark-text leading-none">{user?.fullName}</p>
                                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5 capitalize">{user?.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition text-sm font-medium"
                            >
                                <FiLogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile: theme toggle + hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-yellow-400"
                        >
                            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-slate-300"
                        >
                            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100 dark:border-dark-border animate-fade-in">
                        <Link
                            to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        {user?.role === 'user' && (
                            <Link
                                to="/results"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl text-sm font-medium"
                            >
                                Results
                            </Link>
                        )}
                        <div className="px-4 py-2 text-xs text-gray-400 dark:text-dark-muted">{user?.fullName} · {user?.role}</div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
