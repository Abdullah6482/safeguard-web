import React from 'react';

export default function ColumnPickerDropdown({ columns = [], selectedKeys = [], onToggleKey }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
      <h5 className="text-xs font-bold text-slate-700 uppercase">Export Columns</h5>
      {columns.map(col => {
        const isChecked = selectedKeys.includes(col.key);
        return (
          <label key={col.key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggleKey && onToggleKey(col.key)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            {col.label}
          </label>
        );
      })}
    </div>
  );
}
