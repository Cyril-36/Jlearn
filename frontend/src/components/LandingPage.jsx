import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api.js';
import ChallengeCard from './ChallengeCard.jsx';
import FilterSidebar from './FilterSidebar.jsx';
import ProgressTracker from './ProgressTracker.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';

function filterChallenges(items, filters, search, progress) {
  let res = items;
  if (filters.difficulty) {
    res = res.filter(
      (c) => c.difficulty && c.difficulty.toLowerCase() === filters.difficulty
    );
  }

  if (filters.status && filters.status !== 'all') {
    const completed = Object.keys(progress || {});
    res = res.filter((c) =>
      filters.status === 'completed'
        ? completed.includes(c.id)
        : !completed.includes(c.id)
    );
  }

  if (search) {
    const term = search.toLowerCase();
    res = res.filter((c) => c.title.toLowerCase().includes(term));
  }
  return res;
}

function LandingPage() {
  const { progress } = useAppContext();
  const [challenges, setChallenges] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', difficulty: '' });
  const [search, setSearch] = useState('');
  const [displayed, setDisplayed] = useState([]);
  const searchTimeout = useRef();

  useEffect(() => {
    api
      .get('/api/challenges')
      .then((res) => {
        setChallenges(res.data);
        setDisplayed(res.data);
      })
      .catch(() => {
        setChallenges([]);
      });
  }, []);

  useEffect(() => {
    setDisplayed(filterChallenges(challenges, filters, search, progress));
  }, [challenges, filters, search, progress]);

  const onSearchChange = (e) => {
    const term = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(term), 300);
  };

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary">
      <main className="flex-1 p-6 space-y-4">
        <h1 className="text-4xl font-bold mb-2">CodeArena</h1>
        <input
          type="text"
          placeholder="Search challenges..."
          className="w-full p-2 rounded bg-bg-secondary text-text-primary"
          onChange={onSearchChange}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((ch) => (
            <ChallengeCard key={ch.id} challenge={ch} />
          ))}
        </div>
      </main>
      <aside className="w-72 p-4 space-y-4 border-l border-border-default">
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <ProgressTracker total={challenges.length} />
      </aside>
    </div>
  );
}

export default LandingPage;
