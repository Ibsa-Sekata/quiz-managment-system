import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCopy, FiLayers, FiChevronDown, FiChevronUp, FiCheck, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY_Q = {
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    category: '',
    difficulty: 'medium',
    explanation: ''
};

const diffColor = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' };

// ─── Single Question Form ─────────────────────────────────────────────────────
const QuestionForm = ({ data, index, onChange, onRemove, canRemove, isCollapsed, onToggle, status }) => {
    const setField = (field, value) => onChange(index, { ...data, [field]: value });
    const setOption = (i, value) => {
        const opts = [...data.options];
        opts[i] = value;
        onChange(index, { ...data, options: opts });
    };

    const isComplete = data.questionText.trim() && data.category.trim() && data.options.every(o => o.trim());

    return (
        <div className={`border-2 rounded-2xl transition-all ${status === 'saved' ? 'border-green-400 dark:border-green-600 bg-green-50/30 dark:bg-green-900/10' :
                status === 'error' ? 'border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-900/10' :
                    isComplete ? 'border-primary-300 dark:border-primary-700 bg-white dark:bg-dark-surface' :
                        'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface'
            }`}>
            {/* Header */}
            <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none"
                onClick={onToggle}
            >
                {/* Status icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${status === 'saved' ? 'bg-green-500 text-white' :
                        status === 'error' ? 'bg-red-500 text-white' :
                            isComplete ? 'bg-primary-500 text-white' :
                                'bg-gray-200 dark:bg-dark-bg text-gray-500 dark:text-dark-muted'
                    }`}>
                    {status === 'saved' ? <FiCheck size={14} /> :
                        status === 'error' ? <FiAlertCircle size={14} /> :
                            index + 1}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${data.questionText.trim()
                            ? 'text-gray-800 dark:text-dark-text'
                            : 'text-gray-400 dark:text-dark-muted italic'
                        }`}>
                        {data.questionText.trim() || `Question ${index + 1} — click to expand`}
                    </p>
                    {data.category && (
                        <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">{data.category} · {data.difficulty}</p>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {isComplete && status !== 'saved' && (
                        <span className="badge-green text-xs hidden sm:inline">Ready</span>
                    )}
                    {canRemove && (
                        <button
                            onClick={e => { e.stopPropagation(); onRemove(index); }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Remove this question"
                        >
                            <FiX size={15} />
                        </button>
                    )}
                    {isCollapsed ? <FiChevronDown className="text-gray-400" size={16} /> : <FiChevronUp className="text-gray-400" size={16} />}
                </div>
            </div>

            {/* Body */}
            {!isCollapsed && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-dark-border pt-4">
                    <div>
                        <label className="label">Question Text *</label>
                        <textarea
                            value={data.questionText}
                            onChange={e => setField('questionText', e.target.value)}
                            rows={2}
                            className="input"
                            placeholder="Enter your question..."
                        />
                    </div>

                    <div>
                        <label className="label">
                            Options * <span className="text-gray-400 dark:text-dark-muted font-normal">(select the correct answer)</span>
                        </label>
                        <div className="space-y-2">
                            {['A', 'B', 'C', 'D'].map((letter, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={data.correctAnswerIndex === i}
                                        onChange={() => setField('correctAnswerIndex', i)}
                                        className="w-4 h-4 accent-primary-600 flex-shrink-0"
                                    />
                                    <span className={`text-sm font-bold w-5 flex-shrink-0 ${data.correctAnswerIndex === i ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-dark-muted'
                                        }`}>{letter}</span>
                                    <input
                                        type="text"
                                        value={data.options[i]}
                                        onChange={e => setOption(i, e.target.value)}
                                        className="input flex-1"
                                        placeholder={`Option ${letter}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Category *</label>
                            <input
                                type="text"
                                value={data.category}
                                onChange={e => setField('category', e.target.value)}
                                className="input"
                                placeholder="e.g. Science, Math"
                            />
                        </div>
                        <div>
                            <label className="label">Difficulty</label>
                            <select value={data.difficulty} onChange={e => setField('difficulty', e.target.value)} className="input">
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Explanation <span className="text-gray-400 dark:text-dark-muted font-normal">(optional)</span></label>
                        <textarea
                            value={data.explanation}
                            onChange={e => setField('explanation', e.target.value)}
                            rows={2}
                            className="input"
                            placeholder="Explain the correct answer..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bulk form state
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [bulkQuestions, setBulkQuestions] = useState([{ ...EMPTY_Q }]);
    const [collapsed, setCollapsed] = useState({});
    const [statuses, setStatuses] = useState({});
    const [saving, setSaving] = useState(false);
    const [sharedCategory, setSharedCategory] = useState('');
    const [sharedDifficulty, setSharedDifficulty] = useState('');

    // Edit single question state
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ ...EMPTY_Q });
    const [editSaving, setEditSaving] = useState(false);

    useEffect(() => { fetchQuestions(); }, []);

    const fetchQuestions = async () => {
        try {
            const res = await api.get('/questions/all?limit=200');
            setQuestions(res.data.questions);
        } catch { toast.error('Failed to fetch questions'); }
        finally { setLoading(false); }
    };

    // ── Bulk form handlers ──────────────────────────────────────────────────────
    const addQuestion = () => {
        const newQ = {
            ...EMPTY_Q,
            category: sharedCategory || '',
            difficulty: sharedDifficulty || 'medium'
        };
        setBulkQuestions(prev => [...prev, newQ]);
        // Auto-expand the new one, collapse others
        const newIdx = bulkQuestions.length;
        setCollapsed(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { next[k] = true; });
            next[newIdx] = false;
            return next;
        });
    };

    const duplicateQuestion = (index) => {
        const copy = { ...bulkQuestions[index], options: [...bulkQuestions[index].options] };
        const newList = [...bulkQuestions];
        newList.splice(index + 1, 0, copy);
        setBulkQuestions(newList);
        toast.success('Question duplicated');
    };

    const removeQuestion = (index) => {
        if (bulkQuestions.length === 1) { toast.warning('At least one question is required'); return; }
        setBulkQuestions(prev => prev.filter((_, i) => i !== index));
        setStatuses(prev => {
            const next = {};
            Object.entries(prev).forEach(([k, v]) => {
                const ki = parseInt(k);
                if (ki < index) next[ki] = v;
                else if (ki > index) next[ki - 1] = v;
            });
            return next;
        });
    };

    const updateQuestion = (index, data) => {
        setBulkQuestions(prev => prev.map((q, i) => i === index ? data : q));
        // Clear error status when user edits
        if (statuses[index] === 'error') {
            setStatuses(prev => { const n = { ...prev }; delete n[index]; return n; });
        }
    };

    const applySharedSettings = () => {
        if (!sharedCategory && !sharedDifficulty) { toast.warning('Set a shared category or difficulty first'); return; }
        setBulkQuestions(prev => prev.map(q => ({
            ...q,
            category: sharedCategory || q.category,
            difficulty: sharedDifficulty || q.difficulty
        })));
        toast.success('Applied to all questions');
    };

    const handleBulkSubmit = async () => {
        // Validate all
        const invalid = [];
        bulkQuestions.forEach((q, i) => {
            if (!q.questionText.trim()) invalid.push(i);
            else if (!q.category.trim()) invalid.push(i);
            else if (q.options.some(o => !o.trim())) invalid.push(i);
        });

        if (invalid.length > 0) {
            const newStatuses = {};
            invalid.forEach(i => { newStatuses[i] = 'error'; });
            setStatuses(newStatuses);
            // Expand first invalid
            setCollapsed(prev => ({ ...prev, [invalid[0]]: false }));
            toast.error(`${invalid.length} question(s) have missing fields — please complete them`);
            return;
        }

        setSaving(true);
        try {
            const res = await api.post('/questions/bulk', { questions: bulkQuestions });
            const { created, failed, errors } = res.data;

            if (failed > 0) {
                const newStatuses = {};
                errors.forEach(e => { newStatuses[e.index - 1] = 'error'; });
                setStatuses(newStatuses);
                toast.warning(`${created} created, ${failed} failed`);
            } else {
                toast.success(`✅ ${created} question(s) created successfully!`);
                setShowBulkForm(false);
                setBulkQuestions([{ ...EMPTY_Q }]);
                setStatuses({});
                setCollapsed({});
                setSharedCategory('');
                setSharedDifficulty('');
            }
            fetchQuestions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save questions');
        } finally { setSaving(false); }
    };

    const readyCount = bulkQuestions.filter(q =>
        q.questionText.trim() && q.category.trim() && q.options.every(o => o.trim())
    ).length;

    // ── Edit single question ────────────────────────────────────────────────────
    const handleEdit = (q) => {
        setEditForm({
            questionText: q.questionText,
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correctAnswerIndex: q.correctAnswerIndex,
            category: q.category,
            difficulty: q.difficulty,
            explanation: q.explanation || ''
        });
        setEditingId(q.id);
        setShowEditForm(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editForm.options.some(o => !o.trim())) { toast.error('All 4 options are required'); return; }
        setEditSaving(true);
        try {
            await api.put(`/questions/${editingId}`, editForm);
            toast.success('Question updated');
            setShowEditForm(false);
            setEditingId(null);
            fetchQuestions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update question');
        } finally { setEditSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await api.delete(`/questions/${id}`);
            toast.success('Question deleted');
            fetchQuestions();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="page-title">Manage Questions</h2>
                <button
                    onClick={() => { setShowBulkForm(true); setBulkQuestions([{ ...EMPTY_Q }]); setStatuses({}); setCollapsed({}); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiLayers size={16} /> Add Questions
                </button>
            </div>

            {/* ── BULK CREATE MODAL ── */}
            {showBulkForm && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-2xl shadow-2xl w-full max-w-3xl my-4">

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-surface rounded-t-2xl border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">Add Multiple Questions</h3>
                                <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                                    {bulkQuestions.length} question{bulkQuestions.length !== 1 ? 's' : ''} ·{' '}
                                    <span className="text-green-600 dark:text-green-400 font-medium">{readyCount} ready</span>
                                </p>
                            </div>
                            <button onClick={() => setShowBulkForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1">
                                <FiX size={22} />
                            </button>
                        </div>

                        {/* Shared settings bar */}
                        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/40">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wider">
                                Apply to all questions
                            </p>
                            <div className="flex flex-wrap gap-3 items-end">
                                <div className="flex-1 min-w-36">
                                    <label className="label text-xs">Shared Category</label>
                                    <input
                                        type="text"
                                        value={sharedCategory}
                                        onChange={e => setSharedCategory(e.target.value)}
                                        className="input text-sm py-2"
                                        placeholder="e.g. Science"
                                    />
                                </div>
                                <div className="min-w-32">
                                    <label className="label text-xs">Shared Difficulty</label>
                                    <select value={sharedDifficulty} onChange={e => setSharedDifficulty(e.target.value)} className="input text-sm py-2">
                                        <option value="">Keep individual</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <button
                                    onClick={applySharedSettings}
                                    className="btn-secondary text-sm py-2 px-4 whitespace-nowrap"
                                >
                                    Apply to All
                                </button>
                            </div>
                        </div>

                        {/* Questions list */}
                        <div className="p-4 space-y-3">
                            {bulkQuestions.map((q, idx) => (
                                <div key={idx} className="relative">
                                    <QuestionForm
                                        data={q}
                                        index={idx}
                                        onChange={updateQuestion}
                                        onRemove={removeQuestion}
                                        canRemove={bulkQuestions.length > 1}
                                        isCollapsed={collapsed[idx] !== false}
                                        onToggle={() => setCollapsed(prev => ({ ...prev, [idx]: prev[idx] === false ? true : false }))}
                                        status={statuses[idx]}
                                    />
                                    {/* Duplicate button */}
                                    <button
                                        onClick={() => duplicateQuestion(idx)}
                                        className="absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 transition shadow-sm"
                                        title="Duplicate this question"
                                    >
                                        <FiCopy size={12} />
                                    </button>
                                </div>
                            ))}

                            {/* Add another question button */}
                            <button
                                onClick={addQuestion}
                                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-2xl text-gray-500 dark:text-dark-muted hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <FiPlus size={16} /> Add Another Question
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-white dark:bg-dark-surface rounded-b-2xl border-t border-gray-200 dark:border-dark-border flex items-center justify-between gap-4 sticky bottom-0">
                            <div className="text-sm text-gray-500 dark:text-dark-muted">
                                {readyCount === bulkQuestions.length
                                    ? <span className="text-green-600 dark:text-green-400 font-medium">✓ All {bulkQuestions.length} questions ready</span>
                                    : <span>{readyCount}/{bulkQuestions.length} questions complete</span>
                                }
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowBulkForm(false)} className="btn-secondary px-5">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkSubmit}
                                    disabled={saving || readyCount === 0}
                                    className="btn-primary px-6 disabled:opacity-50"
                                >
                                    {saving
                                        ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</span>
                                        : `Save ${bulkQuestions.length} Question${bulkQuestions.length !== 1 ? 's' : ''}`
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EDIT SINGLE QUESTION MODAL ── */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">Edit Question</h3>
                            <button onClick={() => setShowEditForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Question Text *</label>
                                <textarea value={editForm.questionText}
                                    onChange={e => setEditForm(p => ({ ...p, questionText: e.target.value }))}
                                    required rows={3} className="input" placeholder="Enter your question..." />
                            </div>
                            <div>
                                <label className="label">Options * <span className="text-gray-400 dark:text-dark-muted font-normal">(select the correct answer)</span></label>
                                <div className="space-y-2">
                                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <input type="radio" name="edit-correct" checked={editForm.correctAnswerIndex === i}
                                                onChange={() => setEditForm(p => ({ ...p, correctAnswerIndex: i }))}
                                                className="w-4 h-4 accent-primary-600" />
                                            <span className={`text-sm font-bold w-5 ${editForm.correctAnswerIndex === i ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-dark-muted'}`}>{letter}</span>
                                            <input type="text" value={editForm.options[i]}
                                                onChange={e => { const o = [...editForm.options]; o[i] = e.target.value; setEditForm(p => ({ ...p, options: o })); }}
                                                required className="input flex-1" placeholder={`Option ${letter}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category *</label>
                                    <input type="text" value={editForm.category}
                                        onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                                        required className="input" placeholder="e.g. Science, Math" />
                                </div>
                                <div>
                                    <label className="label">Difficulty</label>
                                    <select value={editForm.difficulty} onChange={e => setEditForm(p => ({ ...p, difficulty: e.target.value }))} className="input">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label">Explanation <span className="text-gray-400 dark:text-dark-muted font-normal">(optional)</span></label>
                                <textarea value={editForm.explanation}
                                    onChange={e => setEditForm(p => ({ ...p, explanation: e.target.value }))}
                                    rows={2} className="input" placeholder="Explain the correct answer..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={editSaving} className="btn-primary flex-1">
                                    {editSaving ? 'Saving...' : 'Update Question'}
                                </button>
                                <button type="button" onClick={() => setShowEditForm(false)} className="btn-secondary px-6">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── QUESTIONS LIST ── */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : questions.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiLayers className="text-5xl text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-dark-muted text-lg">No questions yet</p>
                    <p className="text-gray-400 dark:text-slate-600 text-sm mt-1">Click "Add Questions" to create your first batch</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500 dark:text-dark-muted">{questions.length} question{questions.length !== 1 ? 's' : ''} total</p>
                    </div>
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
                                        {q.explanation && (
                                            <p className="mt-2 text-xs text-gray-400 dark:text-slate-600 italic">💡 {q.explanation}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button onClick={() => handleEdit(q)}
                                            className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition">
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(q.id)}
                                            className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageQuestions;
