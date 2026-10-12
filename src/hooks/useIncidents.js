import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_INCIDENTS, DEMO_MODE } from '../demo/demoData';

const SELECT = `
  *,
  reporter:profiles!reporter_id(full_name, department, job_title),
  investigator:profiles!investigator_id(full_name, job_title),
  capa_owner_profile:profiles!capa_owner(full_name, job_title)
`;

export function useIncidents({ realtime = true } = {}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (DEMO_MODE) {
      setIncidents(DEMO_INCIDENTS);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('incidents').select(SELECT).order('created_at', { ascending: false });
    if (queryError) setError(queryError.message);
    else { setIncidents(data || []); setError(''); }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    if (DEMO_MODE || !realtime) return undefined;
    const channel = supabase.channel('manager-incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [realtime, refresh]);

  return { incidents, loading, error, refresh };
}
