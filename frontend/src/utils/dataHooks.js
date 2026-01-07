import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useEnvironmentReadings({ location = null, limit = 50, start = null, end = null, realtime = false } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let q = supabase
        .from('environment_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (location && location !== 'all') q = q.eq('location', location);
      if (start) q = q.gte('recorded_at', start);
      if (end) q = q.lte('recorded_at', end);
      const { data: rows, error: err } = await q;
      if (cancelled) return;
      if (err) setError(err.message);
      else setData(rows || []);
      setLoading(false);
    };

    fetchData();

    // Optional realtime subscription
    let channel;
    if (realtime) {
      try {
        channel = supabase.channel(`env_readings_${location || 'all'}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'environment_readings' }, (_payload) => {
            // On any change, refresh with current filters
            fetchData();
          })
          .subscribe();
      } catch (e) {
        // Non-fatal: just log and continue without realtime
        console.warn('Realtime subscription error:', e?.message || e);
      }
    }
    return () => { cancelled = true; };
  }, [location, limit, start, end, realtime]);

  return { data, loading, error };
}

export function useAlertEvents({ limit = 20 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data: rows, error: err } = await supabase
        .from('alert_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (cancelled) return;
      if (err) setError(err.message);
      else setData(rows || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return { data, loading, error };
}
