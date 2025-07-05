import React from 'react';

function Field({ label, children }) {
  return (
    <label className="block mb-4 text-sm">
      <span className="block mb-1 font-semibold">{label}</span>
      {children}
    </label>
  );
}

function FilterSidebar({ filters, setFilters }) {
  return (
    <aside className="bg-bg-secondary text-text-primary p-4 border border-border-default rounded">
      <h3 className="text-lg font-semibold mb-2">Filters</h3>
      <Field label="Status">
        <select
          className="w-full p-1 rounded bg-bg-tertiary"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="unattempted">Unattempted</option>
        </select>
      </Field>
      <Field label="Difficulty">
        <select
          className="w-full p-1 rounded bg-bg-tertiary"
          value={filters.difficulty}
          onChange={(e) =>
            setFilters({ ...filters, difficulty: e.target.value.toLowerCase() })
          }
        >
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </Field>
      {/* TODO: skills, topics, units */}
    </aside>
  );
}

export default FilterSidebar;
