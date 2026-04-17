import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [tab, setTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const [pendingRes, allRes] = await Promise.all([
                api.get('/users/pending-requests'),
                api.get('/users/all')
            ]);
            setPendingUsers(pendingRes.data.users);
            setAllUsers(allRes.data.users);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await api.post(`/users/approve/${userId}`);
            toast.success('User approved successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to approve user');
        }
    };

    const handleReject = async (userId) => {
        try {
            await api.post(`/users/reject/${userId}`, { reason: rejectReason || 'No reason provided' });
            toast.success('User rejected');
            setRejectingId(null);
            setRejectReason('');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to reject user');
        }
    };

    const statusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setTab('pending')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition ${tab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Pending Approvals
                    {pendingUsers.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingUsers.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setTab('all')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition ${tab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    All Users
                </button>
            </div>

            {/* Pending Users */}
            {tab === 'pending' && (
                <div>
                    {pendingUsers.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow">
                            <FiUser className="text-5xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No pending registration requests</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingUsers.map(user => (
                                <div key={user.id} className="bg-white rounded-xl shadow p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">{user.fullName}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Registered: {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                            >
                                                <FiCheck /> Approve
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(user.id)}
                                                className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                                            >
                                                <FiX /> Reject
                                            </button>
                                        </div>
                                    </div>
                                    {/* Reject reason input */}
                                    {rejectingId === user.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <input
                                                type="text"
                                                placeholder="Rejection reason (optional)"
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none mb-2"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReject(user.id)}
                                                    className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                                                >
                                                    Confirm Reject
                                                </button>
                                                <button
                                                    onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* All Users */}
            {tab === 'all' && (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-gray-600 font-semibold">Name</th>
                                <th className="text-left px-6 py-3 text-gray-600 font-semibold">Email</th>
                                <th className="text-left px-6 py-3 text-gray-600 font-semibold">Role</th>
                                <th className="text-left px-6 py-3 text-gray-600 font-semibold">Status</th>
                                <th className="text-left px-6 py-3 text-gray-600 font-semibold">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-800">{user.fullName}</td>
                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{statusBadge(user.status)}</td>
                                    <td className="px-6 py-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
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
