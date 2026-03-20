import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, ArrowRight, CheckCircle2, BookOpen, Code2 } from 'lucide-react';
import api from '../api';

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  order: number;
  total_lessons: number;
  total_questions: number;
  progress: number;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     'text-jlearn-cyan border-jlearn-cyan/30 bg-jlearn-cyan/5',
  Intermediate: 'text-[#ffe253] border-[#ffe253]/30 bg-[#ffe253]/5',
  Advanced:     'text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/5',
};

export default function Curriculum() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Topic[]>('/topics')
      .then(res => setTopics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalQuestions = topics.reduce((s, t) => s + t.total_questions, 0);
  const totalLessons   = topics.reduce((s, t) => s + t.total_lessons, 0);
  const masteredTopics = topics.filter(t => t.progress >= 100).length;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-16 pt-6 px-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-3 text-jlearn-cyan mb-2">
          <Library size={24} />
          <span className="uppercase tracking-[0.1em] text-sm font-bold">Course Curriculum</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Java Mastery Path
        </h1>
        <p className="text-[#b9cbc3] text-lg max-w-2xl leading-relaxed mt-1">
          Six structured modules taking you from Java fundamentals to advanced I/O and functional programming.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Modules',   value: topics.length },
          { label: 'Problems',        value: totalQuestions },
          { label: 'Lessons',         value: totalLessons },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#1c1b1b] rounded-xl p-5 border border-[#3a4a44]/20 flex flex-col gap-1">
            <span className="text-3xl font-bold text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>{value}</span>
            <span className="text-xs text-[#83958d] uppercase tracking-widest font-semibold">{label}</span>
          </div>
        ))}
      </div>

      {/* Topic list */}
      {loading ? (
        <div className="text-center text-[#83958d] font-mono animate-pulse py-16">Loading curriculum…</div>
      ) : (
        <div className="flex flex-col gap-4">
          {topics.map((topic, idx) => {
            const mastered = topic.progress >= 100;
            const started  = topic.progress > 0;
            return (
              <div
                key={topic.id}
                onClick={() => navigate(`/topic/${topic.id}`)}
                className="bg-[#1c1b1b] rounded-2xl p-6 border border-[#3a4a44]/20 hover:border-jlearn-cyan/20 hover:bg-[#1f1e1e] transition-all cursor-pointer group flex items-center gap-6"
              >
                {/* Module number */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg border ${mastered ? 'bg-jlearn-cyan/10 border-jlearn-cyan/30 text-jlearn-cyan' : 'bg-[#0e0e0e] border-[#3a4a44]/20 text-[#83958d]'}`}
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {mastered ? <CheckCircle2 size={22} className="text-jlearn-cyan" /> : String(idx + 1).padStart(2, '0')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-xl font-bold text-jlearn-primary group-hover:text-jlearn-cyan transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                      {topic.title}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${DIFFICULTY_COLOR[topic.difficulty] ?? DIFFICULTY_COLOR['Beginner']}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-[#83958d] leading-relaxed line-clamp-1">{topic.description}</p>
                  <div className="flex items-center gap-5 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-[#83958d]">
                      <Code2 size={12} /> {topic.total_questions} problems
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#83958d]">
                      <BookOpen size={12} /> {topic.total_lessons} lessons
                    </span>
                    {started && (
                      <span className="text-xs text-jlearn-cyan font-semibold">
                        {Math.round(topic.progress)}% complete
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar + CTA */}
                <div className="shrink-0 flex flex-col items-end gap-3 w-36">
                  <div className="w-full h-1.5 bg-[#0e0e0e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-jlearn-cyan rounded-full transition-all"
                      style={{ width: `${topic.progress}%` }}
                    />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-jlearn-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                    {mastered ? 'Review' : started ? 'Continue' : 'Start'} <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {masteredTopics > 0 && (
        <p className="text-center text-sm text-[#83958d]">
          {masteredTopics} of {topics.length} modules mastered
        </p>
      )}
    </div>
  );
}
