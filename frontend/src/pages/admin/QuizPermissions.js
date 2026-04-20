import React, { useState, useEffect } from 'react';
import { FiShield, FiPlus, FiTrash2, FiUsers, FiBook, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const QuizPermissions = () => {
    const [users, setUsers] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState('');
    const [tab, setTab] = useState('by-quiz');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [usersRes, quizzesRes] = await Promise.all([
                api.get('/users/all?limit=200'),
                api.get('/quizzes/all?limit=100')
            ]);
            setUsers(usersRes.data.users.filter(u => u.role === 'user' && u.status === 'approved'));
            setQuizzes(quizzesRes.data.quizzes);
        } catch { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    const fetchPermissionsForQuiz = async (quizId) => {
        if (!quizId) { setPermissions([]); return; }
        try {
            const res = await api.get(`/results/permissions/quiz/${quizId}`);
            setPermissions(res.data.permissions);
        } catch { toast.error('Failed to fetch permissions'); }
    };

    const handleQuizChange = (quizId) => {
        setSelectedQuiz(quizId);
        fetchPermissionsForQuiz(quizId);
    };

    const hasPermission = (userId) => permissions.some(p => p.userId === userId);

    const handleGrant = async (userId) => {
        if (!selectedQuiz) { toast.warning('Select a quiz first'); return; }
        setSaving(true);
        try {
            await api.post('/results/permissions/grant', { userId, quizId: parseInt(selectedQuiz) });
            toast.success('Permission granted');
            fetchPermissionsForQuiz(selectedQuiz);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to grant permission');
        } finally { setSaving(false); }
    };

    const handleRevoke = async (userId) => {
        if (!selectedQuiz) return;
        setSaving(true);
        try {
            await api.post('/results/permissions/revoke', { userId, quizId: parseInt(selectedQuiz) });
            toast.success('Permission revoked');
            fetchPermissionsForQuiz(selectedQuiz);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to revoke permission');
        } finally { setSaving(false); }
    };

    const handleGrantAll = async () => {
        if (!selectedQuiz) { toast.warning('Select a quiz first'); return; }
        if (!window.confirm('Grant permission to ALL approved users for this quiz?')) return;
        setSaving(true);
        try {
            const res = await api.post(`/results/permissions/grant-all/${selectedQuiz}`);
            toast.success(res.data.message);
            fetchPermissionsForQuiz(selectedQuiz);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally { setSaving(false); }
    };

    const selectedQuizData = quizzes.find(q => q.id === parseInt(selectedQuiz));

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
                <FiShield className="text-2xl text-primary-600 dark:text-primary-400" />
                <h2 className="page-title">Quiz Permissions</h2>
            </div>
            <p className="page-subtitle mb-6">Control which users can access each quiz</p>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-dark-border">
                {[
                    { key: 'by-quiz', label: 'Manage by Quiz', icon: FiBook },
                    { key: 'by-user', label: 'View by User', icon: FiUsers }
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${tab === t.key
                                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                                : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-slate-300'
                            }`}>
                        <t.icon size={15} /> {t.label}
                    </button>
                ))}
            </div>

            {/* ── BY QUIZ TAB ── */}
            {tab === 'by-quiz' && (
                <div>
                    {/* Quiz selector */}
                    <div className="card p-5 mb-5">
                        <label className="label">Select Quiz to Manage Permissions</label>
                        <div className="flex gap-3">
                            <select value={selectedQuiz} onChange={e => handleQuizChange(e.target.value)} className="input flex-1">
                                <option value="">-- Choose a quiz --</option>
                                {quizzes.map(q => (
                                    <option key={q.id} value={q.id}>
                                        {q.title} {q.isPublished ? '(Published)' : '(Draft)'}
                                    </option>
                                ))}
                            </select>
                            {selectedQuiz && (
                                <button onClick={handleGrantAll} disabled={saving}
                                    className="btn-primary flex items-center gap-2 whitespace-nowrap text-sm">
                                    <FiUsers size={15} /> Grant to All Users
                                </button>
                            )}
                        </div>
                        {selectedQuizData && (
                            <div className="mt-3 flex items-center gap-3 text-sm text-gray-500 dark:text-dark-muted">
                                <span className={selectedQuizData.isPublished ? 'badge-green' : 'badge-yellow'}>
                                    {selectedQuizData.isPublished ? 'Published' : 'Draft'}
                                </span>
                                <span>{permissions.length} user{permissions.length !== 1 ? 's' : ''} have access</span>
                            </div>
                        )}
                    </div>

                    {!selectedQuiz ? (
                        <div className="card p-12 text-center">
                            <FiShield className="text-5xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-dark-muted">Select a quiz above to manage who can take it</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="card p-12 text-center">
                            <p className="text-gray-500 dark:text-dark-muted">No approved users found</p>
                        </div>
                    ) : (
                        <div className="card overflow-hidden">
                            <div className="px-5 py-3 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-600 dark:text-dark-muted">
                                    Approved Users ({users.length})
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-600">
                                    Toggle to grant or revoke access
                                </p>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-dark-border">
                                {users.map(user => {
                                    const granted = hasPermission(user.id);
                                    return (
                                        <div key={user.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${granted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-dark-muted'
                                                    }`}>
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{user.fullName}</p>
                                                    <p className="text-xs text-gray-400 dark:text-dark-muted">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {granted && (
                                                    <span className="badge-green text-xs">Has Access</span>
                                                )}
                                                <button
                                                    onClick={() => granted ? handleRevoke(user.id) : handleGrant(user.id)}
                                                    disabled={saving}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition disabled:opacity-50 ${granted
                                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                        }`}>
                                                    {granted ? <><FiTrash2 size={13} /> Revoke</> : <><FiPlus size={13} /> Grant</>}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── BY USER TAB ── */}
            {tab === 'by-user' && (
                <ByUserView users={users} quizzes={quizzes} />
            )}
        </div>
    );
};

// Sub-component: view permissions per user
const ByUserView = ({ users, quizzes }) => {
    const [selectedUser, setSelectedUser] = useState('');
    const [userPerms, setUserPerms] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUserPerms = async (userId) => {
        if (!userId) { setUserPerms([]); return; }
        setLoading(true);
        try {
            const res = await api.get(`/results/permissions/user/${userId}`);
            setUserPerms(res.data.permissions);
        } catch { toast.error('Failed to fetch permissions'); }
        finally { setLoading(false); }
    };

    const handleUserChange = (userId) => {
        setSelectedUser(userId);
        fetchUserPerms(userId);
    };

    const selectedUserData = users.find(u => u.id === parseInt(selectedUser));

    return (
        <div>
            <div className="card p-5 mb-5">
                <label className="label">Select User to View Their Quiz Access</label>
                <select value={selectedUser} onChange={e => handleUserChange(e.target.value)} className="input">
                    <option value="">-- Choose a user --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                </select>
            </div>

            {!selectedUser ? (
                <div className="card p-12 text-center">
                    <FiUsers className="text-5xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-dark-muted">Select a user to see which quizzes they can access</p>
                </div>
            ) : loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                        <p className="text-sm font-semibold text-gray-700 dark:text-dark-text">
                            {selectedUserData?.fullName} — {userPerms.length} quiz{userPerms.length !== 1 ? 'zes' : ''} accessible
                        </p>
                    </div>
                    {userPerms.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 dark:text-dark-muted text-sm">This user has no quiz permissions yet</p>
                            <p className="text-gray-400 dark:text-slate-600 text-xs mt-1">Go to "Manage by Quiz" tab to grant access</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-dark-border">
                            {userPerms.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{p.Quiz?.title}</p>
                                        <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                                            Granted: {new Date(p.grantedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={p.Quiz?.isPublished ? 'badge-green' : 'badge-yellow'}>
                                            {p.Quiz?.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                        <FiCheck className="text-green-500" size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizPermissions;
