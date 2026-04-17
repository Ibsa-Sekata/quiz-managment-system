import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Stores
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
    const { isAuthenticated, user, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                {isAuthenticated && <Navbar />}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes */}
                    <Route
                        path="/admin/*"
                        element={
                            <PrivateRoute requiredRole="admin">
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute requiredRole="user">
                                <UserDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/quiz/:quizId"
                        element={
                            <PrivateRoute requiredRole="user">
                                <QuizPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/results"
                        element={
                            <PrivateRoute requiredRole="user">
                                <ResultsPage />
                            </PrivateRoute>
                        }
                    />

                    {/* Default Routes */}
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                user?.role === 'admin' ? (
                                    <Navigate to="/admin" />
                                ) : (
                                    <Navigate to="/dashboard" />
                                )
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
