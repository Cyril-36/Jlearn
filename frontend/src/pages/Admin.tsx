import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronUp, Loader2, Users, BookOpen, HelpCircle } from 'lucide-react';
import api from '../api';
import { readStoredUser } from '../utils/auth';
import { getErrorMessage } from '../utils/http';

// ── Types ────────────────────────────────────────────────────────

interface Topic { id: string; title: string; description: string; difficulty: string; order: number; }
interface Question { id: string; topic_id: string; title: string; difficulty: string; problem_statement: string; sample_input: string; sample_output: string; }
interface User { id: number; name: string; email: string; is_admin: boolean; created_at: string; }

type Tab = 'users' | 'topics' | 'questions';

// ── Main ─────────────────────────────────────────────────────────

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [topicsRes, usersRes] = await Promise.all([
        api.get<Topic[]>('/topics'),
        api.get<User[]>('/admin/users'),
      ]);
      setTopics(topicsRes.data);
      setUsers(usersRes.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to load'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = readStoredUser();
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }
    void loadAll();
  }, [loadAll, navigate]);

  const loadQuestions = useCallback(async (topicId: string) => {
    try {
      const res = await api.get<Question[]>(`/questions/${topicId}`);
      setQuestions((prev) => [...prev.filter((question) => question.topic_id !== topicId), ...res.data]);
    } catch { /* topic may have no questions yet */ }
  }, []);

  return (
    <div className="max-w-6xl mx-auto pt-6 pb-16 px-4 flex flex-col gap-8">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>Admin Panel</h1>
        <p className="text-[#83958d] mt-2">Manage users, curriculum, and content.</p>
      </div>

      {error && <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-lg p-3 text-[#ffb4ab] text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2">
        {([['users', 'Users', <Users size={16} />], ['topics', 'Topics', <BookOpen size={16} />], ['questions', 'Questions', <HelpCircle size={16} />]] as const).map(([key, label, icon]) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === key ? 'bg-jlearn-cyan/10 text-jlearn-cyan border border-jlearn-cyan/30' : 'text-[#83958d] hover:text-jlearn-primary hover:bg-[#1c1b1b]'}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-[#83958d] animate-pulse"><Loader2 size={20} className="animate-spin" /> Loading…</div>
      ) : (
        <>
          {tab === 'users' && <UsersTab users={users} />}
          {tab === 'topics' && <TopicsTab topics={topics} onRefresh={loadAll} />}
          {tab === 'questions' && <QuestionsTab topics={topics} questions={questions} onLoadQuestions={loadQuestions} />}
        </>
      )}
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────

function UsersTab({ users }: { users: User[] }) {
  return (
    <div className="bg-[#1c1b1b] rounded-2xl border border-[#3a4a44]/20 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#3a4a44]/20 text-[#83958d] text-xs uppercase tracking-widest">
            <th className="text-left p-4">ID</th>
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Role</th>
            <th className="text-left p-4">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-[#3a4a44]/10 hover:bg-[#0e0e0e] transition-colors">
              <td className="p-4 font-mono text-[#83958d]">{u.id}</td>
              <td className="p-4 font-semibold text-jlearn-primary">{u.name}</td>
              <td className="p-4 text-[#b9cbc3] font-mono text-xs">{u.email}</td>
              <td className="p-4">
                <span className={`text-xs font-bold px-2 py-1 rounded ${u.is_admin ? 'bg-jlearn-cyan/10 text-jlearn-cyan' : 'bg-[#3a4a44]/20 text-[#83958d]'}`}>
                  {u.is_admin ? 'Admin' : 'User'}
                </span>
              </td>
              <td className="p-4 text-[#83958d] text-xs font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Topics tab ────────────────────────────────────────────────────

function TopicsTab({ topics, onRefresh }: { topics: Topic[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', description: '', difficulty: 'Beginner', order: topics.length + 1 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      await api.post('/admin/topic', { ...form, order: Number(form.order) });
      setShowForm(false);
      setForm({ id: '', title: '', description: '', difficulty: 'Beginner', order: topics.length + 2 });
      onRefresh();
    } catch (error: unknown) { setErr(getErrorMessage(error, 'Error')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete topic "${id}"? This will also delete its questions and lessons.`)) return;
    await api.delete(`/admin/topic/${id}`);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setShowForm(!showForm)}
        className="self-start flex items-center gap-2 btn-primary px-4 py-2 text-sm font-bold">
        {showForm ? <ChevronUp size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'New Topic'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#1c1b1b] rounded-2xl p-6 border border-[#3a4a44]/20 grid grid-cols-2 gap-4">
          {err && <div className="col-span-2 text-[#ffb4ab] text-sm">{err}</div>}
          <Field label="ID (slug)" value={form.id} onChange={v => setForm(f => ({ ...f, id: v }))} placeholder="e.g. t7" required />
          <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Generics" required />
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Short description" className="col-span-2" />
          <SelectField label="Difficulty" value={form.difficulty} onChange={v => setForm(f => ({ ...f, difficulty: v }))}
            options={['Beginner', 'Intermediate', 'Advanced']} />
          <Field label="Order" value={String(form.order)} onChange={v => setForm(f => ({ ...f, order: Number(v) }))} type="number" />
          <div className="col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2 font-bold flex items-center gap-2 disabled:opacity-50">
              {saving && <Loader2 size={14} className="animate-spin" />} Create Topic
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#1c1b1b] rounded-2xl border border-[#3a4a44]/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3a4a44]/20 text-[#83958d] text-xs uppercase tracking-widest">
              <th className="text-left p-4">ID</th><th className="text-left p-4">Title</th>
              <th className="text-left p-4">Difficulty</th><th className="text-left p-4">Order</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {topics.map(t => (
              <tr key={t.id} className="border-b border-[#3a4a44]/10 hover:bg-[#0e0e0e]">
                <td className="p-4 font-mono text-[#83958d] text-xs">{t.id}</td>
                <td className="p-4 font-semibold text-jlearn-primary">{t.title}</td>
                <td className="p-4 text-[#83958d] text-xs">{t.difficulty}</td>
                <td className="p-4 text-[#83958d] text-xs font-mono">{t.order}</td>
                <td className="p-4 flex justify-end">
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-[#83958d] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Questions tab ─────────────────────────────────────────────────

function QuestionsTab({ topics, questions, onLoadQuestions }: {
  topics: Topic[]; questions: Question[]; onLoadQuestions: (id: string) => void;
}) {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.id ?? '');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    id: '', title: '', difficulty: 'Easy',
    problem_statement: '', sample_input: '', sample_output: '',
  });

  useEffect(() => {
    if (!selectedTopic && topics[0]) {
      setSelectedTopic(topics[0].id);
    }
  }, [selectedTopic, topics]);

  useEffect(() => {
    if (selectedTopic) {
      onLoadQuestions(selectedTopic);
    }
  }, [onLoadQuestions, selectedTopic]);

  const topicQuestions = questions.filter(q => q.topic_id === selectedTopic);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      await api.post('/admin/question', { ...form, topic_id: selectedTopic });
      setShowForm(false);
      setForm({ id: '', title: '', difficulty: 'Easy', problem_statement: '', sample_input: '', sample_output: '' });
      onLoadQuestions(selectedTopic);
    } catch (error: unknown) { setErr(getErrorMessage(error, 'Error')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/admin/question/${id}`);
    onLoadQuestions(selectedTopic);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}
          className="bg-[#1c1b1b] border border-[#3a4a44]/30 rounded-lg px-4 py-2 text-jlearn-primary text-sm font-mono focus:outline-none focus:border-jlearn-cyan/50">
          {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 btn-primary px-4 py-2 text-sm font-bold">
          {showForm ? <ChevronUp size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'New Question'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#1c1b1b] rounded-2xl p-6 border border-[#3a4a44]/20 grid grid-cols-2 gap-4">
          {err && <div className="col-span-2 text-[#ffb4ab] text-sm">{err}</div>}
          <Field label="ID (slug)" value={form.id} onChange={v => setForm(f => ({ ...f, id: v }))} placeholder="e.g. q-arraylist-1" required />
          <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Question title" required />
          <SelectField label="Difficulty" value={form.difficulty} onChange={v => setForm(f => ({ ...f, difficulty: v }))} options={['Easy', 'Medium', 'Hard']} />
          <Field label="Problem Statement" value={form.problem_statement} onChange={v => setForm(f => ({ ...f, problem_statement: v }))} className="col-span-2" textarea />
          <Field label="Sample Input" value={form.sample_input} onChange={v => setForm(f => ({ ...f, sample_input: v }))} placeholder="Leave blank if no input" />
          <Field label="Sample Output" value={form.sample_output} onChange={v => setForm(f => ({ ...f, sample_output: v }))} placeholder="Expected output" required />
          <div className="col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2 font-bold flex items-center gap-2 disabled:opacity-50">
              {saving && <Loader2 size={14} className="animate-spin" />} Create Question
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#1c1b1b] rounded-2xl border border-[#3a4a44]/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3a4a44]/20 text-[#83958d] text-xs uppercase tracking-widest">
              <th className="text-left p-4">ID</th><th className="text-left p-4">Title</th>
              <th className="text-left p-4">Difficulty</th><th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {topicQuestions.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-[#83958d] text-sm">No questions yet for this topic.</td></tr>
            )}
            {topicQuestions.map(q => (
              <tr key={q.id} className="border-b border-[#3a4a44]/10 hover:bg-[#0e0e0e]">
                <td className="p-4 font-mono text-[#83958d] text-xs">{q.id}</td>
                <td className="p-4 font-semibold text-jlearn-primary">{q.title}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'text-jlearn-cyan bg-jlearn-cyan/10' : q.difficulty === 'Medium' ? 'text-[#ffe253] bg-[#ffe253]/10' : 'text-[#ffb4ab] bg-[#ffb4ab]/10'}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="p-4 flex justify-end">
                  <button onClick={() => handleDelete(q.id)} className="p-2 text-[#83958d] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Small form helpers ────────────────────────────────────────────

function Field({ label, value, onChange, placeholder = '', required = false, type = 'text', className = '', textarea = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string; className?: string; textarea?: boolean;
}) {
  const base = "w-full bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-lg px-3 py-2.5 text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/50 text-sm font-mono transition-all";
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} rows={3} className={base} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className={base} />
      }
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-[#83958d]">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="bg-[#0e0e0e] border border-[#3a4a44]/30 rounded-lg px-3 py-2.5 text-[#e5e2e1] focus:outline-none focus:border-jlearn-cyan/50 text-sm font-mono transition-all">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
