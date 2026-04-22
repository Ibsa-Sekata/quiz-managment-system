import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiUser, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [tab, setTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const [p, a] = await Promise.all([api.get('/users/pending-requests'), api.get('/users/all')]);
            setPendingUsers(p.data.users);
            setAllUsers(a.data.users);
        } catch { toast.error('Failed to fetch users'); }
        finally { setLoading(false); }
    };

    const handleApprove = async (userId) => {
        try {
            await api.post(`/users/approve/${userId}`);
            toast.success('User approved');
            fetchUsers();
        } catch { toast.error('Failed to approve user'); }
    };

    const handleReject = async (userId) => {
        try {
            await api.post(`/users/reject/${userId}`, { reason: rejectReason || 'No reason provided' });
            toast.success('User rejected');
            setRejectingId(null); setRejectReason('');
            fetchUsers();
        } catch { toast.error('Failed to reject user'); }
    };

    const handleDeleteUser = async (user) => {
        const confirmed = window.confirm(`Delete user \"${user.fullName}\" and all related attempts? This cannot be undone.`);
        if (!confirmed) return;

        try {
            await api.delete(`/users/${user.id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const statusBadge = (s) => {
        const map = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' };
        return <span className={map[s]}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
    };

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h2 className="page-title mb-6">Manage Users</h2>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-dark-border">
                {[
                    { key: 'pending', label: 'Pending Approvals', count: pendingUsers.length },
                    { key: 'all', label: 'All Users' }
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 font-medium text-sm border-b-2 transition ${tab === t.key ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                            : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-slate-300'
                            }`}>
                        {t.label}
                        {t.count > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{t.count}</span>}
                    </button>
                ))}
            </div>

            {tab === 'pending' && (
                pendingUsers.length === 0 ? (
                    <div className="card p-12 text-center">
                        <FiUser className="text-5xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-dark-muted">No pending registration requests</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="card p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-dark-text">{user.fullName}</p>
                                        <p className="text-sm text-gray-500 dark:text-dark-muted">{user.email}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">
                                            Registered: {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleApprove(user.id)}
                                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium">
                                            <FiCheck /> Approve
                                        </button>
                                        <button onClick={() => setRejectingId(user.id)}
                                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium">
                                            <FiX /> Reject
                                        </button>
                                    </div>
                                </div>
                                {rejectingId === user.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                        <input type="text" placeholder="Rejection reason (optional)" value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)} className="input mb-2" />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleReject(user.id)} className="btn-danger text-sm px-4 py-1.5">Confirm Reject</button>
                                            <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="btn-secondary text-sm px-4 py-1.5">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {tab === 'all' && (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                            <tr>
                                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-gray-600 dark:text-dark-muted font-semibold text-xs uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {allUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition">
                                    <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-dark-text">{user.fullName}</td>
                                    <td className="px-5 py-3.5 text-gray-500 dark:text-dark-muted">{user.email}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={user.role === 'admin' ? 'badge-purple' : 'badge-blue'}>{user.role}</span>
                                    </td>
                                    <td className="px-5 py-3.5">{statusBadge(user.status)}</td>
                                    <td className="px-5 py-3.5 text-gray-400 dark:text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-3.5">
                                        {user.role !== 'admin' ? (
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40 transition"
                                            >
                                                <FiTrash2 size={13} /> Delete
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400 dark:text-dark-muted">Protected</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
