import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search reports...', onClear }) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      {value ? (
        <button onClick={onClear} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
