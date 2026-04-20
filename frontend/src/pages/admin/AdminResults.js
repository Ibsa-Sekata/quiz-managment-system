import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiChevronDown, FiChevronUp, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminResults = () => {
    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterUser, setFilterUser] = useState('');
    const [filterQuiz, setFilterQuiz] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);
    const [userResults, setUserResults] = useState({});
    const [loadingUser, setLoadingUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resultsRes, usersRes, quizzesRes] = await Promise.all([
                api.get('/results/admin/all?limit=100'),
                api.get('/users/all?limit=200'),
                api.get('/quizzes/all?limit=100')
            ]);
            setResults(resultsRes.data.results);
            setUsers(usersRes.data.users.filter(u => u.role === 'user'));
            setQuizzes(quizzesRes.data.quizzes);
        } catch { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    const fetchUserResults = async (userId) => {
        if (userResults[userId]) {
            setExpandedUser(expandedUser === userId ? null : userId);
            return;
        }
        setLoadingUser(userId);
        try {
            const res = await api.get(`/results/admin/user/${userId}`);
            setUserResults(prev => ({ ...prev, [userId]: res.data }));
            setExpandedUser(userId);
        } catch { toast.error('Failed to fetch user results'); }
        finally { setLoadingUser(null); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    };

    // Filter results
    const filtered = results.filter(r => {
        if (filterUser && r.userId !== parseInt(filterUser)) return false;
        if (filterQuiz && r.quizId !== parseInt(filterQuiz)) return false;
        return true;
    });

    // Group by user for the user-view tab
    const userMap = {};
    results.forEach(r => {
        if (!userMap[r.userId]) userMap[r.userId] = { user: r.User, count: 0, passed: 0, avgScore: 0, scores: [] };
        userMap[r.userId].count++;
        if (r.isPassed) userMap[r.userId].passed++;
        userMap[r.userId].scores.push(parseFloat(r.score));
    });
    Object.values(userMap).forEach(u => {
        u.avgScore = u.scores.length ? Math.round(u.scores.reduce((a, b) => a + b, 0) / u.scores.length) : 0;
    });

    const [tab, setTab] = useState('all');

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h2 className="page-title mb-6">Results</h2>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-dark-border">
                {[
                    { key: 'all', label: `All Results (${results.length})` },
                    { key: 'users', label: `By User (${Object.keys(userMap).length})` }
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 font-medium text-sm border-b-2 transition ${tab === t.key
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                            : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-slate-300'
                            }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── ALL RESULTS TAB ── */}
            {tab === 'all' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-5">
                        <div className="relative flex-1 min-w-48">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
                                className="input pl-9">
                                <option value="">All Users</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                            </select>
                        </div>
                        <div className="relative flex-1 min-w-48">
                            <select value={filterQuiz} onChange={e => setFilterQuiz(e.target.value)} className="input">
                                <option value="">All Quizzes</option>
                                {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                            </select>
                        </div>
                        {(filterUser || filterQuiz) && (
                            <button onClick={() => { setFilterUser(''); setFilterQuiz(''); }}
                                className="btn-secondary text-sm px-4">Clear</button>
                        )}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="card p-12 text-center">
                            <p className="text-gray-500 dark:text-dark-muted">No results found</p>
                        </div>
                    ) : (
                        <div className="card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                                    <tr>
                                        {['User', 'Quiz', 'Score', 'Result', 'Correct', 'Time', 'Date'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                    {filtered.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800 dark:text-dark-text">{r.User?.fullName}</p>
                                                <p className="text-xs text-gray-400 dark:text-dark-muted">{r.User?.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-slate-300 max-w-32 truncate">{r.Quiz?.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-lg font-bold ${r.isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                    {r.score}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={r.isPassed ? 'badge-green' : 'badge-red'}>
                                                    {r.isPassed ? '✓ Passed' : '✗ Failed'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                                                {r.correctAnswers}/{r.totalQuestions}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-dark-muted">{formatTime(r.timeSpent)}</td>
                                            <td className="px-4 py-3 text-gray-400 dark:text-slate-600 text-xs">{formatDate(r.completedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ── BY USER TAB ── */}
            {tab === 'users' && (
                <div className="space-y-3">
                    {Object.values(userMap).length === 0 ? (
                        <div className="card p-12 text-center">
                            <p className="text-gray-500 dark:text-dark-muted">No results yet</p>
                        </div>
                    ) : Object.values(userMap).map(({ user, count, passed, avgScore }) => (
                        <div key={user?.id} className="card overflow-hidden">
                            {/* User row */}
                            <button
                                onClick={() => fetchUserResults(user?.id)}
                                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                    <FiUser className="text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 dark:text-dark-text">{user?.fullName}</p>
                                    <p className="text-xs text-gray-400 dark:text-dark-muted">{user?.email}</p>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <p className="font-bold text-gray-800 dark:text-dark-text">{count}</p>
                                        <p className="text-xs text-gray-400 dark:text-dark-muted">Attempts</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-green-600 dark:text-green-400">{passed}</p>
                                        <p className="text-xs text-gray-400 dark:text-dark-muted">Passed</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`font-bold ${avgScore >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{avgScore}%</p>
                                        <p className="text-xs text-gray-400 dark:text-dark-muted">Avg Score</p>
                                    </div>
                                </div>
                                {loadingUser === user?.id
                                    ? <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                    : expandedUser === user?.id
                                        ? <FiChevronUp className="text-gray-400" />
                                        : <FiChevronDown className="text-gray-400" />
                                }
                            </button>

                            {/* Expanded user results */}
                            {expandedUser === user?.id && userResults[user?.id] && (
                                <div className="border-t border-gray-100 dark:border-dark-border">
                                    {userResults[user?.id].results.length === 0 ? (
                                        <p className="p-4 text-sm text-gray-400 dark:text-dark-muted text-center">No results</p>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-dark-bg">
                                                <tr>
                                                    {['Quiz', 'Score', 'Result', 'Correct', 'Time Spent', 'Attempt', 'Date'].map(h => (
                                                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-dark-muted">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                                {userResults[user?.id].results.map(r => (
                                                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                                                        <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{r.Quiz?.title}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`font-bold ${r.isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                                {r.score}%
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={r.isPassed ? 'badge-green' : 'badge-red'}>
                                                                {r.isPassed ? '✓ Passed' : '✗ Failed'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{r.correctAnswers}/{r.totalQuestions}</td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-dark-muted">{formatTime(r.timeSpent)}</td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-dark-muted">#{r.attemptNumber}</td>
                                                        <td className="px-4 py-3 text-gray-400 dark:text-slate-600 text-xs">{formatDate(r.completedAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminResults;
