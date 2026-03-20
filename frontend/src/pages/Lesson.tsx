import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import api from '../api';
import { getErrorMessage } from '../utils/http';

interface LessonData {
  id: string;
  topic_id: string;
  title: string;
  order: number;
  concept: string;
  syntax: string;
  example_code: string;
  expected_output: string;
  key_notes: string;
  common_mistakes: string;
  completed: boolean;
}

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [topicLessons, setTopicLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lessonId) {
      setError('Lesson not found.');
      setLoading(false);
      return;
    }

    let active = true;

    const loadLesson = async () => {
      setLoading(true);
      setError('');
      try {
        const lessonResponse = await api.get<LessonData>(`/lesson/${lessonId}`);
        if (!active) {
          return;
        }

        setLesson(lessonResponse.data);
        const topicResponse = await api.get<LessonData[]>(`/lessons/${lessonResponse.data.topic_id}`);
        if (!active) {
          return;
        }

        setTopicLessons(topicResponse.data);
      } catch (error: unknown) {
        if (active) {
          setError(getErrorMessage(error, 'Failed to load lesson.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLesson();

    return () => {
      active = false;
    };
  }, [lessonId]);

  const currentIndex = useMemo(() => {
    if (!lesson) {
      return -1;
    }
    return topicLessons.findIndex((item) => item.id === lesson.id);
  }, [lesson, topicLessons]);

  const previousLesson = currentIndex > 0 ? topicLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 ? topicLessons[currentIndex + 1] ?? null : null;

  const markComplete = async () => {
    if (!lesson) {
      return;
    }

    setSaving(true);
    try {
      await api.post(`/lesson/${lesson.id}/complete`);
      setLesson((current) => (current ? { ...current, completed: true } : current));
      setTopicLessons((current) =>
        current.map((item) => (item.id === lesson.id ? { ...item, completed: true } : item)),
      );
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Could not save lesson progress.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pt-6 pb-16 px-4 text-[#83958d] font-mono animate-pulse">
        Loading lesson...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto pt-6 pb-16 px-4">
        <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20 text-[#ffb4ab]">{error || 'Lesson not found.'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-16 pt-4 px-4">
      <button
        onClick={() => navigate(`/topic/${lesson.topic_id}`)}
        className="flex items-center gap-2 text-[#83958d] hover:text-jlearn-primary self-start transition-colors font-medium text-sm tracking-wide uppercase"
      >
        <ArrowLeft size={16} /> Topic
      </button>

      {error ? (
        <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-lg p-3 text-[#ffb4ab] text-sm">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:flex gap-8">
        <aside className="lg:w-80 bg-[#1c1b1b] rounded-2xl border border-[#3a4a44]/20 p-5 h-fit">
          <div className="flex items-center gap-2 text-jlearn-cyan mb-4">
            <BookOpen size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Lessons</span>
          </div>

          <div className="flex flex-col gap-2">
            {topicLessons.map((item, index) => {
              const active = item.id === lesson.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/lesson/${item.id}`)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                    active ? 'bg-jlearn-cyan/10 text-jlearn-cyan border border-jlearn-cyan/20' : 'hover:bg-[#201f1f] text-[#b9cbc3]'
                  }`}
                >
                  {item.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">Lesson {index + 1}</div>
                    <div className="text-sm font-semibold truncate">{item.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-6">
          <div className="bg-[#1c1b1b] rounded-2xl p-8 border border-[#3a4a44]/20 shadow-ambient">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-jlearn-cyan mb-2">Lesson {lesson.order || currentIndex + 1}</div>
                <h1 className="text-4xl md:text-5xl font-bold text-jlearn-primary tracking-tight">{lesson.title}</h1>
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${lesson.completed ? 'text-jlearn-cyan border-jlearn-cyan/30 bg-jlearn-cyan/5' : 'text-[#83958d] border-[#3a4a44]/30 bg-[#0e0e0e]'}`}>
                {lesson.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>

            <Section title="Concept" content={lesson.concept} />
            <Section title="Syntax" content={lesson.syntax} mono />
            <Section title="Example Code" content={lesson.example_code} mono />
            <Section title="Expected Output" content={lesson.expected_output} mono />
            <Section title="Key Notes" content={lesson.key_notes} />
            <Section title="Common Mistakes" content={lesson.common_mistakes} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={() => previousLesson && navigate(`/lesson/${previousLesson.id}`)}
              disabled={!previousLesson}
              className="btn-secondary px-5 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <button
              onClick={markComplete}
              disabled={saving || lesson.completed}
              className="btn-primary px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={16} />
              {lesson.completed ? 'Completed' : saving ? 'Saving...' : 'Mark Complete'}
            </button>

            <button
              onClick={() => nextLesson ? navigate(`/lesson/${nextLesson.id}`) : navigate(`/topic/${lesson.topic_id}`)}
              className="btn-secondary px-5 py-3 flex items-center justify-center gap-2"
            >
              {nextLesson ? 'Next Lesson' : 'Back to Topic'} <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({ title, content, mono = false }: { title: string; content: string; mono?: boolean }) {
  if (!content) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#83958d] mb-3">{title}</h2>
      <div className={`rounded-xl border border-[#3a4a44]/20 bg-[#0e0e0e] p-5 whitespace-pre-wrap leading-relaxed ${mono ? 'font-mono text-sm text-[#e5e2e1]' : 'text-[#b9cbc3]'}`}>
        {content}
      </div>
    </div>
  );
}
