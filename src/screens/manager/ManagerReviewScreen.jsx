import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, User, Calendar, MapPin, Target, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function ManagerReviewScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchIncidentDetail();
  }, [id]);

  async function fetchIncidentDetail() {
    try {
      // Fetch incident + join profiles explicitly using the column names as relationship hints
      const { data: inc, error } = await supabase
        .from('incidents')
        .select(`
          *,
          reporter:profiles!reporter_id ( full_name, job_title ),
          investigator:profiles!investigator_id ( full_name, job_title ),
          capa_owner_profile:profiles!capa_owner ( full_name, job_title )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Supabase Error:", error);
        setErrorMsg('Failed to load incident detail. ' + error.message);
      } else {
        setIncident(inc);
      }
    } catch (err) {
      console.error("Crash during fetch:", err);
      setErrorMsg('Unexpected error while fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(decision) {
    // decision: 'closed' | 'in_progress' (rejected back to investigator)
    setSubmitting(true);
    const { error } = await supabase
      .from('incidents')
      .update({
        status: decision,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    setSubmitting(false);
    if (error) {
      setErrorMsg('Failed to update incident. ' + error.message);
    } else {
      navigate('/');
    }
  }

  if (loading) return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="loader"></div>
    </div>
  );

  if (!incident) return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
        <h2 style={{ color: 'var(--red)', marginBottom: '10px' }}>Error Loading Data</h2>
        <p className="text-sub" style={{ marginBottom: '20px', fontSize: '14px', wordBreak: 'break-word' }}>{errorMsg || 'Incident not found'}</p>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Go Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Sidebar - Quick Info */}
      <aside className="sidebar" style={{ width: '320px', padding: '32px 24px' }}>
        <button className="btn btn-ghost" style={{ padding: '8px', marginBottom: '32px' }} onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div style={{ marginBottom: '32px' }}>
          <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>REFERENCE NUMBER</p>
          <h2 style={{ fontSize: '24px', fontFamily: 'monospace', color: 'var(--amber)' }}>{incident.reference_number}</h2>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>OVERALL RISK</p>
          <span className={`badge ${incident.overall_risk?.toLowerCase() || 'medium'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
            {incident.overall_risk || 'Unrated'} Risk
          </span>
        </div>

        {incident.status === 'manager_review' && (
          <div className="glass-panel" style={{ padding: '24px', marginTop: 'auto', backgroundColor: 'var(--surface)', border: '1px solid var(--amber-dim)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text)' }}>Manager Decision</h3>
            <p className="text-sub" style={{ fontSize: '12px', marginBottom: '20px', lineHeight: '1.5' }}>
              Review the detailed Phase A and Phase B reports. If the CAPA is adequate, approve and close the incident.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-success" 
                onClick={() => handleDecision('closed')} 
                disabled={submitting}
              >
                <CheckCircle2 size={16} /> Approve & Close
              </button>
              <button 
                className="btn btn-ghost" 
                style={{ color: 'var(--red)', borderColor: 'var(--border)' }}
                onClick={() => handleDecision('in_progress')} 
                disabled={submitting}
              >
                <XCircle size={16} /> Reject (Needs Work)
              </button>
            </div>
          </div>
        )}
        
        {incident.status === 'closed' && (
          <div className="glass-panel" style={{ padding: '24px', marginTop: 'auto', backgroundColor: 'var(--green-dim)', border: '1px solid var(--green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green)' }}>
              <CheckCircle2 size={20} />
              <h3 style={{ fontSize: '15px' }}>Incident Closed</h3>
            </div>
            <p className="text-sub" style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(255,255,255,0.7)' }}>
              This incident has been verified and permanently closed by management.
            </p>
          </div>
        )}
      </aside>

      {/* Main Content Area - Split View */}
      <main className="main-content" style={{ padding: '40px 60px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>{incident.incident_title}</h1>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div className="badge" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <AlertTriangle size={14} color="var(--amber)" /> {incident.incident_type}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--sub)', fontSize: '13px' }}>
              <Calendar size={14} /> Reported {incident.created_at ? format(new Date(incident.created_at), 'PPP') : 'Unknown Date'}
            </div>
          </div>
        </header>

        {errorMsg && (
          <div style={{ backgroundColor: 'var(--red-dim)', color: 'var(--red)', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', border: '1px solid var(--red-dim)' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Left Column - Phase A Report */}
          <div>
            <h2 style={{ fontSize: '14px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} /> Phase A: Initial Report
            </h2>
            
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                 <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>REPORTED BY</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>{incident.reporter?.full_name}</p>
                      <p className="text-sub" style={{ fontSize: '12px' }}>{incident.reporter?.job_title}</p>
                    </div>
                 </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>LOCATION</p>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <MapPin size={14} style={{ display: 'inline', color: 'var(--cyan)', marginRight: '4px', position: 'relative', top: '2px' }} />
                  {incident.location_label || 'Location not provided'}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>INCIDENT DESCRIPTION</p>
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                  {incident.description}
                </div>
              </div>

              {incident.witnesses && (
                <div style={{ marginBottom: '24px' }}>
                  <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>WITNESSES</p>
                  <p style={{ fontSize: '14px' }}>{incident.witnesses}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>IMMEDIATE ACTION TAKEN</p>
                <div style={{ borderLeft: '3px solid var(--amber)', paddingLeft: '16px', fontSize: '14px', lineHeight: '1.6', color: 'var(--sub)' }}>
                  {incident.immediate_action || 'None reported.'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Phase B Investigation */}
          <div>
            <h2 style={{ fontSize: '14px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> Phase B: Investigation Findings
            </h2>

            <div className="glass-panel" style={{ padding: '32px', backgroundColor: 'var(--panel)', borderColor: 'var(--blue-dim)' }}>
              
              <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                 <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>INVESTIGATED BY</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>{incident.investigator?.full_name}</p>
                      <p className="text-sub" style={{ fontSize: '12px' }}>{incident.investigator?.job_title}</p>
                    </div>
                 </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '12px' }}>4-PILLAR RISK ASSESSMENT</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {['People', 'Asset', 'Environment', 'Reputation'].map(pillar => {
                    const val = incident[`pillar_${pillar.toLowerCase()}`] || 'Low';
                    return (
                      <div key={pillar} style={{ backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--sub)' }}>{pillar}</span>
                        <span className={`badge ${val.toLowerCase()}`} style={{ fontSize: '11px', padding: '2px 8px' }}>{val}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>ROOT CAUSE ANALYSIS</p>
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: '700', marginBottom: '8px' }}>{incident.root_cause_category}</p>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>{incident.root_cause_detail}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-sub" style={{ marginBottom: '12px', color: 'var(--cyan)' }}>CORRECTIVE & PREVENTIVE ACTION (CAPA)</p>
                <div style={{ border: '1px solid var(--cyan)', backgroundColor: 'rgba(6, 182, 212, 0.05)', padding: '20px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>
                    {incident.capa_action}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(6, 182, 212, 0.2)', paddingTop: '16px' }}>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--cyan)', marginBottom: '4px' }}>ASSIGNED TO</p>
                      <p style={{ fontSize: '13px', fontWeight: '600' }}>
                        {incident.capa_owner_profile?.full_name || 'Unknown'} <span style={{ fontWeight: '400', color: 'var(--sub)' }}>({incident.capa_owner_profile?.job_title || 'Staff'})</span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="text-xs" style={{ color: 'var(--red)', marginBottom: '4px' }}>DUE DATE</p>
                      <p style={{ fontSize: '13px', fontWeight: '600' }}>{incident.capa_due_date || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {incident.investigator_notes && (
                 <div style={{ marginTop: '32px' }}>
                    <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>INVESTIGATOR NOTES</p>
                    <p style={{ fontSize: '13px', color: 'var(--sub)', fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{incident.investigator_notes}"
                    </p>
                 </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
