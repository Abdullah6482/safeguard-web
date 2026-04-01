import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, User, Calendar, MapPin, Target, ShieldAlert, Image, Clock, FileText, Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function ManagerReviewScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [managerNotes, setManagerNotes] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

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
    if (!selectedDecision && !decision) {
      setErrorMsg('Please select a decision option');
      return;
    }
    
    setSubmitting(true);
    const finalDecision = decision || selectedDecision;
    
    try {
      const updateData = {
        status: finalDecision === 'approve' ? 'closed' : 
               finalDecision === 'return' ? 'under_investigation' : 
               finalDecision === 'escalate' ? 'manager_review' : finalDecision,
        manager_notes: managerNotes,
        manager_decision: finalDecision,
        updated_at: new Date().toISOString(),
        closed_at: finalDecision === 'approve' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', id);

      if (error) {
        setErrorMsg('Failed to update incident. ' + error.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg('Unexpected error: ' + err.message);
    } finally {
      setSubmitting(false);
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
          <h2 style={{ fontSize: '24px', fontFamily: 'monospace', color: 'var(--amber)' }}>{incident.id}</h2>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>INCIDENT TYPE</p>
          <span className={`badge ${incident.incident_type?.toLowerCase() || 'medium'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
            {incident.incident_type || 'Unknown'}
          </span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>OVERALL RISK</p>
          <span className={`badge ${incident.overall_risk?.toLowerCase() || 'medium'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
            {incident.overall_risk || 'Unrated'} Risk
          </span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>REPORTED BY</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blue-dim)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
              {incident.reporter?.full_name?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{incident.reporter?.full_name || 'Unknown'}</div>
              <div className="text-sub" style={{ fontSize: '12px' }}>{incident.reporter?.job_title || 'Unknown'}</div>
            </div>
          </div>
        </div>

        {incident.investigator && (
          <div style={{ marginBottom: '32px' }}>
            <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>INVESTIGATED BY</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--amber-dim)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                {incident.investigator.full_name?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{incident.investigator.full_name}</div>
                <div className="text-sub" style={{ fontSize: '12px' }}>{incident.investigator.job_title}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>TIMELINE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} style={{ color: 'var(--sub)' }} />
              <span style={{ fontSize: '12px', color: 'var(--sub)' }}>
                Reported: {incident.created_at ? format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm') : 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} style={{ color: 'var(--sub)' }} />
              <span style={{ fontSize: '12px', color: 'var(--sub)' }}>
                Updated: {incident.updated_at ? format(new Date(incident.updated_at), 'MMM dd, yyyy HH:mm') : 'Unknown'}
              </span>
            </div>
          </div>
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
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{incident.reporter?.full_name || 'Unknown'}</div>
                      <div className="text-sub" style={{ fontSize: '12px' }}>{incident.reporter?.job_title || 'Unknown'}</div>
                    </div>
                 </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                 <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>DESCRIPTION</p>
                 <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                   {incident.description || 'No description provided'}
                 </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>LOCATION</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} style={{ color: 'var(--sub)' }} />
                  <span style={{ fontSize: '14px', color: 'var(--text)' }}>
                    {incident.location_label || 'No location specified'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>WORK ACTIVITY</p>
                <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                  {incident.work_activity || 'Not specified'}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>IMMEDIATE ACTION</p>
                <div style={{ backgroundColor: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--green)' }}>
                    {incident.immediate_action || 'No immediate action recorded'}
                  </p>
                </div>
              </div>

              {incident.photo_url && (
                <div style={{ marginBottom: '24px' }}>
                  <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>PHOTO EVIDENCE</p>
                  <div 
                    style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--surface)', cursor: 'pointer', position: 'relative' }}
                    onClick={() => setIsPhotoModalOpen(true)}
                  >
                    <img 
                      src={incident.photo_url} 
                      alt="Incident photo" 
                      style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       View Full
                    </div>
                    <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--sub)', fontSize: '14px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <Image size={24} style={{ marginBottom: '8px' }} />
                        <p>Photo unavailable</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>WITNESSES</p>
                <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                  {incident.witnesses || 'No witnesses recorded'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Phase B Investigation */}
          <div>
            <h2 style={{ fontSize: '14px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> Phase B: Investigation Findings
            </h2>

            <div className="glass-panel" style={{ padding: '32px', backgroundColor: 'var(--panel)', borderColor: 'var(--blue-dim)' }}>
              
              {incident.investigator && (
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs text-sub" style={{ marginBottom: '6px' }}>INVESTIGATED BY</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>{incident.investigator.full_name}</p>
                      <p className="text-sub" style={{ fontSize: '12px' }}>{incident.investigator.job_title}</p>
                    </div>
                  </div>
                </div>
              )}

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
                  <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
                    {incident.root_cause_category || 'No root cause category specified'}
                  </p>
                  <p className="text-sub" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    {incident.root_cause_detail || 'No detailed root cause analysis provided'}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>CORRECTIVE ACTION (CAPA)</p>
                <div style={{ backgroundColor: 'var(--blue-dim)', border: '1px solid var(--blue-dim)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '12px' }}>
                    {incident.capa_action || 'No corrective action specified'}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <div>
                      <span className="text-sub">Owner:</span> 
                      <span style={{ marginLeft: '4px', color: 'var(--text)' }}>
                        {incident.capa_owner_profile?.full_name || incident.capa_owner || 'Not assigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sub">Due:</span> 
                      <span style={{ marginLeft: '4px', color: 'var(--text)' }}>
                        {incident.capa_due_date ? new Date(incident.capa_due_date).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {incident.investigator_notes && (
                <div>
                  <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>INVESTIGATOR NOTES</p>
                  <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px' }}>
                    <p className="text-sub" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                      {incident.investigator_notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manager Decision Section */}
        {incident.status === 'manager_review' && (
          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} /> Manager Review & Decision
            </h2>
            
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ marginBottom: '32px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '12px' }}>DECISION OPTIONS</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <button 
                    className={`btn ${selectedDecision === 'approve' ? 'btn-success' : 'btn-ghost'}`}
                    style={{ 
                      flexDirection: 'column', 
                      padding: '20px', 
                      border: selectedDecision === 'approve' ? '2px solid var(--green)' : '1px solid var(--border)',
                      backgroundColor: selectedDecision === 'approve' ? 'var(--green-dim)' : 'var(--surface)'
                    }}
                    onClick={() => setSelectedDecision('approve')}
                  >
                    <CheckCircle2 size={24} style={{ marginBottom: '8px', color: 'var(--green)' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Approve & Close</span>
                    <span className="text-sub" style={{ fontSize: '11px', marginTop: '4px' }}>CAPA adequate - resolve incident</span>
                  </button>

                  <button 
                    className={`btn ${selectedDecision === 'return' ? 'btn-warning' : 'btn-ghost'}`}
                    style={{ 
                      flexDirection: 'column', 
                      padding: '20px', 
                      border: selectedDecision === 'return' ? '2px solid var(--amber)' : '1px solid var(--border)',
                      backgroundColor: selectedDecision === 'return' ? 'var(--amber-dim)' : 'var(--surface)'
                    }}
                    onClick={() => setSelectedDecision('return')}
                  >
                    <ArrowLeft size={24} style={{ marginBottom: '8px', color: 'var(--amber)' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Return</span>
                    <span className="text-sub" style={{ fontSize: '11px', marginTop: '4px' }}>Send back for more investigation</span>
                  </button>

                  <button 
                    className={`btn ${selectedDecision === 'escalate' ? 'btn-danger' : 'btn-ghost'}`}
                    style={{ 
                      flexDirection: 'column', 
                      padding: '20px', 
                      border: selectedDecision === 'escalate' ? '2px solid var(--red)' : '1px solid var(--border)',
                      backgroundColor: selectedDecision === 'escalate' ? 'var(--red-dim)' : 'var(--surface)'
                    }}
                    onClick={() => setSelectedDecision('escalate')}
                  >
                    <AlertTriangle size={24} style={{ marginBottom: '8px', color: 'var(--red)' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Escalate</span>
                    <span className="text-sub" style={{ fontSize: '11px', marginTop: '4px' }}>Requires executive review</span>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p className="text-xs text-sub" style={{ marginBottom: '8px' }}>MANAGER NOTES</p>
                <textarea 
                  className="input" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Add your review notes, rationale for decision, or additional requirements..."
                  value={managerNotes}
                  onChange={e => setManagerNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  className="btn btn-success" 
                  onClick={() => handleDecision()}
                  disabled={!selectedDecision || submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Processing...' : `Submit Decision - ${selectedDecision === 'approve' ? 'Close Incident' : selectedDecision === 'return' ? 'Return to Investigator' : 'Escalate'}`}
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Full Screen Photo Modal */}
      {isPhotoModalOpen && incident?.photo_url && (
        <div 
          onClick={() => setIsPhotoModalOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <img 
            src={incident.photo_url} 
            alt="Full size evidence" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            style={{ position: 'absolute', top: '20px', right: '20px', color: '#fff', backgroundColor: 'var(--surface)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            onClick={() => setIsPhotoModalOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
