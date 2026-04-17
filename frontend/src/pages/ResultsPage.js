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

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await api.get('/results/user/results');
            setResults(response.data.results);
        } catch (error) {
            toast.error('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Results</h1>
                <p className="text-gray-500 mt-1">View your quiz performance and scores</p>
            </div>

            {/* Latest Result Banner (if just submitted) */}
            {latestResult && (
                <div className={`rounded-xl p-6 mb-8 ${latestResult.isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        {latestResult.isPassed
                            ? <FiCheckCircle className="text-3xl text-green-600" />
                            : <FiXCircle className="text-3xl text-red-600" />}
                        <h2 className={`text-xl font-bold ${latestResult.isPassed ? 'text-green-700' : 'text-red-700'}`}>
                            {latestResult.isPassed ? 'Congratulations! You Passed!' : 'Quiz Completed'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-gray-800">{latestResult.score}%</p>
                            <p className="text-xs text-gray-500 mt-1">Score</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-green-600">{latestResult.correctAnswers}</p>
                            <p className="text-xs text-gray-500 mt-1">Correct</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-red-500">{latestResult.incorrectAnswers}</p>
                            <p className="text-xs text-gray-500 mt-1">Incorrect</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-gray-800">{formatTime(latestResult.timeSpent)}</p>
                            <p className="text-xs text-gray-500 mt-1">Time Spent</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-600">{latestResult.feedback}</p>
                </div>
            )}

            {/* Results History */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">History</h2>

            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 mt-4">Loading results...</p>
                </div>
            ) : results.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <FiAward className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No quiz results yet</p>
                    <Link
                        to="/dashboard"
                        className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Take a Quiz
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map(result => (
                        <div key={result.id} className="bg-white rounded-xl shadow hover:shadow-md transition p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {result.Quiz?.title || 'Quiz'}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(result.completedAt)}</p>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${result.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {result.isPassed ? <FiCheckCircle /> : <FiXCircle />}
                                    {result.isPassed ? 'Passed' : 'Failed'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Score</p>
                                    <p className="text-2xl font-bold text-gray-800">{result.score}%</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Correct</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {result.correctAnswers}/{result.totalQuestions}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1 mb-1">
                                        <FiClock className="text-gray-400 text-xs" />
                                        <p className="text-xs text-gray-500">Time</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">{formatTime(result.timeSpent)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-1 mb-1">
                                        <FiTrendingUp className="text-gray-400 text-xs" />
                                        <p className="text-xs text-gray-500">Attempt</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">#{result.attemptNumber}</p>
                                </div>
                            </div>

                            {/* Score bar */}
                            <div className="mt-4">
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all ${result.isPassed ? 'bg-green-500' : 'bg-red-400'}`}
                                        style={{ width: `${result.score}%` }}
                                    />
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
