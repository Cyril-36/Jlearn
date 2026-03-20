import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';

interface Question {
  id: string;
  topic_id: string;
  title: string;
  difficulty: string;
  status: string;
}

interface TopicInfo {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  total_lessons: number;
  total_questions: number;
}

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState<TopicInfo | null>(null);
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get<Question[]>(`/questions/${topicId}`),
      api.get<TopicInfo>(`/topic/${topicId}`),
      api.get<Array<{ id: string }>>(`/lessons/${topicId}`),
    ])
      .then(([questionsRes, topicRes, lessonsRes]) => {
        if (!active) {
          return;
        }

        setQuestions(questionsRes.data);
        setTopic(topicRes.data);
        setFirstLessonId(lessonsRes.data[0]?.id ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [topicId, location.key]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-16 pt-4 px-4">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-[#83958d] hover:text-jlearn-primary self-start transition-colors font-medium text-sm tracking-wide uppercase"
      >
        <ArrowLeft size={16} /> Dashboard
      </button>

      <div>
        <div className="flex items-center gap-3 text-jlearn-cyan mb-4">
          <Layers size={24} />
          <span className="uppercase tracking-[0.1em] text-sm font-bold">Topic Registry</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {topic?.title || `Topic ${topicId?.toUpperCase()}`}
        </h1>
        <p className="text-[#b9cbc3] text-lg max-w-3xl leading-relaxed">
          {topic?.description || 'Complete these precision practice problems to master the concepts in this section.'}
        </p>
        {(topic && topic.total_lessons > 0) || firstLessonId ? (
          <button
            onClick={() => firstLessonId && navigate(`/lesson/${firstLessonId}`)}
            className="btn-primary mt-4 px-6 py-3 inline-flex items-center gap-2 font-bold text-sm w-fit"
          >
            <Layers size={16} /> Start Learning ({topic?.total_lessons || 0} Lessons)
          </button>
        ) : null}
      </div>

      <div className="flex flex-col rounded-2xl overflow-hidden bg-[#1c1b1b] shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="bg-[#0e0e0e] p-6 font-bold flex items-center justify-between px-8 text-xs text-[#83958d] uppercase tracking-[0.15em]">
          <span className="flex-1 pl-4">Problem Statement</span>
          <div className="flex w-72 items-center justify-between">
            <span>Difficulty</span>
            <span className="w-24 text-center">Action</span>
          </div>
        </div>
        
        {loading && <div className="p-16 text-center text-[#83958d] font-mono animate-pulse">Initializing practice problems...</div>}
        
        {!loading && questions.map((q, i) => (
          <div 
            key={q.id} 
            className="p-6 px-8 flex items-center justify-between border-b border-[#2a2a2a] last:border-0 hover:bg-[#201f1f] transition-colors group cursor-pointer"
            onClick={() => navigate(`/solve/${q.id}`)}
          >
            <div className="flex items-center gap-6 flex-1">
              <span className="text-[#83958d] font-mono text-sm w-8">{String(i + 1).padStart(2, '0')}.</span>
              <span className="font-semibold text-lg text-jlearn-primary group-hover:text-jlearn-cyan transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {q.title}
              </span>
            </div>
            <div className="flex w-72 items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-[#0e0e0e] border border-[#3a4a44]/30 ${q.difficulty === 'Easy' ? 'text-jlearn-cyan' : q.difficulty === 'Medium' ? 'text-[#ffe253]' : 'text-[#ffb4ab]'}`}>
                {q.difficulty}
              </span>
              
              <div className="w-24 flex justify-end pr-2">
                {q.status === 'Solved' ? (
                  <span className="text-sm text-[#83958d] font-bold flex items-center gap-2 uppercase tracking-wide">
                    Solved
                  </span>
                ) : (
                  <button 
                    className="text-jlearn-cyan opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-widest translate-x-2 group-hover:translate-x-0"
                  >
                    Solve <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
