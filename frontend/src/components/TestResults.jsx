import React from 'react';

function TestResults({ results = [] }) {
  if (!results.length) return null;

  return (
    <div className="bg-bg-secondary text-text-primary p-4 rounded border border-border-default">
      <h3 className="text-lg font-semibold mb-2">Results</h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left px-2">#</th>
            <th className="text-left px-2">Verdict</th>
            <th className="text-right px-2">Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr
              key={idx}
              className={
                r.verdict === 'Pass' ? 'text-accent-green' : 'text-accent-red'
              }
            >
              <td className="border-t border-border-default px-2 py-1">
                {idx + 1}
              </td>
              <td className="border-t border-border-default px-2 py-1">
                {r.verdict}
              </td>
              <td className="border-t border-border-default px-2 py-1 text-right">
                {r.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TestResults;
