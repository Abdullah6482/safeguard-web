import React from 'react';

export default function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded-lg w-full" />
      ))}
    </div>
  );
}
