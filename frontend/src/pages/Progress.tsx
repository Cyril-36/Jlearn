import { TrendingUp, Target, Activity, CheckCircle2, Coffee, Flame, Trophy, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';

interface TopicProgress {
  topic_id: string;
  topic_title: string;
  progress: number;
  total_questions: number;
  solved_questions: number;
  total_lessons: number;
  completed_lessons: number;
}

interface Stats {
  problems_solved: number;
  accuracy: number;
  streak: number;
  focus_hours: number;
}

interface Submission {
  id: number;
  question_id: string;
  question_title: string;
  status: 'success' | 'error';
  passed_test_cases: number;
  total_test_cases: number;
  execution_time_ms: number;
  submitted_at: string;
}

export default function Progress() {
  const [progress, setProgress] = useState<TopicProgress[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/progress'),
      api.get('/stats'),
      api.get('/submissions?limit=20'),
    ]).then(([progressRes, statsRes, subsRes]) => {
      setProgress(progressRes.data);
      setStats(statsRes.data);
      setSubmissions(subsRes.data);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-16 pt-6 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Progress Analytics
        </h1>
        <p className="text-[#b9cbc3] text-lg max-w-2xl leading-relaxed">
          Deep structural insights into your Java proficiency. Review your velocity, precision, and historical momentum.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Accuracy" value={stats ? `${stats.accuracy}%` : "—"} icon={<Target size={20} />} accent="cyan" />
        <MetricCard label="Solved" value={stats ? String(stats.problems_solved) : "—"} icon={<CheckCircle2 size={20} />} accent="cyan" />
        <MetricCard label="Streak" value={stats ? `${stats.streak} days` : "—"} icon={<TrendingUp size={20} />} accent="green" />
        <MetricCard label="Active Hrs" value={stats ? String(stats.focus_hours) : "—"} icon={<Activity size={20} />} accent="yellow" />
      </div>

      <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20 shadow-ambient">
        <h2 className="text-2xl font-bold text-jlearn-primary mb-8" style={{ fontFamily: 'var(--font-display)' }}>Topic Mastery Breakdown</h2>
        <div className="flex flex-col gap-8">
          {progress.map(t => (
            <TopicBar 
              key={t.topic_id} 
              name={t.topic_title} 
              percent={t.progress} 
              active={t.progress > 0 && t.progress < 100}
              detail={`${t.solved_questions}/${t.total_questions} questions • ${t.completed_lessons}/${t.total_lessons} lessons`}
            />
          ))}
        </div>
      </div>

      {/* Submission History */}
      {submissions.length > 0 && (
        <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20 shadow-ambient">
          <h2 className="text-2xl font-bold text-jlearn-primary mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Recent Submissions
          </h2>
          <div className="flex flex-col gap-2">
            {submissions.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#0e0e0e] border border-[#3a4a44]/20 hover:border-[#3a4a44]/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {s.status === 'success'
                    ? <CheckCircle2 size={16} className="text-jlearn-cyan shrink-0" />
                    : <XCircle size={16} className="text-[#ffb4ab] shrink-0" />}
                  <span className="font-semibold text-[#e5e2e1] truncate text-sm">{s.question_title}</span>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className={`text-xs font-bold font-mono ${s.status === 'success' ? 'text-jlearn-cyan' : 'text-[#ffb4ab]'}`}>
                    {s.passed_test_cases}/{s.total_test_cases} passed
                  </span>
                  <div className="flex items-center gap-1 text-[#83958d]">
                    <Clock size={12} />
                    <span className="text-xs font-mono">{s.execution_time_ms}ms</span>
                  </div>
                  <span className="text-[10px] text-[#83958d] font-mono hidden sm:block">
                    {new Date(s.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MilestonesSection stats={stats} progress={progress} />
    </div>
  );
}

function MetricCard({ label, value, icon, accent }: { label: string, value: string, icon: React.ReactNode, accent: string }) {
  const accentColor = accent === 'cyan' ? 'text-jlearn-cyan' : accent === 'green' ? 'text-[#84c5b0]' : 'text-[#ffe253]';
  return (
    <div className="bg-[#1c1b1b] p-6 rounded-xl border border-[#3a4a44]/20 flex flex-col gap-3">
      <div className={`flex items-center gap-2 ${accentColor}`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-widest text-[#83958d]">{label}</span>
      </div>
      <span className="text-3xl font-bold text-jlearn-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{value}</span>
    </div>
  );
}

function MilestonesSection({ stats, progress }: { stats: Stats | null, progress: TopicProgress[] }) {
  const solved = stats?.problems_solved ?? 0;
  const streak = stats?.streak ?? 0;
  const oopProgress = progress.find(t => t.topic_id === 't3')?.progress ?? 0;
  const allTopicsDone = progress.length > 0 && progress.every(t => t.progress >= 100);

  const milestones = [
    { icon: <Coffee size={36} />, label: 'First Java Program', earned: solved >= 1,  accent: 'yellow' },
    { icon: <Flame   size={36} />, label: '10 Day Streak',      earned: streak >= 10, accent: 'cyan'   },
    { icon: <Trophy  size={36} />, label: 'OOP Master',          earned: oopProgress >= 100, accent: 'yellow' },
    { icon: <Target  size={36} />, label: '50 Problems Solved',  earned: solved >= 50, accent: 'cyan'   },
    { icon: <Trophy  size={36} />, label: 'Java Champion',       earned: allTopicsDone, accent: 'yellow' },
  ];

  const earned   = milestones.filter(m => m.earned);
  const unearned = milestones.filter(m => !m.earned);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#83958d] mb-4">
          Earned Milestones
          <span className="ml-2 text-jlearn-cyan">({earned.length})</span>
        </h3>
        {earned.length === 0 ? (
          <p className="text-sm text-[#83958d] py-2">Complete challenges to earn milestones.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {earned.map(m => (
              <div key={m.label} className={`shrink-0 w-32 h-32 rounded-xl bg-[#0e0e0e] flex flex-col items-center justify-center gap-3 ${m.accent === 'cyan' ? 'border border-jlearn-cyan/30 shadow-[0_0_15px_rgba(0,255,209,0.1)] text-jlearn-cyan' : 'border border-[#ffcf40]/30 shadow-[0_0_15px_rgba(255,207,64,0.1)] text-[#ffe253]'}`}>
                {m.icon}
                <span className="text-xs font-bold text-[#b9cbc3] text-center px-2">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {unearned.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#83958d] mb-4">Locked</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {unearned.map(m => (
              <div key={m.label} className="shrink-0 w-32 h-32 rounded-xl bg-[#0e0e0e] border border-[#3a4a44]/30 flex flex-col items-center justify-center gap-3 opacity-40 grayscale">
                <span className="text-[#83958d]">{m.icon}</span>
                <span className="text-xs font-bold text-[#83958d] text-center px-2">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopicBar({ name, percent, active = false, detail }: { name: string, percent: number, active?: boolean, detail: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold text-[#e5e2e1]">{name}</span>
          <span className="text-xs text-[#83958d] font-mono">{detail}</span>
        </div>
        <span className="text-sm font-mono text-[#83958d]">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-[#0e0e0e] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            active 
              ? 'bg-jlearn-cyan shadow-[0_0_10px_rgba(0,255,209,0.5)]' 
              : percent === 100 
                ? 'bg-[#3a4a44]' 
                : 'bg-[#3a4a44]/50'
          }`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
