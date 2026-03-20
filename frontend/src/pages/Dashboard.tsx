import { Terminal, Award, Timer, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import api from '../api';

interface Topic {
  id: string;
  title: string;
  description: string;
  progress: number;
  difficulty: string;
  total_lessons: number;
  total_questions: number;
}

interface Stats {
  problems_solved: number;
  topics_completed: number;
  lessons_completed: number;
  accuracy: number;
  streak: number;
  focus_hours: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/topics'),
      api.get('/stats'),
    ]).then(([topicsRes, statsRes]) => {
      setTopics(topicsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-16 pt-6 px-4">
      <div className="flex flex-col gap-2">
        <span className="text-jlearn-cyan text-sm font-bold tracking-[0.1em] uppercase">Phase 01</span>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-jlearn-primary">
          Your Dashboard
        </h1>
        <p className="text-[#b9cbc3] text-lg mt-2 max-w-2xl leading-relaxed">
          Track your algorithmic momentum and mastery of Java fundamentals. You have {topics.filter(t => t.progress < 100).length} topics remaining to conquer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Terminal size={24} className="text-jlearn-cyan" />} title="Problems Solved" value={stats ? String(stats.problems_solved) : "—"} />
        <StatCard icon={<Award size={24} className="text-jlearn-primary" />} title="Topics Mastered" value={stats ? `${stats.topics_completed} / ${topics.length}` : "—"} />
        <StatCard icon={<Timer size={24} className="text-[#ffe253]" />} title="Focus Hours" value={stats ? String(stats.focus_hours) : "—"} />
      </div>

      <div>
        <h2 className="text-3xl font-semibold mb-8 text-jlearn-primary tracking-tight">The Roadmap</h2>
        
        {loading ? (
          <div className="flex justify-center p-12 text-[#83958d] animate-pulse font-mono flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-jlearn-cyan border-t-transparent animate-spin"></div>
            Loading curriculum...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {topics.map(topic => (
              <div 
                key={topic.id} 
                className="bg-[#1c1b1b] rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer group transition-all duration-300 hover:bg-[#2a2a2a] shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
                onClick={() => navigate(`/topic/${topic.id}`)}
              >
                <div className="flex flex-col gap-4 flex-1 pr-12">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-jlearn-primary group-hover:text-jlearn-cyan transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                        {topic.title}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[#3a4a44]/30 ${topic.difficulty === 'Beginner' ? 'text-jlearn-cyan bg-jlearn-cyan/5' : topic.difficulty === 'Intermediate' ? 'text-[#ffe253] bg-[#ffe253]/5' : 'text-[#ffb4ab] bg-[#ffb4ab]/5'}`}>
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-[#b9cbc3] mt-1 leading-relaxed max-w-xl">{topic.description}</p>
                    <div className="flex gap-4 mt-3 text-xs font-mono text-[#83958d]">
                      <span>{topic.total_lessons} lessons</span>
                      <span>•</span>
                      <span>{topic.total_questions} questions</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-[#0e0e0e] rounded-full h-1.5 mt-2 overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 bg-jlearn-cyan h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,255,209,0.5)]" 
                      style={{ width: `${topic.progress}%` }} 
                    />
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-0 flex flex-col items-end justify-center">
                  <span className="text-3xl font-bold text-jlearn-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    {topic.progress}%
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#83958d] mt-1 font-semibold">Mastery</span>
                  
                  <div className="mt-6 w-10 h-10 rounded-full bg-[#0e0e0e] flex items-center justify-center text-jlearn-cyan group-hover:scale-110 transition-transform duration-300">
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="bg-[#1c1b1b] rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden group hover:bg-[#201f1f] transition-colors shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#0e0e0e] flex items-center justify-center">
          {icon}
        </div>
        <span className="font-semibold text-[#83958d] uppercase tracking-wider text-sm">{title}</span>
      </div>
      <span className="text-[3rem] leading-none font-bold text-jlearn-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
        {value}
      </span>
    </div>
  );
}
