import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Wrench, Sparkles } from 'lucide-react';

const FEATURE_NAMES = {
  '/analytics':  { title: 'Analytics & Reporting', icon: '📊', desc: 'Deep-dive incident trends, risk heat maps, and exportable performance reports across all departments.' },
  '/team':       { title: 'Team Directory',          icon: '👥', desc: 'Manage investigator assignments, view reporter profiles, and track individual safety records.' },
  '/policies':   { title: 'Security Policies',       icon: '📋', desc: 'Define CAPA workflows, escalation rules, SLA thresholds, and regulatory compliance templates.' },
  '/settings':   { title: 'Settings',                icon: '⚙️', desc: 'Configure notifications, integrations, access roles, and platform-wide preferences.' },
};

export default function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();
  const feature = FEATURE_NAMES[location.pathname] || { title: 'This Feature', icon: '🚀', desc: 'This section is currently under development and will be available in the next release.' };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        {/* Big Icon */}
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>{feature.icon}</div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 16px', borderRadius: '99px', marginBottom: '24px',
          backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
        }}>
          <Wrench size={12} color="var(--amber)" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--amber)', letterSpacing: '0.06em' }}>COMING SOON</span>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {feature.title}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--sub)', lineHeight: '1.7', marginBottom: '40px' }}>
          {feature.desc}
        </p>

        {/* Sparkle bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px', textAlign: 'left' }}>
          {['Planned for Phase D', 'Enterprise ready & SOC-2 aligned', 'Real-time data, zero extra DB queries'].map(point => (
            <div key={point} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={14} color="var(--cyan)" />
              <span style={{ fontSize: '13px', color: 'var(--sub)', fontWeight: '500' }}>{point}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '10px', border: 'none',
            backgroundColor: 'var(--surface)', color: 'var(--text)',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--panel)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
