import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
        <div className="text-center animate-fade-in">
            <div className="text-8xl font-black text-gray-200 dark:text-slate-700 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-2">Page Not Found</h1>
            <p className="text-gray-500 dark:text-dark-muted mb-8">The page you're looking for doesn't exist.</p>
            <Link to="/" className="btn-primary inline-block">Go Home</Link>
        </div>
    </div>
);

export default NotFoundPage;
