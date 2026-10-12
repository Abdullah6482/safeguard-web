import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents';

const PAGE_SIZE = 12;

export default function IncidentsPage() {
  const { incidents, loading, error, refresh } = useIncidents();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const search = params.get('q') || '';
  const status = params.get('status') || 'all';
  const risk = params.get('risk') || 'all';

  const filtered = useMemo(() => incidents.filter(incident => {
    const haystack = [incident.reference_number, incident.description, incident.location_label,
      incident.reporter?.full_name, incident.reporter?.department].filter(Boolean).join(' ').toLowerCase();
    return (!search || haystack.includes(search.toLowerCase()))
      && (status === 'all' || (status === 'escalated' ? incident.escalation_status === 'open' : incident.status === status))
      && (risk === 'all' || incident.overall_risk === risk);
  }), [incidents, risk, search, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE);
  const setFilter = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); setPage(1); };

  return <section className="page-shell">
    <div className="page-heading"><div><p className="eyebrow">OPERATIONS</p><h1>Incident Registry</h1><p>Search, filter, and review the complete incident lifecycle.</p></div>
      <button className="btn btn-ghost" onClick={refresh}><RefreshCw size={16}/> Refresh</button></div>
    <div className="filter-bar">
      <label className="search-field"><Search size={16}/><span className="sr-only">Search incidents</span><input value={search} onChange={e => setFilter('q', e.target.value)} placeholder="Reference, reporter, location…"/></label>
      <select aria-label="Filter by status" value={status} onChange={e => setFilter('status', e.target.value)}><option value="all">All statuses</option><option value="reported">Reported</option><option value="under_investigation">Under investigation</option><option value="manager_review">Manager review</option><option value="escalated">Escalated</option><option value="closed">Closed</option></select>
      <select aria-label="Filter by risk" value={risk} onChange={e => setFilter('risk', e.target.value)}><option value="all">All risks</option><option>High</option><option>Medium</option><option>Low</option></select>
    </div>
    {error && <div className="alert error" role="alert">{error}</div>}
    <div className="data-panel"><div className="table-scroll"><table className="dash-table"><thead><tr><th>Reference</th><th>Reporter</th><th>Type</th><th>Status</th><th>Risk</th><th>Location</th><th>Reported</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan="7" className="empty-cell">Loading incidents…</td></tr> : rows.map(i => <tr key={i.id} className="clickable-row" onClick={() => navigate(`/review/${i.id}`)}><td className="ref-link">{i.reference_number}</td><td>{i.reporter?.full_name || 'Unknown'}<small>{i.reporter?.department || ''}</small></td><td>{i.incident_type}</td><td><span className={`status-chip ${i.escalation_status === 'open' ? 'escalated' : i.status}`}>{i.escalation_status === 'open' ? 'escalated' : i.status.replaceAll('_',' ')}</span></td><td><span className={`risk-chip ${(i.overall_risk || 'unrated').toLowerCase()}`}>{i.overall_risk || 'Unrated'}</span></td><td>{i.location_label || '—'}</td><td>{new Date(i.incident_at || i.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>
      {!loading && !rows.length && <div className="empty-state">No incidents match these filters.</div>}
      <div className="pagination"><span>{filtered.length} results</span><div><button aria-label="Previous page" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={16}/></button><span>Page {Math.min(page,pages)} of {pages}</span><button aria-label="Next page" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={16}/></button></div></div>
    </div>
  </section>;
}
