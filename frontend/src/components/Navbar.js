import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">Q</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 hidden sm:inline">
                            Quiz System
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                            className="text-gray-600 hover:text-blue-600 transition"
                        >
                            Dashboard
                        </Link>
                        {user?.role === 'user' && (
                            <Link
                                to="/results"
                                className="text-gray-600 hover:text-blue-600 transition"
                            >
                                Results
                            </Link>
                        )}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {user?.fullName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                <FiLogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-600"
                    >
                        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link
                            to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Dashboard
                        </Link>
                        {user?.role === 'user' && (
                            <Link
                                to="/results"
                                className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Results
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
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
