import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiBarChart3, FiClock } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const UserDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [stats, setStats] = useState({
        totalQuizzesTaken: 0,
        averageScore: 0,
        passedQuizzes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [quizzesRes, statsRes] = await Promise.all([
                api.get('/quizzes/available'),
                api.get('/results/user/performance')
            ]);

            setQuizzes(quizzesRes.data.quizzes);
            setStats(statsRes.data.statistics);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                </div>
                <Icon className="text-3xl text-gray-400" />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
                <p className="text-gray-600 mt-2">Take quizzes and track your progress</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={FiBook}
                    title="Quizzes Taken"
                    value={stats.totalQuizzesTaken}
                />
                <StatCard
                    icon={FiBarChart3}
                    title="Average Score"
                    value={`${stats.averageScore}%`}
                />
                <StatCard
                    icon={FiClock}
                    title="Passed Quizzes"
                    value={stats.passedQuizzes}
                />
            </div>

            {/* Available Quizzes */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Quizzes</h2>
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading quizzes...</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600">No quizzes available at the moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map(quiz => (
                            <div key={quiz._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    {quiz.timeLimit && (
                                        <p>⏱️ Time Limit: {quiz.timeLimit} minutes</p>
                                    )}
                                    {quiz.maxAttempts && (
                                        <p>📝 Max Attempts: {quiz.maxAttempts}</p>
                                    )}
                                    <p>✅ Passing Score: {quiz.passingScore}%</p>
                                </div>
                                <Link
                                    to={`/quiz/${quiz._id}`}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-center block"
                                >
                                    Start Quiz
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
