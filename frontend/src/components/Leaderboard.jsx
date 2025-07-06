import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = ({ challengeId }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/leaderboard/${challengeId}`)
      .then((res) => {
        // Ensure it's always an array
        setRows(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard:", err);
        setRows([]); // fallback to empty array on error
      });
  }, [challengeId]);

  return (
    <div className="bg-zinc-800 rounded p-3 overflow-auto">
      <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-400">No data available.</p>
      ) : (
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th className="py-1 px-2">Rank</th>
              <th className="py-1 px-2">Name</th>
              <th className="py-1 px-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-zinc-700">
                <td className="py-1 px-2">{index + 1}</td>
                <td className="py-1 px-2">{row.name || "Anonymous"}</td>
                <td className="py-1 px-2">{row.score ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
