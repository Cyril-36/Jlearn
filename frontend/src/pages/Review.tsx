import { Brain, AlertCircle, ArrowRight, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

interface ReviewData {
  id: number;
  topic_id: string;
  topic_title: string;
  priority: string;
  reason: string;
  question_count: number;
  difficulty_mix: string;
}

export default function Review() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const loadReviews = () =>
    api.get('/reviews')
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));

  useEffect(() => { void loadReviews(); }, []);

  const handleGenerateDrill = async () => {
    setGenerating(true);
    setGenerated(false);
    // Re-fetch reviews to simulate a refreshed drill set
    await loadReviews();
    setGenerating(false);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-16 pt-6 px-4">
      <div className="flex flex-col gap-2 relative">
        <div className="inline-flex items-center gap-3 text-jlearn-cyan mb-2">
          <Brain size={24} />
          <span className="uppercase tracking-[0.1em] text-sm font-bold">Smart Review Engine</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Weakness Isolation
        </h1>
        <p className="text-[#b9cbc3] text-lg max-w-2xl leading-relaxed mt-2">
          We detected recurring friction in your recent submissions. These targeted exercises are synthesized to repair knowledge gaps before moving forward.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
        <div className="md:col-span-2 flex flex-col gap-6">
          {reviews.map((r) => (
            <ReviewCard 
              key={r.id}
              priority={r.priority as 'High' | 'Medium' | 'Low'}
              topic={r.topic_title}
              reason={r.reason}
              count={`${r.question_count} Questions`}
              difficultyMix={r.difficulty_mix}
              action={() => navigate(`/topic/${r.topic_id}`)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#0e0e0e] rounded-2xl p-6 border border-[#3a4a44]/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ffb4ab]"></div>
            <h3 className="text-lg font-bold text-[#ffb4ab] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <AlertCircle size={18} /> Most Frequent Error
            </h3>
            <div className="bg-[#1c1b1b] p-4 rounded-lg border border-[#3a4a44]/30 font-mono text-sm text-[#e5e2e1]">
              NullPointerException
            </div>
            <p className="text-sm text-[#83958d] mt-4 leading-relaxed">
              Occurred 4 times yesterday. Usually caused by attempting to access fields or methods of an uninitialized object instance.
            </p>
          </div>
          
          <button
            onClick={handleGenerateDrill}
            disabled={generating}
            className="flex w-full items-center justify-center gap-2 py-4 rounded-xl border border-[#3a4a44]/50 bg-[#1c1b1b] text-[#b9cbc3] hover:text-jlearn-primary hover:bg-[#201f1f] transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <><RefreshCcw size={16} className="animate-spin" /> Generating…</>
            ) : generated ? (
              <><CheckCircle2 size={16} className="text-jlearn-cyan" /> <span className="text-jlearn-cyan">Drill Set Ready!</span></>
            ) : (
              <><RefreshCcw size={16} /> Generate New Drill Set</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ priority, topic, reason, count, difficultyMix, action }: { priority: 'High' | 'Medium' | 'Low', topic: string, reason: string, count: string, difficultyMix: string, action: () => void }) {
  const priorityColor = priority === 'High' ? 'text-[#ffb4ab]' : priority === 'Medium' ? 'text-[#ffe253]' : 'text-jlearn-cyan';
  
  return (
    <div className="bg-[#1c1b1b] rounded-2xl p-6 border border-[#3a4a44]/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-ambient group hover:border-[#3a4a44]/50 transition-colors">
      <div className="flex flex-col gap-2 max-w-md">
        <span className={`text-xs font-bold uppercase tracking-widest ${priorityColor}`}>Priority: {priority}</span>
        <h3 className="text-2xl font-bold text-jlearn-primary" style={{ fontFamily: 'var(--font-display)' }}>{topic}</h3>
        <p className="text-[#b9cbc3] text-sm leading-relaxed">{reason}</p>
      </div>
      
      <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
        <span className="px-3 py-1 bg-[#0e0e0e] border border-[#3a4a44]/30 rounded text-xs font-mono text-[#83958d]">
          {count} • {difficultyMix}
        </span>
        <button 
          onClick={action}
          className="btn-primary w-full md:w-auto px-6 py-2.5 flex items-center justify-center gap-2 text-sm shadow-[0_0_10px_rgba(0,255,209,0.1)]"
        >
          Start Review <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
