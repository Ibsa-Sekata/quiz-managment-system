import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" />;

    if (user?.status !== 'approved' && requiredRole === 'user') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="card p-10 text-center max-w-md">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⏳</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-2">Account Pending Approval</h1>
                    <p className="text-gray-500 dark:text-dark-muted text-sm">
                        Your account is awaiting administrator approval. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
