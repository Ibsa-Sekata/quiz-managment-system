import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const QuizPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        startQuizSession();
    }, [quizId]);

    useEffect(() => {
        if (!timeLeft || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const startQuizSession = async () => {
        try {
            const response = await api.post(`/results/${quizId}/start`);
            const { session } = response.data;
            setSessionId(session.sessionId);
            setQuiz(session);
            if (session.timeLimit) {
                setTimeLeft(session.timeLimit * 60);
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start quiz');
            navigate('/dashboard');
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: answerIndex
        }));
    };

    const handleSubmitAnswer = async () => {
        if (answers[currentQuestion] === undefined) {
            toast.warning('Please select an answer');
            return;
        }

        try {
            await api.post(`/results/${sessionId}/answer`, {
                questionId: quiz.questions[currentQuestion]._id,
                selectedAnswerIndex: answers[currentQuestion]
            });

            if (currentQuestion < quiz.totalQuestions - 1) {
                setCurrentQuestion(prev => prev + 1);
            }
        } catch (error) {
            toast.error('Failed to submit answer');
        }
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        try {
            const response = await api.post(`/results/${sessionId}/submit`);
            toast.success('Quiz submitted successfully!');
            navigate('/results', { state: { result: response.data.result } });
        } catch (error) {
            toast.error('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Loading quiz...</p>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Quiz not found</p>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const selectedAnswer = answers[currentQuestion];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
                        <p className="text-gray-600 mt-2">Question {currentQuestion + 1} of {quiz.totalQuestions}</p>
                    </div>
                    {timeLeft !== null && (
                        <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
                            <FiClock className="text-red-600" />
                            <span className="text-red-600 font-semibold">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quiz.totalQuestions) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">{question.questionText}</h2>

                {/* Options */}
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full p-4 text-left rounded-lg border-2 transition ${selectedAnswer === index
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index
                                            ? 'border-blue-600 bg-blue-600'
                                            : 'border-gray-300'
                                        }`}
                                >
                                    {selectedAnswer === index && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <span className="text-gray-800">{option.text}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiChevronLeft />
                    <span>Previous</span>
                </button>

                {currentQuestion === quiz.totalQuestions - 1 ? (
                    <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting}
                        className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        onClick={handleSubmitAnswer}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <span>Next</span>
                        <FiChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
