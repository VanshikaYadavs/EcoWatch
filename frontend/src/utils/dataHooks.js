import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export function useEnvironmentReadings({ location = null, limit = 50, start = null, end = null, realtime = false } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setData([]);
        setError('Supabase is not configured');
        setLoading(false);
        return;
      }
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
      if (!isSupabaseConfigured || !supabase) {
        setData([]);
        setError('Supabase is not configured');
        setLoading(false);
        return;
      }
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

// Latest reading per city. Tries SQL view `latest_city_readings`,
// falls back to client-side grouping if the view is missing.
export function useLatestCityReadings({ fallbackWindow = 100, allowLocations = null } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchViaView = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { rows: [], err: new Error('Supabase is not configured') };
      }
      const { data: rows, error: err } = await supabase
        .from('latest_city_readings')
        .select('*');
      return { rows, err };
    };

    const fetchAndGroup = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { rows: [], err: new Error('Supabase is not configured') };
      }
      const { data: rows, error: err } = await supabase
        .from('environment_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(fallbackWindow);
      if (err) return { rows: [], err };
      const seen = new Set();
      const grouped = [];
      for (const r of rows || []) {
        const loc = r.location || 'Unknown';
        if (!seen.has(loc)) {
          seen.add(loc);
          grouped.push(r);
        }
      }
      return { rows: grouped, err: null };
    };

    (async () => {
      setLoading(true);
      setError(null);
      // Try view first
      let rows = [];
      let err = null;
      try {
        const r = await fetchViaView();
        rows = r.rows || [];
        err = r.err || null;
        // If view missing, err.code might be '42P01' (relation does not exist)
        if (err) throw err;
      } catch (_e) {
        const r2 = await fetchAndGroup();
        rows = r2.rows || [];
        err = r2.err || null;
      }
      if (cancelled) return;
      if (err) setError(err.message || String(err));
      const filtered = Array.isArray(allowLocations) && allowLocations.length
        ? (rows || []).filter(r => allowLocations.includes(r.location))
        : rows;
      setData(filtered);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [fallbackWindow, Array.isArray(allowLocations) ? allowLocations.join('|') : '']);

  return { data, loading, error };
}

// Nearby latest-per-city readings from nearby_environment_readings
export function useNearbyLatestCityReadings({ fallbackWindow = 100, allowLocations = null } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAndGroup = async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { rows: [], err: new Error('Supabase is not configured') };
      }
      const { data: rows, error: err } = await supabase
        .from('nearby_environment_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(fallbackWindow);
      if (err) return { rows: [], err };
      const seen = new Set();
      const grouped = [];
      for (const r of rows || []) {
        const loc = r.location || 'Unknown';
        if (!seen.has(loc)) {
          seen.add(loc);
          grouped.push(r);
        }
      }
      return { rows: grouped, err: null };
    };

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchAndGroup();
        if (cancelled) return;
        const filtered = Array.isArray(allowLocations) && allowLocations.length
          ? (r.rows || []).filter(row => allowLocations.includes(row.location))
          : r.rows || [];
        setData(filtered);
        setLoading(false);
      } catch (e) {
        if (!cancelled) { setError(e?.message || String(e)); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [fallbackWindow, Array.isArray(allowLocations) ? allowLocations.join('|') : '']);

  return { data, loading, error };
}

// Build comparative time-series for selected locations and parameters over a range
export function useComparativeSeries({ locations = [], parameters = ['aqi'], timeRange = '24h', refreshToken = 0 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapParam = (row, p) => {
    switch (p) {
      case 'aqi': return row?.aqi ?? null;
      case 'pm25': return row?.pm25 ?? null;
      case 'pm10': return row?.pm10 ?? null;
      case 'o3': return row?.o3 ?? null;
      case 'no2': return row?.no2 ?? null;
      case 'temperature': return row?.temperature ?? null;
      case 'humidity': return row?.humidity ?? null;
      case 'noise':
      case 'noise_level': return row?.noise_level ?? null;
      default: return null; // pm25/pm10 not in schema
    }
  };

  const labelForRange = (dt) => {
    const d = new Date(dt);
    if (timeRange === '24h') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit' });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        if (!isSupabaseConfigured || !supabase) {
          setData([]);
          setLoading(false);
          return;
        }
        if (!locations?.length || !parameters?.length) {
          setData([]);
          setLoading(false);
          return;
        }

        // Compute start time
        const now = Date.now();
        const rangeMs = timeRange === '24h' ? 24*3600e3 : timeRange === '7d' ? 7*24*3600e3 : timeRange === '30d' ? 30*24*3600e3 : 90*24*3600e3;
        const startISO = new Date(now - rangeMs).toISOString();

        // Fetch recent rows for selected locations
        let q = supabase
          .from('environment_readings')
          .select('*')
          .in('location', locations)
          .gte('recorded_at', startISO)
          .order('recorded_at', { ascending: true });

        const { data: rows, error: err } = await q;
        if (cancelled) return;
        if (err) throw err;

        // Aggregate into { time, `${cityId}_${param}`: value }
        const points = new Map(); // timeLabel -> object
        for (const r of rows || []) {
          const tl = labelForRange(r.recorded_at);
          const keyBase = String(r.location || 'Unknown').toLowerCase().replace(/\s+/g, '-');
          const obj = points.get(tl) || { time: tl };
          for (const p of parameters) {
            const val = mapParam(r, p);
            if (val != null) obj[`${keyBase}_${p}`] = val;
          }
          points.set(tl, obj);
        }
        const sorted = Array.from(points.values());
        setData(sorted);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || String(e));
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [JSON.stringify(locations), JSON.stringify(parameters), timeRange, refreshToken]);

  return { data, loading, error };
}
