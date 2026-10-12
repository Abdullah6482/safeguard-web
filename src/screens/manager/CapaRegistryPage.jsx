import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents';
import { supabase } from '../../lib/supabase';

const COLUMNS = [{ key:'pending', label:'Pending' }, { key:'in_progress', label:'In Progress' }, { key:'completed', label:'Completed' }];

export default function CapaRegistryPage() {
  const { incidents, loading, error, refresh } = useIncidents();
  const [saving, setSaving] = useState('');
  const [mutationError, setMutationError] = useState('');
  const navigate = useNavigate();
  const actions = useMemo(() => incidents.filter(i => i.capa_action), [incidents]);

  const move = async (incident, status) => {
    setSaving(incident.id);
    setMutationError('');
    const { error: updateError } = await supabase.rpc('transition_capa', {
      p_incident_id: incident.id,
      p_status: status,
      p_expected_updated_at: incident.updated_at,
    });
    setSaving('');
    if (updateError) setMutationError(updateError.message || 'CAPA status could not be changed.');
    else await refresh();
  };

  return <section className="page-shell">
    <div className="page-heading"><div><p className="eyebrow">CORRECTIVE ACTIONS</p><h1>CAPA Registry</h1><p>Track accountable actions, owners, due dates, and completion.</p></div></div>
    {(error || mutationError) && <div className="alert error" role="alert">{mutationError || error}</div>}
    <div className="kanban">{COLUMNS.map(column => {
      const cards=actions.filter(i => (i.capa_status || 'pending')===column.key);
      return <div className="kanban-column" key={column.key}>
        <div className="kanban-title"><span>{column.label}</span><b>{cards.length}</b></div>
        {loading ? <p className="muted">Loading…</p> : cards.map(i => {
          const overdue=i.capa_due_date && new Date(`${i.capa_due_date}T23:59:59`) < new Date() && column.key!=='completed';
          return <article className="capa-card" key={i.id}>
            <button className="link-title" onClick={()=>navigate(`/review/${i.id}`)}>{i.reference_number}</button>
            <p>{i.capa_action}</p>
            <div className="meta-row"><span>{i.capa_owner_profile?.full_name || 'Unassigned'}</span><span className={overdue?'danger':''}><CalendarClock size={13}/>{i.capa_due_date ? new Date(`${i.capa_due_date}T00:00:00`).toLocaleDateString():'No due date'}</span></div>
            {overdue && <div className="overdue"><AlertTriangle size={14}/>Overdue</div>}
            <select aria-label={`Status for ${i.reference_number}`} value={column.key} disabled={saving===i.id} onChange={e=>move(i,e.target.value)}><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select>
          </article>;
        })}
        {!loading&&!cards.length&&<div className="column-empty"><CheckCircle2 size={18}/>No actions</div>}
      </div>;
    })}</div>
  </section>;
}
