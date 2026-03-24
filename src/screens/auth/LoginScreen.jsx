import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // Verify role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'manager') {
      await supabase.auth.signOut();
      setErrorMsg('Unauthorized: Only HSE Managers can access this portal.');
      setLoading(false);
      return;
    }

    // Success, redirect to dashboard
    navigate('/');
  };

  return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '16px', 
            backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--amber)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '8px' }}>Manager Portal</h1>
          <p className="text-sub text-sm">SafeGuard HSE Management System</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'var(--red-dim)', color: 'var(--red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid var(--red-dim)' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="text-xs text-sub" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
            <input 
              type="email"
              className="input"
              placeholder="saad.iftikhar@obs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="text-xs text-sub" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
            <input 
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In to Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}
