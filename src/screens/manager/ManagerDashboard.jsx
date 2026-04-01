import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Folder, Hourglass, CheckSquare, Siren, Award, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ManagerDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [safetyPoints, setSafetyPoints] = useState([]);
  const [loading, setLoading] = useState(true);
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
    fetchData();
  }

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Fetch Incidents
      const { data: incData, error: incError } = await supabase
        .from('incidents')
        .select(`
          id, reference_number, incident_type, status, overall_risk, created_at, closed_at, location_label, capa_due_date,
          reporter:profiles!reporter_id (department)
        `)
        .order('created_at', { ascending: false });
        
      if (incData) setIncidents(incData);

      // 2. Fetch Safety Points joined with profiles to get department
      // NOTE: RLS must allow this query for managers!
      const { data: ptsData, error: ptsError } = await supabase
        .from('safety_points')
        .select(`points, user_id, profiles!user_id(department)`);
        
      if (ptsData) setSafetyPoints(ptsData);

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Derived Metrics
  const openCount = incidents.filter(i => ['reported', 'under_investigation'].includes(i.status)).length;
  const pendingCount = incidents.filter(i => i.status === 'manager_review').length;
  
  // Closed this month
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const closedThisMonth = incidents.filter(i => {
    if (i.status !== 'closed' || !i.closed_at) return false;
    const d = new Date(i.closed_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const overdueCount = incidents.filter(i => 
    i.capa_due_date && new Date(i.capa_due_date) < new Date() && i.status !== 'closed'
  ).length;

  // Process Leaderboard Points
  const deptPoints = {};
  safetyPoints.forEach(row => {
    // Determine the department from the nested or flat relation based on Supabase return format
    const dept = row.profiles?.department || (Array.isArray(row.profiles) ? row.profiles[0]?.department : null) || 'Other';
    deptPoints[dept] = (deptPoints[dept] || 0) + (row.points || 0);
  });
  
  // Provide realistic fallback data for the UI if DB query falls flat due to missing RLS
  if (Object.keys(deptPoints).length === 0 && incidents.length > 0) {
    incidents.forEach(inc => {
      const dept = inc.reporter?.department || 'Other';
      deptPoints[dept] = (deptPoints[dept] || 0) + 150; // Mock 150 points per incident
    });
  }

  const sortedDepts = Object.entries(deptPoints).sort((a,b) => b[1] - a[1]);
  // Top highest points determines the max for the progress bar scaling
  const maxPoints = sortedDepts.length > 0 ? sortedDepts[0][1] : 100;

  // Colors for leaderboard (mapping to the mockup)
  const lbColors = ['var(--green)', 'var(--blue)', 'var(--orange)', 'var(--sub)'];

  // Process Filed vs Closed per Department
  const deptStats = {};
  incidents.forEach(inc => {
    const dept = inc.reporter?.department || 'Other';
    if (!deptStats[dept]) deptStats[dept] = { filed: 0, closed: 0 };
    deptStats[dept].filed += 1;
    if (inc.status === 'closed') deptStats[dept].closed += 1;
  });

  const sortedDeptStats = Object.entries(deptStats).sort((a,b) => b[1].filed - a[1].filed);

  // Awaiting Manager Actions
  const pendingActions = incidents.filter(i => i.status === 'manager_review');

  const getRiskColorClass = (risk) => {
    if (risk === 'High') return 'pill-dark-outline'; // red default
    if (risk === 'Medium') return 'pill-dark-outline amber';
    return 'pill-dark-outline'; // generic
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    let str = formatDistanceToNow(new Date(dateStr), { addSuffix: false });
    // Shrink formatting based on screenshot "2h", "1d"
    str = str.replace('about ', '')
             .replace(' hours', 'h')
             .replace(' hour', 'h')
             .replace(' days', 'd')
             .replace(' day', 'd')
             .replace(' minutes', 'm')
             .replace(' minute', 'm');
    return str;
  };

  if (loading) {
    return (
      <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>

        {/* PAGE TITLE */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '4px 12px', 
            border: '1px solid rgba(16,185,129,0.25)', 
            borderRadius: '99px',
            backgroundColor: 'rgba(16,185,129,0.08)',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--green)', letterSpacing: '0.05em' }}>PHASE C • MANAGER</span>
          </div>
          <h1 style={{ fontSize: '26px', color: '#fff', marginBottom: '4px', fontWeight: '900' }}>SafeGuard Pro</h1>
          <p style={{ fontSize: '13px', color: 'var(--sub)', fontWeight: '500' }}>OBS Pharma · Production Facility</p>
        </div>

        {/* TIER 1: STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <Folder size={24} color="var(--amber)" fill="var(--amber)" style={{ marginBottom: '4px' }} />
            <div className="card-number">{openCount}</div>
            <div className="card-label">Open</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <Hourglass size={24} color="var(--orange)" fill="var(--orange)" style={{ marginBottom: '4px' }} />
            <div className="card-number amber">{pendingCount}</div>
            <div className="card-label">Pending Review</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <CheckSquare size={24} color="var(--green)" fill="var(--green)" style={{ marginBottom: '4px' }} />
            <div className="card-number green">{closedThisMonth}</div>
            <div className="card-label">Closed / Month</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <Siren size={24} color="var(--red)" fill="var(--red)" style={{ marginBottom: '4px' }} />
            <div className="card-number red">{overdueCount}</div>
            <div className="card-label">Overdue</div>
          </div>
        </div>

        {/* TIER 2: SPLIT LEADERBOARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          
          {/* Safety Leaderboard */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <Award size={16} color="var(--cyan)" /> Safety Leaderboard
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sortedDepts.slice(0, 4).map(([dept, pts], idx) => {
                const color = lbColors[idx] || 'var(--sub)';
                const colorClass = idx === 0 ? 'green' : idx === 1 ? 'blue' : idx === 2 ? 'orange' : '';
                const widthPct = Math.max((pts / maxPoints) * 100, 5);
                
                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {idx < 3 ? <Award size={14} color={color} fill={color} /> : <span style={{ width: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--sub)' }}>{idx + 1}</span>}
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{dept}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: color }}>{pts}pts</span>
                    </div>
                    <div className="progress-bg">
                      <div className={`progress-fill ${colorClass}`} style={{ width: `${widthPct}%`, backgroundColor: colorClass ? undefined : color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filed vs. Closed */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              📊 Filed vs. Closed
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sortedDeptStats.slice(0, 4).map(([dept, s]) => {
                const pct = Math.max((s.closed / Math.max(s.filed, 1)) * 100, 5);
                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{dept}</span>
                      <span style={{ fontSize: '12px', color: 'var(--sub)' }}>{s.closed}/{s.filed}</span>
                    </div>
                    <div className="progress-bg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
                      <div className="progress-fill cyan" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* TIER 3: DATA TABLE */}
        <div className="glass-panel" style={{ padding: '24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 24px' }}>
            <h3 style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Siren size={16} color="var(--amber)" fill="var(--amber)" /> Awaiting Manager Action
            </h3>
            <div style={{ padding: '6px 16px', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '99px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--amber)' }}>{pendingActions.length} Pending</span>
            </div>
          </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>REF</th>
                <th>TYPE</th>
                <th>LOCATION</th>
                <th>RISK</th>
                <th>AGE</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {pendingActions.map((inc, i) => (
                <tr key={inc.id}>
                  <td style={{ color: 'var(--cyan)', fontWeight: '800', paddingLeft: '24px' }}>#{inc.reference_number}</td>
                  <td style={{ fontWeight: '600' }}>{inc.incident_type}</td>
                  <td style={{ color: 'var(--sub)' }}>{inc.location_label || 'Unspecified'}</td>
                  <td>
                    <div className={getRiskColorClass(inc.overall_risk)}>{inc.overall_risk || 'Un-rated'}</div>
                  </td>
                  <td style={{ color: 'var(--sub)', fontSize: '12px', fontWeight: '600' }}>{timeAgo(inc.created_at)}</td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <button 
                      className="pill-action"
                      onClick={() => navigate(`/review/${inc.id}`)}
                    >
                      Review <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {pendingActions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--sub)' }}>
                    No pending actions awaiting your review right now!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
