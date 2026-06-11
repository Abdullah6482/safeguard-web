import React from 'react';
import { Facilities } from '../../constants/facilities';

export default function SiteSelector({ currentSiteId, onSelectSite }) {
  return (
    <select
      value={currentSiteId || 'all'}
      onChange={e => onSelectSite(e.target.value)}
      className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
    >
      <option value="all">All Facilities</option>
      {Facilities.map(f => (
        <option key={f.id} value={f.id}>{f.name}</option>
      ))}
    </select>
  );
}
