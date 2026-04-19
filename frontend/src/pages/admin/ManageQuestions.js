import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY = { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, category: '', difficulty: 'medium', explanation: '' };

const diffColor = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' };

const ManageQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchQuestions(); }, []);

    const fetchQuestions = async () => {
        try {
            const res = await api.get('/questions/all?limit=200');
            setQuestions(res.data.questions);
        } catch { toast.error('Failed to fetch questions'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.options.some(o => !o.trim())) { toast.error('All 4 options are required'); return; }
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/questions/${editingId}`, form);
                toast.success('Question updated');
            } else {
                await api.post('/questions', form);
                toast.success('Question created');
            }
            setShowForm(false); setEditingId(null); setForm(EMPTY);
            fetchQuestions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save question');
        } finally { setSaving(false); }
    };

    const handleEdit = (q) => {
        setForm({
            questionText: q.questionText, options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correctAnswerIndex: q.correctAnswerIndex, category: q.category, difficulty: q.difficulty, explanation: q.explanation || ''
        });
        setEditingId(q.id); setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await api.delete(`/questions/${id}`);
            toast.success('Question deleted'); fetchQuestions();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="page-title">Manage Questions</h2>
                <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY); }} className="btn-primary flex items-center gap-2">
                    <FiPlus /> Add Question
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">{editingId ? 'Edit Question' : 'New Question'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Question Text *</label>
                                <textarea value={form.questionText} onChange={e => setForm(p => ({ ...p, questionText: e.target.value }))}
                                    required rows={3} className="input" placeholder="Enter your question..." />
                            </div>

                            <div>
                                <label className="label">Options * <span className="text-gray-400 dark:text-dark-muted font-normal">(select the correct answer)</span></label>
                                <div className="space-y-2">
                                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <input type="radio" name="correct" checked={form.correctAnswerIndex === i}
                                                onChange={() => setForm(p => ({ ...p, correctAnswerIndex: i }))}
                                                className="w-4 h-4 text-primary-600 accent-primary-600" />
                                            <span className={`text-sm font-bold w-5 ${form.correctAnswerIndex === i ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-dark-muted'}`}>{letter}</span>
                                            <input type="text" value={form.options[i]}
                                                onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm(p => ({ ...p, options: o })); }}
                                                required className="input flex-1" placeholder={`Option ${letter}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category *</label>
                                    <input type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                        required className="input" placeholder="e.g. Science, Math" />
                                </div>
                                <div>
                                    <label className="label">Difficulty</label>
                                    <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className="input">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Explanation <span className="text-gray-400 dark:text-dark-muted font-normal">(optional)</span></label>
                                <textarea value={form.explanation} onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))}
                                    rows={2} className="input" placeholder="Explain the correct answer..." />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : editingId ? 'Update Question' : 'Create Question'}
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
            ) : questions.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-gray-500 dark:text-dark-muted">No questions yet. Create your first question!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="card p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="text-xs text-gray-400 dark:text-dark-muted font-medium">#{idx + 1}</span>
                                        <span className="badge-blue">{q.category}</span>
                                        <span className={diffColor[q.difficulty]}>{q.difficulty}</span>
                                    </div>
                                    <p className="text-gray-800 dark:text-dark-text font-medium mb-3">{q.questionText}</p>
                                    <div className="grid grid-cols-2 gap-1.5 text-sm">
                                        {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, i) => (
                                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${i === q.correctAnswerIndex
                                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                                                    : 'bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-dark-muted'
                                                }`}>
                                                <span className="font-bold text-xs">{['A', 'B', 'C', 'D'][i]}.</span>
                                                <span className="truncate">{opt}</span>
                                                {i === q.correctAnswerIndex && <span className="ml-auto">✓</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => handleEdit(q)} className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
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

export default ManageQuestions;
