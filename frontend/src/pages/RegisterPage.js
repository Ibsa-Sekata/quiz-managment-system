import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await register(formData.fullName, formData.email, formData.password);
            toast.success('Registration successful! Please wait for admin approval.');
            navigate('/login');
        } catch (error) {
            const msg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Registration failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const passwordsMatch = !formData.confirmPassword || formData.password === formData.confirmPassword;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark-bg dark:via-slate-900 dark:to-dark-bg px-4 py-8 transition-colors duration-200">

            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 w-10 h-10 rounded-xl bg-white dark:bg-dark-surface shadow flex items-center justify-center text-gray-500 dark:text-yellow-400 hover:scale-105 transition-transform"
            >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <div className="w-full max-w-md animate-slide-in">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-white text-2xl font-bold">Q</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Create Account</h1>
                        <p className="text-gray-500 dark:text-dark-muted mt-1 text-sm">Fill in your details to register</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                                required minLength={2} className="input" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="label">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                required className="input" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                required minLength={6} className="input" placeholder="At least 6 characters" />
                            <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Minimum 6 characters</p>
                        </div>
                        <div>
                            <label className="label">Confirm Password</label>
                            <input
                                type="password" name="confirmPassword" value={formData.confirmPassword}
                                onChange={handleChange} required
                                className={`input ${!passwordsMatch ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
                                placeholder="Repeat your password"
                            />
                            {!passwordsMatch && (
                                <p className="text-xs text-red-500 dark:text-red-400 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 dark:text-dark-muted text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
