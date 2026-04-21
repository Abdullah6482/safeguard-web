import React from 'react';

export default function FilterToolbar({ currentStatus, onStatusChange, currentCategory, onCategoryChange }) {
  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'closed', label: 'Closed' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {statuses.map(st => (
        <button
          key={st.id}
          onClick={() => onStatusChange(st.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            currentStatus === st.id
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {st.label}
        </button>
      ))}
    </div>
  );
}
