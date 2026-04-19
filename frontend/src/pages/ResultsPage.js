import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiAward } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const ResultsPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const latestResult = location.state?.result;

    useEffect(() => { fetchResults(); }, []);

    const fetchResults = async () => {
        try {
            const response = await api.get('/results/user/results');
            setResults(response.data.results);
        } catch { toast.error('Failed to fetch results'); }
        finally { setLoading(false); }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="page-title">My Results</h1>
                <p className="page-subtitle">View your quiz performance and scores</p>
            </div>

            {/* Latest result banner */}
            {latestResult && (
                <div className={`rounded-2xl p-6 mb-8 border ${latestResult.isPassed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        {latestResult.isPassed
                            ? <FiCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
                            : <FiXCircle className="text-3xl text-red-600 dark:text-red-400" />}
                        <h2 className={`text-xl font-bold ${latestResult.isPassed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {latestResult.isPassed ? '🎉 Congratulations! You Passed!' : 'Quiz Completed'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Score', value: `${latestResult.score}%`, color: 'text-gray-800 dark:text-dark-text' },
                            { label: 'Correct', value: latestResult.correctAnswers, color: 'text-green-600 dark:text-green-400' },
                            { label: 'Incorrect', value: latestResult.incorrectAnswers, color: 'text-red-500 dark:text-red-400' },
                            { label: 'Time', value: formatTime(latestResult.timeSpent), color: 'text-gray-800 dark:text-dark-text' },
                        ].map(item => (
                            <div key={item.label} className="bg-white dark:bg-dark-surface rounded-xl p-3 text-center">
                                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-600 dark:text-slate-400">{latestResult.feedback}</p>
                </div>
            )}

            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4">History</h2>

            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 dark:text-dark-muted mt-4">Loading results...</p>
                </div>
            ) : results.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiAward className="text-5xl text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-dark-muted text-lg">No quiz results yet</p>
                    <Link to="/dashboard" className="btn-primary inline-block mt-4">Take a Quiz</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map(result => (
                        <div key={result.id} className="card p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-dark-text">{result.Quiz?.title || 'Quiz'}</h3>
                                    <p className="text-sm text-gray-400 dark:text-dark-muted mt-0.5">{formatDate(result.completedAt)}</p>
                                </div>
                                <span className={result.isPassed ? 'badge-green' : 'badge-red'}>
                                    {result.isPassed ? '✓ Passed' : '✗ Failed'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
                                    <p className="text-xs text-gray-500 dark:text-dark-muted mb-1">Score</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-dark-text">{result.score}%</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
                                    <p className="text-xs text-gray-500 dark:text-dark-muted mb-1">Correct</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.correctAnswers}/{result.totalQuestions}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
                                    <div className="flex items-center gap-1 mb-1"><FiClock className="text-gray-400 text-xs" /><p className="text-xs text-gray-500 dark:text-dark-muted">Time</p></div>
                                    <p className="text-lg font-semibold text-gray-800 dark:text-dark-text">{formatTime(result.timeSpent)}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
                                    <div className="flex items-center gap-1 mb-1"><FiTrendingUp className="text-gray-400 text-xs" /><p className="text-xs text-gray-500 dark:text-dark-muted">Attempt</p></div>
                                    <p className="text-lg font-semibold text-gray-800 dark:text-dark-text">#{result.attemptNumber}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="w-full bg-gray-100 dark:bg-dark-bg rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${result.isPassed ? 'bg-green-500' : 'bg-red-400'}`}
                                        style={{ width: `${result.score}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResultsPage;
