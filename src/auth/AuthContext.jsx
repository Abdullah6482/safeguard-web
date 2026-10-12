/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE, DEMO_PROFILE } from '../demo/demoData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(DEMO_MODE ? { user: { id: DEMO_PROFILE.id } } : null);
  const [profile, setProfile] = useState(DEMO_MODE ? DEMO_PROFILE : null);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState('');

  // 1. Session initialization and auth change listener
  useEffect(() => {
    if (DEMO_MODE) return undefined;
    let mounted = true;

    // Initial session retrieval
    supabase.auth.getSession()
      .then(({ data, error: sessionErr }) => {
        if (!mounted) return;
        if (sessionErr) {
          console.error('Session retrieval error:', sessionErr);
          setError(sessionErr.message);
          setLoading(false);
          return;
        }
        setSession(data?.session ?? null);
        if (!data?.session) {
          setProfile(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('getSession uncaught error:', err);
        setError(err.message || 'Failed to initialize session');
        setLoading(false);
      });

    // Listen for auth state changes synchronously.
    // NOTE: Do NOT perform async Supabase queries directly inside this callback
    // as it holds Supabase's internal auth Web Lock and can cause a deadlock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      if (nextSession) {
        setProfile(null);
        setError('');
        setLoading(true);
      } else {
        setProfile(null);
        setError('');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Profile fetch triggered outside the onAuthStateChange lock
  useEffect(() => {
    if (DEMO_MODE) return undefined;
    let active = true;
    const userId = session?.user?.id;

    if (!userId) {
      setProfile(null);
      return;
    }

    async function loadProfile() {
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role, department, job_title')
          .eq('id', userId)
          .single();

        if (!active) return;

        if (profileError) {
          console.warn('Profile fetch error:', profileError);
          setError(profileError.message);
          setProfile(null);
        } else {
          setProfile(data);
          setError('');
        }
      } catch (err) {
        if (!active) return;
        console.error('Profile fetch exception:', err);
        setError(err.message || 'Failed to load user profile');
        setProfile(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const value = useMemo(() => ({ session, profile, loading, error }), [session, profile, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
