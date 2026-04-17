import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiBarChart2, FiClock, FiAward } from 'react-icons/fi';
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

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="text-2xl text-gray-500" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
                <p className="text-gray-500 mt-1">Take quizzes and track your progress</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard icon={FiBook} title="Quizzes Taken" value={stats.totalQuizzesTaken} color="border-blue-500" />
                <StatCard icon={FiBarChart2} title="Average Score" value={`${stats.averageScore}%`} color="border-green-500" />
                <StatCard icon={FiAward} title="Passed Quizzes" value={stats.passedQuizzes} color="border-purple-500" />
            </div>

            {/* Available Quizzes */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Quizzes</h2>
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 mt-4">Loading quizzes...</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <FiBook className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No quizzes available at the moment</p>
                        <p className="text-gray-400 text-sm mt-1">Check back later for new quizzes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                                    <div className="space-y-1 mb-4 text-sm text-gray-500">
                                        {quiz.timeLimit && (
                                            <p className="flex items-center gap-1">
                                                <FiClock className="text-blue-500" />
                                                Time Limit: {quiz.timeLimit} minutes
                                            </p>
                                        )}
                                        {quiz.maxAttempts && (
                                            <p>📝 Max Attempts: {quiz.maxAttempts}</p>
                                        )}
                                        <p>✅ Passing Score: {quiz.passingScore}%</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/quiz/${quiz.id}`}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-center block mt-2"
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
