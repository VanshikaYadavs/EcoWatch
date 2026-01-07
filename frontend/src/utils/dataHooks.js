import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useEnvironmentReadings({ location = null, limit = 50 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      let q = supabase
        .from('environment_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (location && location !== 'all') q = q.eq('location', location);
      const { data: rows, error: err } = await q;
      if (cancelled) return;
      if (err) setError(err.message);
      else setData(rows || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [location, limit]);

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
