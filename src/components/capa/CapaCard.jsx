import React from 'react';

export default function CapaCard({ action, onClick }) {
  const priorityColors = {
    urgent: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-amber-500',
    low: 'border-l-teal-500',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-3.5 rounded-lg border border-slate-200 border-l-4 shadow-sm hover:shadow transition-shadow cursor-pointer ${
        priorityColors[action.priority] || 'border-l-slate-400'
      }`}
    >
      <h5 className="text-sm font-medium text-slate-900 mb-1">{action.title}</h5>
      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{action.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
        <span>Due: {action.dueDate || 'N/A'}</span>
        <span className="font-semibold">{action.assignedTo || 'Unassigned'}</span>
      </div>
    </div>
  );
}
