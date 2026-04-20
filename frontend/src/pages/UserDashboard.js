import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiBarChart2, FiAward, FiClock, FiLock } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const StatCard = ({ icon: Icon, title, value, color, iconBg }) => (
    <div className={`card p-6 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-dark-muted">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-dark-text mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
                <Icon className="text-xl text-white" />
            </div>
        </div>
    </div>
);

const UserDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [stats, setStats] = useState({ totalQuizzesTaken: 0, averageScore: 0, passedQuizzes: 0 });
    const [myPermissions, setMyPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [quizzesRes, statsRes, permRes] = await Promise.all([
                api.get('/quizzes/available'),
                api.get('/results/user/performance'),
                api.get('/results/permissions/user/me').catch(() => ({ data: { permissions: [] } }))
            ]);
            setQuizzes(quizzesRes.data.quizzes);
            setStats(statsRes.data.statistics);
            setMyPermissions((permRes.data.permissions || []).map(p => p.quizId));
        } catch { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    const hasPermission = (quizId) => myPermissions.includes(quizId);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="page-title">My Dashboard</h1>
                <p className="page-subtitle">Take quizzes and track your progress</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <StatCard icon={FiBook} title="Quizzes Taken" value={stats.totalQuizzesTaken} color="border-blue-500" iconBg="bg-blue-500" />
                <StatCard icon={FiBarChart2} title="Average Score" value={`${stats.averageScore}%`} color="border-green-500" iconBg="bg-green-500" />
                <StatCard icon={FiAward} title="Passed Quizzes" value={stats.passedQuizzes} color="border-purple-500" iconBg="bg-purple-500" />
            </div>

            {/* Available Quizzes */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-5">Available Quizzes</h2>
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 dark:text-dark-muted mt-4">Loading quizzes...</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="card p-12 text-center">
                        <FiBook className="text-5xl text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-dark-muted text-lg">No quizzes available at the moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {quizzes.map(quiz => {
                            const permitted = hasPermission(quiz.id);
                            return (
                                <div key={quiz.id} className={`card p-6 flex flex-col transition-shadow ${permitted ? 'hover:shadow-md' : 'opacity-75'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-base font-semibold text-gray-800 dark:text-dark-text leading-snug flex-1">{quiz.title}</h3>
                                            {!permitted && (
                                                <div className="ml-2 flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center" title="Permission required">
                                                    <FiLock className="text-gray-400 dark:text-slate-500" size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-500 dark:text-dark-muted text-sm mb-4 line-clamp-2">{quiz.description}</p>
                                        <div className="space-y-1.5 mb-4 text-sm text-gray-500 dark:text-dark-muted">
                                            {quiz.timeLimit && (
                                                <p className="flex items-center gap-1.5"><FiClock className="text-primary-500" size={13} /> {quiz.timeLimit} minutes</p>
                                            )}
                                            {quiz.maxAttempts && <p>📝 Max {quiz.maxAttempts} attempts</p>}
                                            <p>✅ Pass at {quiz.passingScore}%</p>
                                        </div>
                                    </div>

                                    {permitted ? (
                                        <Link to={`/quiz/${quiz.id}`} className="btn-primary text-center block">
                                            Start Quiz
                                        </Link>
                                    ) : (
                                        <div className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-dark-bg text-gray-400 dark:text-slate-500 text-sm font-medium text-center flex items-center justify-center gap-2 cursor-not-allowed">
                                            <FiLock size={14} /> Permission Required
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
