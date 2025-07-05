import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import api from '../utils/api.js';
import { useAppContext } from '../contexts/AppContext.jsx';

/**
 * Monaco-based editor with controls for running and submitting code. The
 * component manages its own code state starting from the provided
 * `starterCode`.  Console output from the backend is displayed in a panel below
 * the editor.
 */
function CodeEditor({ starterCode = '', tests = [], onResults, challengeId }) {
  const [code, setCode] = useState(starterCode);
  const [consoleOut, setConsoleOut] = useState('');
  const [loading, setLoading] = useState(false);
  const { progress, setProgress, history, setHistory, streak, setStreak } =
    useAppContext();

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/execute', { code });
      setConsoleOut(res.data.output ?? '');
    } catch (err) {
      setConsoleOut('Execution failed');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/submit', { code, tests });
      setConsoleOut(JSON.stringify(res.data, null, 2));
      if (onResults) onResults(res.data);
      if (challengeId && res.data?.score === 100) {
        setProgress({ ...progress, [challengeId]: true });
        const now = Date.now();
        setHistory([...history, { id: challengeId, date: now }]);
        const last = history[history.length - 1]?.date;
        if (last) {
          const diffDays = Math.floor((now - last) / 86400000);
          if (diffDays === 1) setStreak(streak + 1);
          else if (diffDays > 1) setStreak(1);
        } else {
          setStreak(1);
        }
      }
    } catch (err) {
      setConsoleOut('Submission failed');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setCode(starterCode);
    setConsoleOut('');
  };

  return (
    <div className="space-y-2">
      <Editor
        height="70vh"
        defaultLanguage="java"
        value={code}
        onChange={(val) => setCode(val)}
        theme="vs-dark"
      />

      <div className="flex space-x-2">
        <button
          className="px-3 py-1 rounded bg-accent-blue text-white"
          onClick={handleRun}
          disabled={loading}
        >
          Run
        </button>
        <button
          className="px-3 py-1 rounded bg-accent-green text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          Submit
        </button>
        <button
          className="px-3 py-1 rounded bg-border-muted text-white"
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </button>
      </div>

      <pre className="bg-bg-secondary text-text-primary p-2 h-32 overflow-auto border border-border-default rounded">
        {consoleOut}
      </pre>
    </div>
  );
}

export default CodeEditor;
