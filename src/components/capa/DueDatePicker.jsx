import React from 'react';

export default function DueDatePicker({ value, onChange }) {
  const isOverdue = value && new Date(value) < new Date();

  return (
    <div>
      <input
        type="date"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          isOverdue ? 'border-red-400 bg-red-50 text-red-900' : 'border-slate-200 bg-white'
        }`}
      />
      {isOverdue ? <p className="text-xs text-red-600 mt-1 font-medium">Action item is overdue</p> : null}
    </div>
  );
}
