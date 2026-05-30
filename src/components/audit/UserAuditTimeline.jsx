import React from 'react';

export default function UserAuditTimeline({ logs = [] }) {
  return (
    <div className="space-y-4">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-3 text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1.5" />
          <div>
            <p className="font-medium text-slate-800">{log.action}</p>
            <p className="text-xs text-slate-500">{log.userId} • {new Date(log.timestamp).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
