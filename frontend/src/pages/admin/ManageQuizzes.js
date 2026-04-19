import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY = { title: '', description: '', questions: [], timeLimit: '', maxAttempts: '', passingScore: 50, startDate: '', endDate: '' };

const ManageQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [qz, qs] = await Promise.all([api.get('/quizzes/all?limit=100'), api.get('/questions/all?limit=200')]);
            setQuizzes(qz.data.quizzes);
            setAllQuestions(qs.data.questions);
        } catch { toast.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    const toggleQ = (id) => setForm(p => ({
        ...p, questions: p.questions.includes(id) ? p.questions.filter(x => x !== id) : [...p.questions, id]
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.questions.length === 0) { toast.error('Select at least one question'); return; }
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
            if (editingId) { await api.put(`/quizzes/${editingId}`, payload); toast.success('Quiz updated'); }
            else { await api.post('/quizzes', payload); toast.success('Quiz created'); }
            setShowForm(false); setEditingId(null); setForm(EMPTY);
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save quiz'); }
        finally { setSaving(false); }
    };

    const handlePublishToggle = async (quiz) => {
        try {
            await api.post(`/quizzes/${quiz.id}/${quiz.isPublished ? 'unpublish' : 'publish'}`);
            toast.success(quiz.isPublished ? 'Quiz unpublished' : 'Quiz published');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this quiz?')) return;
        try { await api.delete(`/quizzes/${id}`); toast.success('Quiz deleted'); fetchData(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    };

    const handleEdit = (quiz) => {
        setForm({
            title: quiz.title, description: quiz.description,
            questions: quiz.quizQuestions?.map(qq => qq.questionId) || [],
            timeLimit: quiz.timeLimit || '', maxAttempts: quiz.maxAttempts || '',
            passingScore: quiz.passingScore,
            startDate: quiz.startDate ? quiz.startDate.slice(0, 16) : '',
            endDate: quiz.endDate ? quiz.endDate.slice(0, 16) : ''
        });
        setEditingId(quiz.id); setShowForm(true);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="page-title">Manage Quizzes</h2>
                <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY); }} className="btn-primary flex items-center gap-2">
                    <FiPlus /> Create Quiz
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">{editingId ? 'Edit Quiz' : 'Create Quiz'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className="input" placeholder="Quiz title" />
                            </div>
                            <div>
                                <label className="label">Description *</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required rows={2} className="input" placeholder="Quiz description" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="label">Time Limit (min)</label>
                                    <input type="number" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: e.target.value }))} min="1" className="input" placeholder="No limit" />
                                </div>
                                <div>
                                    <label className="label">Max Attempts</label>
                                    <input type="number" value={form.maxAttempts} onChange={e => setForm(p => ({ ...p, maxAttempts: e.target.value }))} min="1" className="input" placeholder="Unlimited" />
                                </div>
                                <div>
                                    <label className="label">Passing Score (%)</label>
                                    <input type="number" value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: e.target.value }))} min="0" max="100" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="input" />
                                </div>
                                <div>
                                    <label className="label">End Date</label>
                                    <input type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="input" />
                                </div>
                            </div>

                            <div>
                                <label className="label">Select Questions * <span className="text-gray-400 dark:text-dark-muted font-normal">({form.questions.length} selected)</span></label>
                                <div className="border border-gray-200 dark:border-dark-border rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
                                    {allQuestions.length === 0 ? (
                                        <p className="p-4 text-sm text-gray-400 dark:text-dark-muted text-center">No questions available. Create questions first.</p>
                                    ) : allQuestions.map(q => (
                                        <label key={q.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-bg cursor-pointer">
                                            <input type="checkbox" checked={form.questions.includes(q.id)} onChange={() => toggleQ(q.id)}
                                                className="mt-0.5 w-4 h-4 text-primary-600 accent-primary-600 rounded" />
                                            <div>
                                                <p className="text-sm text-gray-800 dark:text-dark-text">{q.questionText}</p>
                                                <p className="text-xs text-gray-400 dark:text-dark-muted">{q.category} · {q.difficulty}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : editingId ? 'Update Quiz' : 'Create Quiz'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : quizzes.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-gray-500 dark:text-dark-muted">No quizzes yet. Create your first quiz!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="card p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-semibold text-gray-800 dark:text-dark-text">{quiz.title}</h3>
                                        <span className={quiz.isPublished ? 'badge-green' : 'badge-yellow'}>
                                            {quiz.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-dark-muted mb-2">{quiz.description}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-slate-600">
                                        {quiz.timeLimit && <span>⏱ {quiz.timeLimit} min</span>}
                                        {quiz.maxAttempts && <span>📝 {quiz.maxAttempts} attempts</span>}
                                        <span>✅ Pass: {quiz.passingScore}%</span>
                                        <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button onClick={() => handlePublishToggle(quiz)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition ${quiz.isPublished
                                                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                            }`}>
                                        {quiz.isPublished ? <><FiToggleRight /> Unpublish</> : <><FiToggleLeft /> Publish</>}
                                    </button>
                                    <button onClick={() => handleEdit(quiz)} className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(quiz.id)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
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
