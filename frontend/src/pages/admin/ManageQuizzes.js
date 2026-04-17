import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY_FORM = {
    title: '', description: '', questions: [],
    timeLimit: '', maxAttempts: '', passingScore: 50,
    startDate: '', endDate: ''
};

const ManageQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [quizzesRes, questionsRes] = await Promise.all([
                api.get('/quizzes/all?limit=100'),
                api.get('/questions/all?limit=200')
            ]);
            setQuizzes(quizzesRes.data.quizzes);
            setAllQuestions(questionsRes.data.questions);
        } catch { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    const toggleQuestion = (qId) => {
        setForm(prev => ({
            ...prev,
            questions: prev.questions.includes(qId)
                ? prev.questions.filter(id => id !== qId)
                : [...prev.questions, qId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.questions.length === 0) {
            toast.error('Select at least one question');
            return;
        }
        setSaving(true);
        const payload = {
            ...form,
            timeLimit: form.timeLimit ? parseInt(form.timeLimit) : null,
            maxAttempts: form.maxAttempts ? parseInt(form.maxAttempts) : null,
            passingScore: parseInt(form.passingScore),
            startDate: form.startDate || null,
            endDate: form.endDate || null
        };
        try {
            if (editingId) {
                await api.put(`/quizzes/${editingId}`, payload);
                toast.success('Quiz updated');
            } else {
                await api.post('/quizzes', payload);
                toast.success('Quiz created');
            }
            setShowForm(false);
            setEditingId(null);
            setForm(EMPTY_FORM);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save quiz');
        } finally { setSaving(false); }
    };

    const handlePublishToggle = async (quiz) => {
        try {
            if (quiz.isPublished) {
                await api.post(`/quizzes/${quiz.id}/unpublish`);
                toast.success('Quiz unpublished');
            } else {
                await api.post(`/quizzes/${quiz.id}/publish`);
                toast.success('Quiz published');
            }
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update quiz');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this quiz?')) return;
        try {
            await api.delete(`/quizzes/${id}`);
            toast.success('Quiz deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete quiz');
        }
    };

    const handleEdit = (quiz) => {
        setForm({
            title: quiz.title,
            description: quiz.description,
            questions: quiz.quizQuestions?.map(qq => qq.questionId) || [],
            timeLimit: quiz.timeLimit || '',
            maxAttempts: quiz.maxAttempts || '',
            passingScore: quiz.passingScore,
            startDate: quiz.startDate ? quiz.startDate.slice(0, 16) : '',
            endDate: quiz.endDate ? quiz.endDate.slice(0, 16) : ''
        });
        setEditingId(quiz.id);
        setShowForm(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Quizzes</h2>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    <FiPlus /> Create Quiz
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Quiz' : 'Create Quiz'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Quiz title" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Quiz description" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (min)</label>
                                    <input type="number" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: e.target.value }))} min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="No limit" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                                    <input type="number" value={form.maxAttempts} onChange={e => setForm(p => ({ ...p, maxAttempts: e.target.value }))} min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="Unlimited" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                    <input type="number" value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: e.target.value }))} min="0" max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (optional)</label>
                                    <input type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                                    <input type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                            </div>

                            {/* Question Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Questions * ({form.questions.length} selected)
                                </label>
                                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                    {allQuestions.length === 0 ? (
                                        <p className="p-4 text-sm text-gray-400 text-center">No questions available. Create questions first.</p>
                                    ) : allQuestions.map(q => (
                                        <label key={q.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" checked={form.questions.includes(q.id)} onChange={() => toggleQuestion(q.id)}
                                                className="mt-0.5 w-4 h-4 text-blue-600 rounded" />
                                            <div>
                                                <p className="text-sm text-gray-800">{q.questionText}</p>
                                                <p className="text-xs text-gray-400">{q.category} · {q.difficulty}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                                    {saving ? 'Saving...' : editingId ? 'Update Quiz' : 'Create Quiz'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quizzes List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <p className="text-gray-500">No quizzes yet. Create your first quiz!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white rounded-xl shadow p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quiz.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {quiz.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{quiz.description}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                        {quiz.timeLimit && <span>⏱ {quiz.timeLimit} min</span>}
                                        {quiz.maxAttempts && <span>📝 {quiz.maxAttempts} attempts</span>}
                                        <span>✅ Pass: {quiz.passingScore}%</span>
                                        <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => handlePublishToggle(quiz)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${quiz.isPublished ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                        {quiz.isPublished ? <><FiToggleRight /> Unpublish</> : <><FiToggleLeft /> Publish</>}
                                    </button>
                                    <button onClick={() => handleEdit(quiz)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(quiz.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageQuizzes;
