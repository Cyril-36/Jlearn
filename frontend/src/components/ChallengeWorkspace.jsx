import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api.js';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './TestResults.jsx';

function ChallengeWorkspace() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [showEditorial, setShowEditorial] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api
      .get(`/api/challenge/${id}`)
      .then((res) => setChallenge(res.data))
      .catch(() => setChallenge(null));
  }, [id]);

  if (!challenge) {
    return (
      <div className="p-4 text-text-primary">Loading challenge...</div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary">
      <section className="w-2/5 p-4 space-y-4 border-r border-border-default overflow-y-auto">
        <h2 className="text-2xl font-bold">{challenge.title}</h2>
        <p className="whitespace-pre-wrap text-text-secondary">
          {challenge.description}
        </p>
        <button
          className="px-2 py-1 rounded bg-border-muted text-white"
          onClick={() => setShowEditorial(!showEditorial)}
        >
          {showEditorial ? 'Hide' : 'Show'} Editorial
        </button>
        {showEditorial && (
          <pre className="whitespace-pre-wrap bg-bg-secondary p-2 rounded border border-border-default overflow-auto">
            {challenge.solution || 'No editorial available.'}
          </pre>
        )}
      </section>
      <section className="w-3/5 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-end space-x-2">
          <label className="text-sm">Language:</label>
          <select className="bg-bg-secondary p-1 rounded text-sm">
            <option>Java 17</option>
          </select>
        </div>
        <CodeEditor
          starterCode={challenge.starterCode}
          tests={challenge.tests}
          challengeId={challenge.id}
          onResults={(r) => setResults(r.results)}
        />
        <TestResults results={results} />
      </section>
    </div>
  );
}

export default ChallengeWorkspace;
