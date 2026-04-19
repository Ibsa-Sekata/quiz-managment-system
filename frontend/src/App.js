import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
    const { isAuthenticated, user, checkAuth } = useAuthStore();
    const { isDark } = useThemeStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
                {isAuthenticated && <Navbar />}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    theme={isDark ? 'dark' : 'light'}
                />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/admin/*" element={
                        <PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>
                    } />
                    <Route path="/dashboard" element={
                        <PrivateRoute requiredRole="user"><UserDashboard /></PrivateRoute>
                    } />
                    <Route path="/quiz/:quizId" element={
                        <PrivateRoute requiredRole="user"><QuizPage /></PrivateRoute>
                    } />
                    <Route path="/results" element={
                        <PrivateRoute requiredRole="user"><ResultsPage /></PrivateRoute>
                    } />

                    <Route path="/" element={
                        isAuthenticated
                            ? user?.role === 'admin'
                                ? <Navigate to="/admin" replace />
                                : <Navigate to="/dashboard" replace />
                            : <Navigate to="/login" replace />
                    } />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
