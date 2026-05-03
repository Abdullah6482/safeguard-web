import React from 'react';

export default function CapaKanbanBoard({ columns = {}, onMoveCard, renderCard }) {
  const columnTitles = {
    pending: 'Pending',
    in_progress: 'In Progress',
    review: 'Under Review',
    completed: 'Completed',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Object.keys(columnTitles).map(status => (
        <div key={status} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-800">{columnTitles[status]}</h4>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {(columns[status] || []).length}
            </span>
          </div>
          <div className="space-y-3">
            {(columns[status] || []).map(item => (renderCard ? renderCard(item) : null))}
          </div>
        </div>
      ))}
    </div>
  );
}
