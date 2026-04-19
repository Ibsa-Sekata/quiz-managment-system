import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark-bg dark:via-slate-900 dark:to-dark-bg px-4 transition-colors duration-200">

            {/* Theme toggle top-right */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 w-10 h-10 rounded-xl bg-white dark:bg-dark-surface shadow flex items-center justify-center text-gray-500 dark:text-yellow-400 hover:scale-105 transition-transform"
            >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <div className="w-full max-w-md animate-slide-in">
                <div className="card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-white text-2xl font-bold">Q</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Welcome back</h1>
                        <p className="text-gray-500 dark:text-dark-muted mt-1 text-sm">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleChange} required
                                className="input" placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password" name="password" value={formData.password}
                                onChange={handleChange} required
                                className="input" placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 dark:text-dark-muted text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
