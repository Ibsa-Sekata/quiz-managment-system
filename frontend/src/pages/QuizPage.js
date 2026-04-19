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
            toast.success('Quiz submitted!');
            navigate('/quiz-review', { state: { result: response.data.result } });
        } catch {
            toast.error('Failed to submit quiz');
            setSubmitting(false);
        }
    }, [sessionId, submitting, navigate]);

    useEffect(() => {
        const start = async () => {
            try {
                const response = await api.post(`/results/${quizId}/start`);
                const { session } = response.data;
                setSessionId(session.sessionId);
                setQuiz(session);
                if (session.timeLimit) setTimeLeft(session.timeLimit * 60);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to start quiz');
                navigate('/dashboard');
            } finally { setLoading(false); }
        };
        start();
    }, [quizId, navigate]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timer); handleSubmitQuiz(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleSubmitQuiz]);

    const handleNext = async () => {
        if (answers[currentQuestion] === undefined) { toast.warning('Please select an answer'); return; }
        try {
            await api.post(`/results/${sessionId}/answer`, {
                questionId: quiz.questions[currentQuestion]._id,
                selectedAnswerIndex: answers[currentQuestion]
            });
            setCurrentQuestion(prev => prev + 1);
        } catch { toast.error('Failed to save answer'); }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
            <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-dark-muted">Loading quiz...</p>
            </div>
        </div>
    );

    if (!quiz) return null;

    const question = quiz.questions[currentQuestion];
    const selected = answers[currentQuestion];
    const isLast = currentQuestion === quiz.totalQuestions - 1;
    const progress = ((currentQuestion + 1) / quiz.totalQuestions) * 100;
    const isLowTime = timeLeft !== null && timeLeft < 60;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
            {/* Header card */}
            <div className="card p-5 mb-5">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-dark-text">{quiz.title}</h1>
                        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                            Question <span className="font-semibold text-primary-600 dark:text-primary-400">{currentQuestion + 1}</span> of {quiz.totalQuestions}
                        </p>
                    </div>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${isLowTime ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-primary-600 dark:text-primary-400'}`}>
                            <FiClock />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
                <div className="w-full bg-gray-100 dark:bg-dark-bg rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Question card */}
            <div className="card p-7 mb-5">
                <h2 className="text-base font-semibold text-gray-800 dark:text-dark-text mb-6 leading-relaxed">
                    {question.questionText}
                </h2>
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <button key={index} onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion]: index }))}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${selected === index
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                                : 'border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-dark-surface'
                                }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected === index ? 'border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400' : 'border-gray-300 dark:border-slate-600'
                                    }`}>
                                    {selected === index && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="font-semibold text-gray-500 dark:text-dark-muted text-sm w-5">{['A', 'B', 'C', 'D'][index]}</span>
                                <span className={`text-sm ${selected === index ? 'text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-slate-300'}`}>
                                    {option.text}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-40">
                    <FiChevronLeft /> Previous
                </button>

                {isLast ? (
                    <button onClick={handleSubmitQuiz} disabled={submitting || selected === undefined}
                        className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                        <FiCheckCircle />
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button onClick={handleNext} disabled={selected === undefined}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50">
                        Next <FiChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
