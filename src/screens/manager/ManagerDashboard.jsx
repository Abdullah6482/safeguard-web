import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, LogOut, Search, Clock, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ManagerDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('manager_review'); // 'manager_review' | 'closed'
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    // Get user profile
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', session.user.id)
      .single();

    if (userData?.role !== 'manager') {
      await supabase.auth.signOut();
      navigate('/login');
      return;
    }

    setProfile(userData);
    fetchIncidents();
  }

  async function fetchIncidents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('incidents')
      .select('*, profiles:reporter_id(full_name)')
      .in('status', ['manager_review', 'closed'])
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setIncidents(data);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const filteredIncidents = incidents.filter(inc => {
    if (inc.status !== filter) return false;
    if (search && !inc.reference_number?.toLowerCase().includes(search.toLowerCase()) && !inc.incident_title?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendingCount = incidents.filter(i => i.status === 'manager_review').length;
  const closedCount = incidents.filter(i => i.status === 'closed').length;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--amber-dim)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', color: 'var(--text)', margin: 0 }}>SafeGuard</h2>
            <p className="text-xs text-sub" style={{ marginTop: '2px' }}>Manager Portal</p>
          </div>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p className="text-xs text-sub" style={{ marginBottom: '4px' }}>LOGGED IN AS</p>
            <p style={{ fontSize: '14px', fontWeight: '600' }}>{profile?.full_name || 'Loading...'}</p>
            <p className="text-sub" style={{ fontSize: '12px', marginTop: '4px' }}>HSE Manager</p>
          </div>
          
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className={`btn btn-ghost ${filter === 'manager_review' ? 'active-tab' : ''}`}
              style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: filter === 'manager_review' ? 'var(--panel-hover)' : 'transparent', color: filter === 'manager_review' ? 'var(--amber)' : 'var(--sub)' }}
              onClick={() => setFilter('manager_review')}
            >
              <Clock size={16} /> Pending Review <span className="badge" style={{ marginLeft: 'auto', backgroundColor: filter === 'manager_review' ? 'var(--amber)' : 'var(--surface)', color: filter === 'manager_review' ? '#000' : 'var(--sub)' }}>{pendingCount}</span>
            </button>
            <button 
              className={`btn btn-ghost ${filter === 'closed' ? 'active-tab' : ''}`}
              style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: filter === 'closed' ? 'var(--panel-hover)' : 'transparent', color: filter === 'closed' ? 'var(--green)' : 'var(--sub)' }}
              onClick={() => setFilter('closed')}
            >
              <CheckCircle2 size={16} /> Closed Incidents <span className="badge" style={{ marginLeft: 'auto', backgroundColor: filter === 'closed' ? 'var(--green)' : 'var(--surface)', color: filter === 'closed' ? '#fff' : 'var(--sub)' }}>{closedCount}</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost" style={{ width: '100%', border: 'none' }} onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
              {filter === 'manager_review' ? 'Pending Incident Reviews' : 'Closed Incidents'}
            </h1>
            <p className="text-sub" style={{ fontSize: '14px' }}>
              {filter === 'manager_review' ? 'Review Phase B actions and approve to close.' : 'Historical log of all successfully closed incidents.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--sub)' }} />
              <input 
                className="input" 
                placeholder="Search by ID or Title..." 
                style={{ paddingLeft: '40px' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost" onClick={fetchIncidents}>
              <Filter size={16} /> Refresh
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--sub)', letterSpacing: '0.05em', width: '120px' }}>REF ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--sub)', letterSpacing: '0.05em' }}>INCIDENT</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--sub)', letterSpacing: '0.05em', width: '180px' }}>REPORTER</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--sub)', letterSpacing: '0.05em', width: '140px' }}>OVERALL RISK</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--sub)', letterSpacing: '0.05em', width: '150px' }}>UPDATED</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--sub)', letterSpacing: '0.05em', width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>
                      No {filter === 'manager_review' ? 'pending' : 'closed'} incidents found.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map(inc => (
                    <tr 
                      key={inc.id} 
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--panel-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => navigate(`/review/${inc.id}`)}
                    >
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--sub)' }}>{inc.reference_number}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{inc.incident_title || 'Untitled Incident'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--sub)' }}>
                           <AlertTriangle size={12} style={{ display: 'inline', position: 'relative', top: '2px', marginRight: '4px', color: inc.immediate_action_taken ? 'var(--green)' : 'var(--amber)' }} />
                           {inc.incident_type}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--sub)' }}>
                        {inc.profiles?.full_name || 'Unknown User'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className={`badge ${inc.overall_risk?.toLowerCase() || 'medium'}`}>
                          {inc.overall_risk || 'Unrated'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--sub)' }}>
                        {formatDistanceToNow(new Date(inc.updated_at), { addSuffix: true })}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
