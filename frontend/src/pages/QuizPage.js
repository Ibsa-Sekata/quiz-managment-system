import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
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

    const handleSubmitQuiz = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const response = await api.post(`/results/${sessionId}/submit`);
            toast.success('Quiz submitted successfully!');
            navigate('/results', { state: { result: response.data.result } });
        } catch (error) {
            toast.error('Failed to submit quiz');
            setSubmitting(false);
        }
    }, [sessionId, submitting, navigate]);

    useEffect(() => {
        const startQuizSession = async () => {
            try {
                const response = await api.post(`/results/${quizId}/start`);
                const { session } = response.data;
                setSessionId(session.sessionId);
                setQuiz(session);
                if (session.timeLimit) {
                    setTimeLeft(session.timeLimit * 60);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to start quiz');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        startQuizSession();
    }, [quizId, navigate]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleSubmitQuiz]);

    const handleAnswerSelect = (answerIndex) => {
        setAnswers(prev => ({ ...prev, [currentQuestion]: answerIndex }));
    };

    const handleNext = async () => {
        if (answers[currentQuestion] === undefined) {
            toast.warning('Please select an answer before continuing');
            return;
        }
        try {
            await api.post(`/results/${sessionId}/answer`, {
                questionId: quiz.questions[currentQuestion]._id,
                selectedAnswerIndex: answers[currentQuestion]
            });
            setCurrentQuestion(prev => prev + 1);
        } catch (error) {
            toast.error('Failed to save answer');
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
                <div className="text-center">
                    <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) return null;

    const question = quiz.questions[currentQuestion];
    const selectedAnswer = answers[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.totalQuestions - 1;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Question {currentQuestion + 1} of {quiz.totalQuestions}
                            <span className="ml-3 text-blue-600">{answeredCount} answered</span>
                        </p>
                    </div>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <FiClock />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quiz.totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-xl shadow p-8 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
                    {question.questionText}
                </h2>
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${selectedAnswer === index
                                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAnswer === index ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                    }`}>
                                    {selectedAnswer === index && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="font-medium">{['A', 'B', 'C', 'D'][index]}.</span>
                                <span>{option.text}</span>
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                    <FiChevronLeft />
                    Previous
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting || selectedAnswer === undefined}
                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <FiCheckCircle />
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={selectedAnswer === undefined}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Next
                        <FiChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
