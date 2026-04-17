import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const ResultsPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Results</h1>
                <p className="text-gray-600 mt-2">View your quiz performance and scores</p>
            </div>

            {/* Results List */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading results...</p>
                </div>
            ) : results.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600 mb-4">No quiz results yet</p>
                    <Link
                        to="/dashboard"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Take a Quiz
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map(result => (
                        <div key={result._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {result.quizId?.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatDate(result.completedAt)}
                                    </p>
                                </div>
                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${result.isPassed
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                    }`}>
                                    {result.isPassed ? (
                                        <FiCheckCircle className="text-xl" />
                                    ) : (
                                        <FiXCircle className="text-xl" />
                                    )}
                                    <span className="font-semibold">
                                        {result.isPassed ? 'Passed' : 'Failed'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded p-4">
                                    <p className="text-sm text-gray-600 mb-1">Score</p>
                                    <p className="text-2xl font-bold text-gray-800">{result.score}%</p>
                                </div>
                                <div className="bg-gray-50 rounded p-4">
                                    <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {result.correctAnswers}/{result.totalQuestions}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded p-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <FiClock className="text-gray-600" />
                                        <p className="text-sm text-gray-600">Time Spent</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {formatTime(result.timeSpent)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded p-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <FiTrendingUp className="text-gray-600" />
                                        <p className="text-sm text-gray-600">Attempt</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        #{result.attemptNumber}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${result.isPassed ? 'bg-green-600' : 'bg-red-600'
                                            }`}
                                        style={{ width: `${result.score}%` }}
                                    ></div>
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
