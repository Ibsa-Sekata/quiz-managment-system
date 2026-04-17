import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" />;
    }

    if (user?.status !== 'approved' && requiredRole === 'user') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Account Pending Approval
                    </h1>
                    <p className="text-gray-600">
                        Your account is awaiting administrator approval. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
