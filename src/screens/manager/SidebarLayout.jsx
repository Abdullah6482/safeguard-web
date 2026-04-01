import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ShieldAlert, LayoutDashboard, FolderOpen,
  ClipboardList, Users, BookLock, Settings,
  Bell, Search, LogOut, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',        icon: LayoutDashboard, path: '/',          group: 'core' },
  { label: 'Incidents',        icon: FolderOpen,       path: '/incidents', group: 'core' },
  { label: 'CAPA Registry',    icon: ClipboardList,    path: '/analytics', group: 'core' },
  { label: 'Team Directory',   icon: Users,            path: '/team',      group: 'admin' },
  { label: 'Policies',         icon: BookLock,         path: '/policies',  group: 'admin' },
  { label: 'Settings',         icon: Settings,         path: '/settings',  group: 'admin' },
];

export default function SidebarLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/login'); return; }
      supabase.from('profiles').select('full_name, role, department').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data));
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg)' }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Branding */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <ShieldAlert size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>SafeGuard Pro</div>
            <div style={{ fontSize: '10px', color: 'var(--sub)', fontWeight: '600', letterSpacing: '0.05em', marginTop: '3px' }}>MANAGER PORTAL</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          
          <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--muted)', letterSpacing: '0.12em', padding: '8px 8px 6px', textTransform: 'uppercase' }}>Core</div>
          {NAV_ITEMS.filter(n => n.group === 'core').map(item => (
            <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={() => navigate(item.path)} />
          ))}

          <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--muted)', letterSpacing: '0.12em', padding: '20px 8px 6px', textTransform: 'uppercase' }}>Admin</div>
          {NAV_ITEMS.filter(n => n.group === 'admin').map(item => (
            <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={() => navigate(item.path)} />
          ))}
        </nav>

        {/* User Profile + Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: '10px', marginBottom: '8px'
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '800', color: '#fff'
            }}>
              {profile?.full_name?.[0] || 'M'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Manager'}</div>
              <div style={{ fontSize: '10px', color: 'var(--sub)' }}>HSE Manager</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)',
              backgroundColor: 'rgba(239,68,68,0.06)', color: 'var(--red)',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: '60px', flexShrink: 0,
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: '16px',
        }}>
          {/* Search */}
          <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              placeholder="Global Search — incidents, refs, reporters…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)', borderRadius: '8px',
                padding: '8px 12px 8px 36px', color: 'var(--text)',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Live badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '99px',
            border: '1px solid rgba(16,185,129,0.2)',
            backgroundColor: 'rgba(16,185,129,0.06)'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--green)', animation: 'pulse 2s infinite' }}></div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green)' }}>Live</span>
          </div>

          {/* Bell */}
          <button style={{
            width: '36px', height: '36px', borderRadius: '9px',
            backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--sub)'
          }}>
            <Bell size={16} />
          </button>

          {/* Avatar */}
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '800', color: '#fff', cursor: 'pointer'
          }}>
            {profile?.full_name?.[0] || 'M'}
          </div>
        </header>

        {/* Main scrollable canvas */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg)' }}>
          <Outlet context={{ profile }} />
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '10px', padding: '9px 10px', borderRadius: '8px', border: 'none',
        backgroundColor: active ? 'rgba(37,99,235,0.15)' : 'transparent',
        color: active ? 'var(--blue-light)' : 'var(--sub)',
        fontSize: '13px', fontWeight: active ? '700' : '500',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.15s'
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = active ? 'var(--blue-light)' : 'var(--text)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = active ? 'var(--blue-light)' : 'var(--sub)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={16} />
        {item.label}
      </div>
      {active && <ChevronRight size={14} />}
    </button>
  );
}
