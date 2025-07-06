import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = ({ challengeId }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchBoard = async () => {
      const { data } = await axios.get(`/api/leaderboard/${challengeId}`);
      setRows(data);
    };
    fetchBoard();
    const id = setInterval(fetchBoard, 15000);
    return () => clearInterval(id);
  }, [challengeId]);

  return (
    <div className="bg-zinc-800 rounded p-3 h-60 overflow-auto">
      <h3 className="font-semibold mb-2">🏆 Leaderboard</h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">#</th>
            <th>Time (ms)</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.execTimeMs}</td>
              <td>{new Date(r.createdAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
