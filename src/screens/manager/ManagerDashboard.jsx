import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, LogOut, Search, Clock, CheckCircle2, AlertTriangle, Filter, BarChart3, TrendingUp, TrendingDown, Minus, Download, Calendar, Bell, MapPin, Building, Users, AlertCircle, Award } from 'lucide-react';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';export default function ManagerDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('manager_review'); // 'manager_review' | 'closed' | 'in_progress'
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [locations] = useState([
    { id: 'all', name: 'All Locations', buildings: 3 },
    { id: 'building-a', name: 'Building A', buildings: 1 },
    { id: 'building-b', name: 'Building B', buildings: 1 },
    { id: 'building-c', name: 'Building C', buildings: 1 },
    { id: 'warehouse', name: 'Warehouse Area', buildings: 2 },
    { id: 'production', name: 'Production Line', buildings: 4 }
  ]);

  // Export functionality
  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Status', 'Reporter', 'Department', 'Location', 'Created', 'Updated', 'Risk Level'];
    const csvContent = [
      headers.join(','),
      ...filteredIncidents.map(inc => [
        inc.id,
        inc.incident_type || 'Unknown',
        inc.status,
        inc.reporter?.full_name || 'Unknown',
        inc.reporter?.department || 'Unknown',
        inc.location_label || 'Unknown',
        inc.created_at ? new Date(inc.created_at).toLocaleDateString() : 'Unknown',
        inc.updated_at ? new Date(inc.updated_at).toLocaleDateString() : 'Unknown',
        inc.overall_risk || 'Unrated'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate notifications based on incident data
  const generateNotifications = () => {
    const notifs = [];
    
    // High risk incidents needing attention
    const highRiskIncidents = incidents.filter(i => 
      i.status === 'manager_review' && i.overall_risk === 'High'
    );
    if (highRiskIncidents.length > 0) {
      notifs.push({
        id: 'high-risk',
        type: 'warning',
        title: 'High Risk Incidents',
        message: `${highRiskIncidents.length} high-risk incidents awaiting review`,
        count: highRiskIncidents.length,
        icon: AlertTriangle,
        color: 'var(--red)'
      });
    }

    // Overdue CAPA items
    const overdueCAPA = incidents.filter(i => 
      i.capa_due_date && new Date(i.capa_due_date) < new Date() && i.status !== 'closed'
    );
    if (overdueCAPA.length > 0) {
      notifs.push({
        id: 'overdue-capa',
        type: 'error',
        title: 'Overdue CAPA Items',
        message: `${overdueCAPA.length} corrective actions are overdue`,
        count: overdueCAPA.length,
        icon: AlertCircle,
        color: 'var(--red)'
      });
    }

    // New incidents in last 24 hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    const recentIncidents = incidents.filter(i => 
      new Date(i.created_at) >= last24Hours
    );
    if (recentIncidents.length > 0) {
      notifs.push({
        id: 'recent-incidents',
        type: 'info',
        title: 'New Incidents',
        message: `${recentIncidents.length} new incidents reported in last 24 hours`,
        count: recentIncidents.length,
        icon: Bell,
        color: 'var(--blue-light)'
      });
    }

    // Location-specific alerts
    const locationStats = locations.slice(1).map(location => {
      const locationIncidents = incidents.filter(i => 
        i.location_label?.toLowerCase().includes(location.name.toLowerCase().replace('Building ', '').toLowerCase())
      );
      if (locationIncidents.length >= 3) {
        return {
          id: `location-${location.id}`,
          type: 'warning',
          title: `${location.name} Activity`,
          message: `${locationIncidents.length} incidents reported`,
          count: locationIncidents.length,
          icon: MapPin,
          color: 'var(--amber)'
        };
      }
      return null;
    }).filter(Boolean);

    notifs.push(...locationStats);
    setNotifications(notifs);
  };

  // Update notifications when incidents change
  useEffect(() => {
    if (incidents.length > 0) {
      generateNotifications();
    }
  }, [incidents]);
  
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (incidents.length > 0) {
      setAnalyticsData(calculateAnalytics());
    }
  }, [incidents]);

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
    try {
      let query = supabase
        .from('incidents')
        .select(`
          *,
          reporter:profiles!reporter_id (full_name, job_title, department),
          investigator:profiles!investigator_id (full_name, job_title)
        `)
        .in('status', ['manager_review', 'closed', 'under_investigation'])
        .order('updated_at', { ascending: false });

      // Apply date range filter if set
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('created_at', dateRange.end + 'T23:59:59');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        setIncidents([]);
      } else {
        setIncidents(data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const filteredIncidents = incidents.filter(inc => {
    if (inc.status !== filter) return false;
    const searchTerm = search.toLowerCase().trim();
    if (searchTerm && !inc.id?.toString().toLowerCase().includes(searchTerm) && 
        !inc.incident_type?.toLowerCase().includes(searchTerm) &&
        !inc.reporter?.full_name?.toLowerCase().includes(searchTerm)) {
      return false;
    }
    
    // Location filtering
    if (selectedLocation !== 'all') {
      const location = locations.find(l => l.id === selectedLocation);
      if (location && !inc.location_label?.toLowerCase().includes(location.name.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

  const pendingCount = incidents.filter(i => i.status === 'manager_review').length;
  const closedCount = incidents.filter(i => i.status === 'closed').length;
  const inProgressCount = incidents.filter(i => i.status === 'under_investigation').length;

  // Calculate analytics data for Recharts
  const calculateAnalytics = () => {
    if (!incidents.length) return null;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentIncidents = incidents.filter(i => new Date(i.created_at) >= last30Days);
    
    // 1. Data for PieChart (By Type)
    const typeDict = recentIncidents.reduce((acc, inc) => {
      const type = inc.incident_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const typeData = Object.entries(typeDict).map(([name, value]) => ({ name, value }));

    // 2. Data for BarChart (By Risk)
    const riskDict = recentIncidents.reduce((acc, inc) => {
      const risk = inc.overall_risk || 'Unrated';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});
    const riskData = Object.entries(riskDict).map(([name, value]) => ({ name, value }));

    // 3. Department Leaderboard
    const deptDict = recentIncidents.reduce((acc, inc) => {
      const dept = inc.reporter?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    const topDepartments = Object.entries(deptDict)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Reporter Leaderboard
    const reporterDict = recentIncidents.reduce((acc, inc) => {
      const reporter = inc.reporter?.full_name || 'Anonymous';
      acc[reporter] = (acc[reporter] || 0) + 1;
      return acc;
    }, {});
    const topReporters = Object.entries(reporterDict)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 5. LineChart Trend Data (Last 14 days)
    const trendDataArray = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = subDays(now, i);
      trendDataArray.push({
        name: format(d, 'MMM dd'),
        dateStr: format(d, 'yyyy-MM-dd'),
        count: 0
      });
    }
    
    recentIncidents.forEach(inc => {
      if(inc.created_at) {
         const incDateStr = format(new Date(inc.created_at), 'yyyy-MM-dd');
         const dayObj = trendDataArray.find(d => d.dateStr === incDateStr);
         if (dayObj) {
           dayObj.count += 1;
         }
      }
    });

    const avgResolutionTime = incidents
      .filter(i => i.status === 'closed' && i.closed_at && i.created_at)
      .reduce((sum, inc) => {
        const created = new Date(inc.created_at);
        const closed = new Date(inc.closed_at);
        return sum + (closed - created) / (1000 * 60 * 60 * 24); // days
      }, 0) / (incidents.filter(i => i.status === 'closed' && i.closed_at && i.created_at).length || 1);

    // Filter CAPA Data
    const overdueCapa = incidents.filter(i => i.capa_due_date && new Date(i.capa_due_date) < new Date() && i.status !== 'closed').length;
    const pendingCapa = incidents.filter(i => i.status === 'under_investigation' && i.capa_plan).length;

    return {
      totalIncidents: recentIncidents.length,
      typeData,
      riskData,
      topDepartments,
      topReporters,
      trendDataArray,
      overdueCapa,
      pendingCapa,
      byType: typeDict,
      byRisk: riskDict,
      byDepartment: deptDict,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      trend: calculateTrend(recentIncidents)
    };
  };

  const calculateTrend = (incidents) => {
    const now = new Date();
    const week1 = incidents.filter(i => {
      const date = new Date(i.created_at);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length;
    
    const week2 = incidents.filter(i => {
      const date = new Date(i.created_at);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    return week1 > week2 ? 'up' : week1 < week2 ? 'down' : 'stable';
  };

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
              className={`btn btn-ghost ${filter === 'in_progress' ? 'active-tab' : ''}`}
              style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: filter === 'in_progress' ? 'var(--panel-hover)' : 'transparent', color: filter === 'in_progress' ? 'var(--blue-light)' : 'var(--sub)' }}
              onClick={() => setFilter('in_progress')}
            >
              <Clock size={16} /> In Progress <span className="badge" style={{ marginLeft: 'auto', backgroundColor: filter === 'in_progress' ? 'var(--blue-light)' : 'var(--surface)', color: filter === 'in_progress' ? '#000' : 'var(--sub)' }}>{inProgressCount}</span>
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
              {filter === 'manager_review' ? 'Pending Incident Reviews' : 
               filter === 'in_progress' ? 'Incidents in Progress' : 
               'Closed Incidents'}
            </h1>
            <p className="text-sub" style={{ fontSize: '14px' }}>
              {filter === 'manager_review' ? `${pendingCount} incidents awaiting review and action.` :
               filter === 'in_progress' ? `${inProgressCount} incidents currently under investigation.` :
               `${closedCount} successfully resolved incidents this period.`}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Notification Center */}
            <div style={{ position: 'relative' }}>
              <button 
                className={`btn ${showNotifications ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
              >
                <Bell size={16} />
                Notifications
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--red)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  width: '320px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  marginTop: '8px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--sub)' }}>
                      <Bell size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                      <p style={{ fontSize: '13px' }}>No new notifications</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: notif.color + '22',
                          color: notif.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <notif.icon size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--sub)' }}>
                            {notif.message}
                          </div>
                        </div>
                        {notif.count && (
                          <span style={{
                            backgroundColor: notif.color,
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '10px'
                          }}>
                            {notif.count}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Location Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} style={{ color: 'var(--sub)' }} />
              <select 
                className="input" 
                style={{ padding: '6px 10px', fontSize: '12px', minWidth: '140px' }}
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className={`btn ${showAnalytics ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setShowAnalytics(!showAnalytics)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <BarChart3 size={16} />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
            <button className="btn btn-ghost" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} />
              Export CSV
            </button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Calendar size={16} style={{ color: 'var(--sub)' }} />
              <input 
                type="date" 
                className="input" 
                style={{ width: '120px', padding: '6px 10px', fontSize: '12px' }}
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span style={{ color: 'var(--sub)', fontSize: '12px' }}>to</span>
              <input 
                type="date" 
                className="input" 
                style={{ width: '120px', padding: '6px 10px', fontSize: '12px' }}
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--sub)' }} />
              <input 
                className="input" 
                placeholder="Search by ID, Type, or Reporter..." 
                style={{ paddingLeft: '40px' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && fetchIncidents()}
              />
            </div>
            <button className="btn btn-ghost" onClick={() => {setSearch(''); setDateRange({ start: '', end: '' }); setSelectedLocation('all'); fetchIncidents();}}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--sub)' }} />
            </button>
            <button className="btn btn-ghost" onClick={fetchIncidents}>
              <Filter size={16} /> Refresh
            </button>
          </div>
        </header>

        {/* Analytics Dashboard */}
        {showAnalytics && analyticsData && (
          <div style={{ marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} /> Analytics Dashboard (Last 30 Days)
              </h2>
              
              {/* Key Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--sub)' }}>Total Incidents</span>
                    {analyticsData.trend === 'up' && <TrendingUp size={16} color="var(--red)" />}
                    {analyticsData.trend === 'down' && <TrendingDown size={16} color="var(--green)" />}
                    {analyticsData.trend === 'stable' && <Minus size={16} color="var(--sub)" />}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{analyticsData.totalIncidents}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sub)' }}>Last 30 days</div>
                </div>
                
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--sub)' }}>Avg Resolution Time</span>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', marginTop: '4px' }}>{analyticsData.avgResolutionTime}d</div>
                  <div style={{ fontSize: '11px', color: 'var(--sub)' }}>Days to close</div>
                </div>
                
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--sub)' }}>Pending Review</span>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginTop: '4px' }}>{pendingCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sub)' }}>Need action</div>
                </div>
                
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--sub)' }}>Closed This Month</span>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--green)', marginTop: '4px' }}>{closedCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sub)' }}>Resolved</div>
                </div>
              </div>

              {/* Recharts Analytics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Incident Types Pie Chart */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Incident Distribution</h3>
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.typeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analyticsData.typeData.map((entry, index) => {
                            const colors = ['var(--amber)', 'var(--red)', 'var(--orange)', 'var(--blue-light)', 'var(--green)'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--sub)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Main Trend Line Chart */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reporting Trend (Last 14 Days)</h3>
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.trendDataArray}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--sub)' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--sub)' }} dx={-10} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} 
                          itemStyle={{ color: 'var(--blue-light)' }} 
                        />
                        <Line type="monotone" dataKey="count" name="Incidents Reported" stroke="var(--blue-light)" strokeWidth={3} dot={{ r: 4, fill: 'var(--panel)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Leaderboards & CAPA Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Top Reporters Leaderboard */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={16} color="var(--amber)" /> Proactive Reporters
                  </h3>
                  <div>
                    {analyticsData.topReporters.map((reporter, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx !== analyticsData.topReporters.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--amber)' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--panel)', color: idx < 3 ? '#000' : 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                            {idx + 1}
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{reporter.name}</span>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--sub)', fontWeight: '600', backgroundColor: 'var(--panel)', padding: '2px 8px', borderRadius: '12px' }}>{reporter.count}</span>
                      </div>
                    ))}
                    {analyticsData.topReporters.length === 0 && <p style={{ fontSize: '13px', color: 'var(--sub)', textAlign: 'center', padding: '20px 0' }}>No reporting data available</p>}
                  </div>
                </div>

                {/* Top Departments */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="var(--blue-light)" /> Department Leaderboard
                  </h3>
                  <div>
                    {analyticsData.topDepartments.map((dept, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx !== analyticsData.topDepartments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text)' }}>{dept.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--blue-light)', fontWeight: '600' }}>{dept.count}</span>
                          <span style={{ fontSize: '12px', color: 'var(--sub)' }}>reports</span>
                        </div>
                      </div>
                    ))}
                    {analyticsData.topDepartments.length === 0 && <p style={{ fontSize: '13px', color: 'var(--sub)', textAlign: 'center', padding: '20px 0' }}>No department data available</p>}
                  </div>
                </div>

                {/* CAPA Tracking widget */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="var(--red)" /> CAPA Action Tracking
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '8px', borderLeft: '3px solid var(--red)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>Overdue Actions</span>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--red)' }}>{analyticsData.overdueCapa}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '8px', borderLeft: '3px solid var(--amber)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>Pending Verification</span>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--amber)' }}>{analyticsData.pendingCapa}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--panel)', borderRadius: '8px', borderLeft: '3px solid var(--green)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>Actions Closed (30d)</span>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--green)' }}>{closedCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Breakdown */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  {Object.entries(analyticsData.byDepartment).map(([dept, count]) => (
                    <div key={dept} style={{ backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>{count}</div>
                      <div style={{ fontSize: '11px', color: 'var(--sub)' }}>{dept}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Analytics */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--sub)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location Analytics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {locations.slice(1).map(location => {
                    const locationIncidents = incidents.filter(i => 
                      i.location_label?.toLowerCase().includes(location.name.toLowerCase().replace('Building ', '').toLowerCase())
                    );
                    const highRiskCount = locationIncidents.filter(i => i.overall_risk === 'High').length;
                    const pendingCount = locationIncidents.filter(i => i.status === 'manager_review').length;
                    
                    return (
                      <div key={location.id} style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <MapPin size={16} style={{ color: 'var(--sub)' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{location.name}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>{locationIncidents.length}</div>
                            <div style={{ fontSize: '10px', color: 'var(--sub)' }}>Total</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: highRiskCount > 0 ? 'var(--red)' : 'var(--green)' }}>{highRiskCount}</div>
                            <div style={{ fontSize: '10px', color: 'var(--sub)' }}>High Risk</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: pendingCount > 0 ? 'var(--amber)' : 'var(--green)' }}>{pendingCount}</div>
                            <div style={{ fontSize: '10px', color: 'var(--sub)' }}>Pending</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--blue-light)' }}>{location.buildings}</div>
                            <div style={{ fontSize: '10px', color: 'var(--sub)' }}>Buildings</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid transparent', borderRadius: '50%' }}></div>
            <p style={{ marginLeft: '16px', color: 'var(--sub)', fontSize: '14px' }}>Loading incidents...</p>
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
                      No {filter === 'manager_review' ? 'pending' : filter === 'in_progress' ? 'in progress' : 'closed'} incidents found.
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
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--sub)' }}>{inc.id}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{inc.incident_type || 'Untitled Incident'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--sub)' }}>
                           <AlertTriangle size={12} style={{ display: 'inline', position: 'relative', top: '2px', marginRight: '4px', color: inc.immediate_action ? 'var(--green)' : 'var(--amber)' }} />
                           {inc.incident_type}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--sub)' }}>
                        {inc.reporter?.full_name || 'Unknown User'}
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
