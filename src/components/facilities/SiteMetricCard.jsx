import React from 'react';

export default function SiteMetricCard({ siteName, incidents, safeDays }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <h5 className="text-sm font-semibold text-slate-800 mb-2">{siteName}</h5>
      <div className="flex justify-between items-center text-xs text-slate-600">
        <span>Incidents: <strong className="text-slate-900">{incidents}</strong></span>
        <span>Safe Days: <strong className="text-emerald-600 font-bold">{safeDays}</strong></span>
      </div>
    </div>
  );
}
