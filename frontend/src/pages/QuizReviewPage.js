import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiMinusCircle, FiClock, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const QuizReviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;
    const [expandedIdx, setExpandedIdx] = useState(null);

    // If no result data, redirect
    if (!result) {
        navigate('/dashboard');
        return null;
    }

    const { score, totalQuestions, correctAnswers, incorrectAnswers, isPassed,
        timeSpent, feedback, passingScore, quizTitle, review = [] } = result;

    const skipped = review.filter(r => r.isSkipped).length;

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    };

    const getOptionStyle = (question, optionIndex) => {
        const isCorrect = optionIndex === question.correctAnswerIndex;
        const isSelected = optionIndex === question.selectedAnswerIndex;

        if (isCorrect && isSelected) {
            // User selected the correct answer
            return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-500';
        }
        if (isCorrect && !isSelected) {
            // Correct answer user didn't pick
            return 'border-green-400 bg-green-50/60 dark:bg-green-900/10 dark:border-green-600';
        }
        if (!isCorrect && isSelected) {
            // Wrong answer user picked
            return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500';
        }
        return 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface';
    };

    const getOptionIcon = (question, optionIndex) => {
        const isCorrect = optionIndex === question.correctAnswerIndex;
        const isSelected = optionIndex === question.selectedAnswerIndex;

        if (isCorrect) return <FiCheckCircle className="text-green-500 flex-shrink-0" size={18} />;
        if (isSelected && !isCorrect) return <FiXCircle className="text-red-500 flex-shrink-0" size={18} />;
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 flex-shrink-0" />;
    };

    const getQuestionStatus = (q) => {
        if (q.isSkipped) return { icon: <FiMinusCircle className="text-gray-400" size={20} />, label: 'Skipped', color: 'text-gray-400 dark:text-slate-500', bg: 'bg-gray-100 dark:bg-dark-bg' };
        if (q.isCorrect) return { icon: <FiCheckCircle className="text-green-500" size={20} />, label: 'Correct', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
        return { icon: <FiXCircle className="text-red-500" size={20} />, label: 'Wrong', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

            {/* Score Banner */}
            <div className={`rounded-2xl p-6 mb-8 border ${isPassed
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'}`}>

                <div className="flex items-center gap-3 mb-5">
                    {isPassed
                        ? <FiCheckCircle className="text-4xl text-green-600 dark:text-green-400" />
                        : <FiXCircle className="text-4xl text-red-600 dark:text-red-400" />}
                    <div>
                        <h1 className={`text-2xl font-bold ${isPassed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {isPassed ? '🎉 You Passed!' : '❌ Not Passed'}
                        </h1>
                        <p className="text-gray-600 dark:text-dark-muted text-sm mt-0.5">{quizTitle}</p>
                    </div>
                    <div className={`ml-auto text-5xl font-black ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {score}%
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Correct', value: correctAnswers, color: 'text-green-600 dark:text-green-400', icon: '✅' },
                        { label: 'Wrong', value: incorrectAnswers, color: 'text-red-500 dark:text-red-400', icon: '❌' },
                        { label: 'Skipped', value: skipped, color: 'text-gray-500 dark:text-dark-muted', icon: '⏭️' },
                        { label: 'Time Spent', value: formatTime(timeSpent), color: 'text-blue-600 dark:text-blue-400', icon: '⏱️' },
                    ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-dark-surface rounded-xl p-3 text-center shadow-sm">
                            <p className="text-lg mb-0.5">{s.icon}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-muted">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 bg-white/60 dark:bg-dark-bg/60 rounded-full h-3">
                        <div className={`h-3 rounded-full transition-all duration-700 ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-dark-muted whitespace-nowrap">
                        Pass: {passingScore}%
                    </span>
                </div>

                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-slate-400">{feedback}</p>
            </div>

            {/* Question Review */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                    Question Review
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-dark-muted">({totalQuestions} questions)</span>
                </h2>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-dark-muted">
                    <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> Correct</span>
                    <span className="flex items-center gap-1"><FiXCircle className="text-red-500" /> Wrong</span>
                    <span className="flex items-center gap-1"><FiMinusCircle className="text-gray-400" /> Skipped</span>
                </div>
            </div>

            <div className="space-y-3">
                {review.map((q, idx) => {
                    const status = getQuestionStatus(q);
                    const isExpanded = expandedIdx === idx;

                    return (
                        <div key={idx} className="card overflow-hidden">
                            {/* Question header — always visible */}
                            <button
                                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                className="w-full text-left p-5 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition"
                            >
                                {/* Number badge */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${status.bg} ${status.color}`}>
                                    {q.number}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-dark-text leading-snug line-clamp-2">
                                        {q.questionText}
                                    </p>

                                    {/* Answer summary */}
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        {q.isSkipped ? (
                                            <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-dark-muted">
                                                Not answered
                                            </span>
                                        ) : (
                                            <>
                                                <span className={`px-2 py-1 rounded-lg ${q.isCorrect
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                    Your answer: {['A', 'B', 'C', 'D'][q.selectedAnswerIndex]}. {q.selectedAnswerText}
                                                </span>
                                                {!q.isCorrect && (
                                                    <span className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                        Correct: {['A', 'B', 'C', 'D'][q.correctAnswerIndex]}. {q.correctAnswerText}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {status.icon}
                                    {isExpanded ? <FiChevronUp className="text-gray-400" size={16} /> : <FiChevronDown className="text-gray-400" size={16} />}
                                </div>
                            </button>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div className="px-5 pb-5 border-t border-gray-100 dark:border-dark-border pt-4 animate-fade-in">
                                    <div className="space-y-2">
                                        {q.options.map((opt, optIdx) => (
                                            <div key={optIdx}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-none ${getOptionStyle(q, optIdx)}`}>
                                                {getOptionIcon(q, optIdx)}
                                                <span className="font-semibold text-sm text-gray-500 dark:text-dark-muted w-5">
                                                    {['A', 'B', 'C', 'D'][optIdx]}.
                                                </span>
                                                <span className={`text-sm flex-1 ${optIdx === q.correctAnswerIndex
                                                        ? 'text-green-700 dark:text-green-300 font-medium'
                                                        : optIdx === q.selectedAnswerIndex && !q.isCorrect
                                                            ? 'text-red-700 dark:text-red-300 font-medium'
                                                            : 'text-gray-700 dark:text-slate-300'
                                                    }`}>
                                                    {opt}
                                                </span>
                                                {optIdx === q.correctAnswerIndex && (
                                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 ml-auto">✓ Correct</span>
                                                )}
                                                {optIdx === q.selectedAnswerIndex && !q.isCorrect && (
                                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 ml-auto">✗ Your answer</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Explanation */}
                                    {q.explanation && (
                                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">💡 Explanation</p>
                                            <p className="text-sm text-blue-800 dark:text-blue-300">{q.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/dashboard" className="btn-primary text-center">
                    Back to Dashboard
                </Link>
                <Link to="/results" className="btn-secondary text-center">
                    View All Results
                </Link>
            </div>
        </div>
    );
};

export default QuizReviewPage;
