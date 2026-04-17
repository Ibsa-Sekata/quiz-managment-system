import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY_FORM = {
    questionText: '', options: ['', '', '', ''],
    correctAnswerIndex: 0, category: '', difficulty: 'medium', explanation: ''
};

const ManageQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchQuestions(); }, []);

    const fetchQuestions = async () => {
        try {
            const res = await api.get('/questions/all?limit=100');
            setQuestions(res.data.questions);
        } catch { toast.error('Failed to fetch questions'); }
        finally { setLoading(false); }
    };

    const handleOptionChange = (index, value) => {
        const opts = [...form.options];
        opts[index] = value;
        setForm(prev => ({ ...prev, options: opts }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.options.some(o => !o.trim())) {
            toast.error('All 4 options are required');
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/questions/${editingId}`, form);
                toast.success('Question updated');
            } else {
                await api.post('/questions', form);
                toast.success('Question created');
            }
            setShowForm(false);
            setEditingId(null);
            setForm(EMPTY_FORM);
            fetchQuestions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save question');
        } finally { setSaving(false); }
    };

    const handleEdit = (q) => {
        setForm({
            questionText: q.questionText,
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correctAnswerIndex: q.correctAnswerIndex,
            category: q.category,
            difficulty: q.difficulty,
            explanation: q.explanation || ''
        });
        setEditingId(q.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await api.delete(`/questions/${id}`);
            toast.success('Question deleted');
            fetchQuestions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete question');
        }
    };

    const difficultyColor = { easy: 'text-green-600 bg-green-50', medium: 'text-yellow-600 bg-yellow-50', hard: 'text-red-600 bg-red-50' };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Questions</h2>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    <FiPlus /> Add Question
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Question' : 'New Question'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                                <textarea
                                    value={form.questionText}
                                    onChange={e => setForm(p => ({ ...p, questionText: e.target.value }))}
                                    required rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Enter your question..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Options * (select the correct one)</label>
                                <div className="space-y-2">
                                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="correct"
                                                checked={form.correctAnswerIndex === i}
                                                onChange={() => setForm(p => ({ ...p, correctAnswerIndex: i }))}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm font-medium text-gray-600 w-4">{letter}</span>
                                            <input
                                                type="text"
                                                value={form.options[i]}
                                                onChange={e => handleOptionChange(i, e.target.value)}
                                                required
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder={`Option ${letter}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Select the radio button next to the correct answer</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="e.g. Science, Math"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                    <select
                                        value={form.difficulty}
                                        onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
                                <textarea
                                    value={form.explanation}
                                    onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Explain the correct answer..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                                    {saving ? 'Saving...' : editingId ? 'Update Question' : 'Create Question'}
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

            {/* Questions List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : questions.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <p className="text-gray-500">No questions yet. Create your first question!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-white rounded-xl shadow p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{q.category}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
                                    </div>
                                    <p className="text-gray-800 font-medium mb-3">{q.questionText}</p>
                                    <div className="grid grid-cols-2 gap-1 text-sm">
                                        {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, i) => (
                                            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${i === q.correctAnswerIndex ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-500'}`}>
                                                <span className="font-semibold">{['A', 'B', 'C', 'D'][i]}.</span>
                                                <span>{opt}</span>
                                                {i === q.correctAnswerIndex && <span className="ml-auto text-green-500">✓</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
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
