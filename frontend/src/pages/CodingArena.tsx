import { Editor } from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import { Play, Send, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { getErrorMessage } from '../utils/http';

interface TestCaseDetail {
  case: number;
  status: 'passed' | 'failed';
}

interface SubmitResult {
  success: boolean;
  output: string;
  execution_time_ms: number;
  passed: number;
  total: number;
  details?: TestCaseDetail[];
}

interface ExecuteResult {
  success: boolean;
  output: string;
  execution_time_ms: number;
}

interface TopicQuestion {
  id: string;
  title: string;
}

interface QuestionDetail {
  id: string;
  topic_id: string;
  title: string;
  difficulty: string;
  problem_statement: string;
  sample_input: string;
  sample_output: string;
  status: string;
}

const DEFAULT_CODE = `/* Write your Java code here */

public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, JLearn!");
    }
}`;

export default function CodingArena() {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [topicQuestions, setTopicQuestions] = useState<TopicQuestion[]>([]);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdinInput, setStdinInput] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [execTime, setExecTime] = useState('');
  const [testResults, setTestResults] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadQuestion = async () => {
      try {
        const questionResponse = await api.get<QuestionDetail>(`/question/${questionId}`);
        if (!active) {
          return;
        }

        setQuestion(questionResponse.data);
        const topicResponse = await api.get<TopicQuestion[]>(`/questions/${questionResponse.data.topic_id}`);
        if (active) {
          setTopicQuestions(topicResponse.data);
        }
      } catch (error: unknown) {
        if (active) {
          setOutput(getErrorMessage(error, 'Failed to load question.'));
          setStatus('error');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadQuestion();

    return () => {
      active = false;
    };
  }, [questionId]);

  const currentIndex = useMemo(
    () => (question ? topicQuestions.findIndex((item) => item.id === question.id) : -1),
    [question, topicQuestions],
  );

  const prevQuestion = currentIndex > 0 ? topicQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex >= 0 ? topicQuestions[currentIndex + 1] ?? null : null;

  const handleRun = async () => {
    setStatus('running');
    setOutput('Compiling and executing...');
    setExecTime('');
    setTestResults(null);

    try {
      const response = await api.post<ExecuteResult>('/execute', {
        code,
        test_input: stdinInput,
      });
      setOutput(response.data.output || 'No output.');
      setStatus(response.data.success ? 'success' : 'error');
      setExecTime(`${response.data.execution_time_ms}ms`);
    } catch (error: unknown) {
      setOutput(getErrorMessage(error, 'Execution failed.'));
      setStatus('error');
    }
  };

  const handleSubmit = async () => {
    if (!questionId) {
      return;
    }

    setStatus('running');
    setOutput('Compiling and running against test cases...');
    setExecTime('');
    setTestResults(null);

    try {
      const response = await api.post<SubmitResult>('/submit', {
        question_id: questionId,
        code,
        test_input: stdinInput,
      });
      setOutput(response.data.output || 'No output.');
      setStatus(response.data.success ? 'success' : 'error');
      setExecTime(`${response.data.execution_time_ms}ms`);
      setTestResults(response.data);
      if (response.data.success) {
        setQuestion((current) => (current ? { ...current, status: 'Solved' } : current));
      }
    } catch (error: unknown) {
      setOutput(getErrorMessage(error, 'Submission failed.'));
      setStatus('error');
    }
  };

  if (loading || !question) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-[#83958d] animate-pulse">
        Initializing workspace...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row p-4 gap-4 bg-[#131313]">
      <div className="w-full md:w-[40%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
        <button
          onClick={() => navigate(`/topic/${question.topic_id}`)}
          className="flex items-center gap-2 text-[#83958d] hover:text-jlearn-primary transition-colors text-xs font-bold uppercase tracking-widest pl-2"
        >
          <ChevronLeft size={16} /> Back to Topic
        </button>

        <div className="bg-[#1c1b1b] rounded-xl p-8 flex flex-col gap-6 shadow-ambient">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#0e0e0e] border border-[#3a4a44]/30 ${question.difficulty === 'Easy' ? 'text-jlearn-cyan' : question.difficulty === 'Medium' ? 'text-[#ffe253]' : 'text-[#ffb4ab]'}`}>
                {question.difficulty}
              </span>
              <span className="text-[#83958d] font-mono text-xs">ID: {question.id}</span>
            </div>
            <h1 className="text-4xl font-bold text-jlearn-primary tracking-tight">{question.title}</h1>
          </div>

          <div className="text-[#b9cbc3] leading-relaxed whitespace-pre-wrap">{question.problem_statement}</div>

          {(question.sample_input || question.sample_output) && (
            <div className="bg-[#0e0e0e] rounded-lg p-5 flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-widest text-[#83958d] font-bold">Sample I/O</h4>
              <div className="flex flex-col gap-2">
                {question.sample_input ? (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#83958d] font-bold">Input</span>
                    <pre className="font-mono text-sm text-[#b9cbc3] mt-1 whitespace-pre-wrap">{question.sample_input}</pre>
                  </div>
                ) : null}
                {question.sample_output ? (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#83958d] font-bold">Output</span>
                    <pre className="font-mono text-sm text-[#e5e2e1] mt-1 whitespace-pre-wrap">{question.sample_output}</pre>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div className="bg-[#0e0e0e] rounded-lg p-5">
            <h4 className="text-xs uppercase tracking-widest text-[#83958d] font-bold mb-3">Status</h4>
            <div className={`inline-flex items-center gap-2 text-sm font-bold ${question.status === 'Solved' ? 'text-jlearn-cyan' : 'text-[#83958d]'}`}>
              {question.status === 'Solved' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {question.status}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[60%] flex flex-col gap-4 h-full">
        <div className="flex-1 rounded-xl overflow-hidden bg-[#0e0e0e] border border-[#3a4a44]/30 flex flex-col shadow-ambient">
          <div className="h-12 bg-[#1c1b1b] border-b border-[#3a4a44]/30 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ffb4ab]/20" />
                <div className="w-3 h-3 rounded-full bg-[#ffe253]/20" />
                <div className="w-3 h-3 rounded-full bg-jlearn-cyan/20" />
              </div>
              <span className="ml-4 text-xs font-mono text-[#83958d]">Solution.java</span>
            </div>
            <span className="bg-[#00725c] text-[#adf0da] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">JDK 17</span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
                lineHeight: 24,
                renderLineHighlight: 'none',
                hideCursorInOverviewRuler: true,
                scrollbar: { vertical: 'hidden' },
              }}
            />
          </div>
        </div>

        <div className="h-[250px] shrink-0 bg-[#0e0e0e] rounded-xl border border-[#3a4a44]/30 flex flex-col shadow-ambient">
          <div className="h-12 bg-[#1c1b1b] border-b border-[#3a4a44]/30 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold uppercase tracking-widest text-jlearn-cyan relative">
                Terminal Output
                <span className="absolute -bottom-[15px] left-0 w-full h-[2px] bg-jlearn-cyan rounded-full" />
              </span>
              {execTime ? <span className="text-xs font-mono text-[#83958d]">Exec: {execTime}</span> : null}
            </div>

            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowStdin((value) => !value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${showStdin ? 'border-jlearn-cyan/50 text-jlearn-cyan bg-jlearn-cyan/10' : 'border-[#3a4a44]/30 text-[#83958d] hover:text-jlearn-primary hover:border-[#3a4a44]/60'}`}
              >
                stdin
              </button>
              <button
                onClick={handleRun}
                disabled={status === 'running'}
                className="btn-secondary px-4 py-1.5 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={14} /> Run Code
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === 'running'}
                className="btn-primary px-4 py-1.5 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} /> Submit
              </button>
              <div className="w-px h-5 bg-[#3a4a44]/40 mx-1" />
              <button
                onClick={() => prevQuestion && navigate(`/solve/${prevQuestion.id}`)}
                disabled={!prevQuestion}
                title="Previous problem"
                className="p-1.5 rounded-lg border border-[#3a4a44]/30 text-[#83958d] hover:text-jlearn-primary hover:border-[#3a4a44]/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => nextQuestion && navigate(`/solve/${nextQuestion.id}`)}
                disabled={!nextQuestion}
                title="Next problem"
                className="p-1.5 rounded-lg border border-[#3a4a44]/30 text-[#83958d] hover:text-jlearn-primary hover:border-[#3a4a44]/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {showStdin ? (
            <div className="border-b border-[#3a4a44]/30 px-6 py-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#83958d]">Custom stdin (for Run Code)</span>
              <textarea
                value={stdinInput}
                onChange={(event) => setStdinInput(event.target.value)}
                placeholder="Enter input here, one value per line..."
                rows={3}
                className="w-full bg-[#131313] border border-[#3a4a44]/30 rounded-lg px-3 py-2 text-xs font-mono text-[#e5e2e1] placeholder-[#3a4a44] focus:outline-none focus:border-jlearn-cyan/40 resize-none"
              />
            </div>
          ) : null}

          <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar text-[#b9cbc3]">
            {status === 'idle' ? <span className="text-[#3a4a44]">Waiting for execution...</span> : null}
            {status === 'running' ? <span className="animate-pulse text-[#b9cbc3]">{output}</span> : null}

            {testResults ? (
              <div className="mb-4 flex flex-col gap-4">
                <div className={`p-4 rounded-lg border flex items-center justify-between ${testResults.success ? 'bg-jlearn-cyan/5 border-jlearn-cyan/30' : 'bg-[#93000a]/5 border-[#93000a]/30'}`}>
                  <div className="flex items-center gap-3">
                    {testResults.success ? <CheckCircle2 size={20} className="text-jlearn-cyan" /> : <AlertCircle size={20} className="text-[#ffb4ab]" />}
                    <div>
                      <div className={`font-bold ${testResults.success ? 'text-jlearn-cyan' : 'text-[#ffb4ab]'}`}>
                        {testResults.success ? 'Accepted' : 'Failed'}
                      </div>
                      <div className="text-xs text-[#83958d]">
                        {testResults.passed} / {testResults.total} Test Cases Passed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#83958d] uppercase tracking-wider">Total Time</div>
                    <div className="text-lg font-bold text-jlearn-primary">{testResults.execution_time_ms}ms</div>
                  </div>
                </div>

                {testResults.details?.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {testResults.details.map((testCase) => (
                      <div key={testCase.case} className={`p-2 rounded border text-center transition-all ${testCase.status === 'passed' ? 'bg-jlearn-cyan/10 border-jlearn-cyan/20 text-jlearn-cyan' : 'bg-[#93000a]/10 border-[#93000a]/30 text-[#ffb4ab]'}`}>
                        <div className="text-[10px] uppercase font-bold opacity-60">Case {testCase.case}</div>
                        <div className="text-xs font-bold">{testCase.status === 'passed' ? 'PASS' : 'FAIL'}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {testResults.success ? (
                  <div className="flex items-center gap-3 mt-2">
                    {prevQuestion ? (
                      <button
                        onClick={() => navigate(`/solve/${prevQuestion.id}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3a4a44]/40 text-[#83958d] hover:text-jlearn-primary hover:border-[#3a4a44]/70 text-sm font-bold transition-all"
                      >
                        <ChevronLeft size={16} /> Prev Problem
                      </button>
                    ) : null}
                    <button
                      onClick={() => navigate(nextQuestion ? `/solve/${nextQuestion.id}` : `/topic/${question.topic_id}`)}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-jlearn-cyan text-[#0e0e0e] font-bold text-sm hover:bg-jlearn-cyan/90 transition-all shadow-[0_0_12px_rgba(0,255,209,0.3)]"
                    >
                      {nextQuestion ? 'Next Problem' : 'Back to Topic'} <ChevronRight size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {status === 'success' && !testResults ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-jlearn-cyan">
                  <CheckCircle2 size={16} /> <span className="font-bold">Execution Successful</span>
                </div>
                <pre className="mt-2 text-[#e5e2e1] whitespace-pre-wrap">{output}</pre>
              </div>
            ) : null}

            {status === 'error' && !testResults ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#ffb4ab]">
                  <AlertCircle size={16} /> <span className="font-bold">Execution Failed</span>
                </div>
                <pre className="mt-2 text-[#ffb4ab] whitespace-pre-wrap">{output}</pre>
              </div>
            ) : null}

            {!testResults && status !== 'running' && status !== 'idle' ? (
              <div className="mt-4 border-t border-[#3a4a44]/30 pt-4">
                <h4 className="text-[10px] uppercase font-bold text-[#83958d] mb-2">Captured Output</h4>
                <pre className="text-xs text-[#b9cbc3] whitespace-pre-wrap">{output}</pre>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
