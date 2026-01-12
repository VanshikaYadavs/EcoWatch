import { getCurrentLocation } from './location';
import { getNearbyCities, getHardcodedNearby } from './nearbyCities';
import axios from 'axios';
import { supabase } from './supabaseClient';

async function resolveCityName(lat, lon) {
  // Try OpenWeather reverse geocoding
  try {
    const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (key) {
      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${key}`;
      const res = await fetch(url);
      if (res.ok) {
        const arr = await res.json();
        const name = Array.isArray(arr) && arr[0]?.name;
        if (name) return name;
      }
    }
  } catch {}
  // Fallback to Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'EcoWatch/1.0' } });
    if (res.ok) {
      const j = await res.json();
      const addr = j?.address || {};
      const nm = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || addr.state_district || addr.state;
      if (nm) return nm;
    }
  } catch {}
  return 'Your Location';
}

const KEY = 'ecw.sessionCities';
const INGEST_KEY = 'ecw.currentIngestCity';

export function getCurrentIngestCity() {
  try {
    const v = localStorage.getItem(INGEST_KEY);
    return v || null;
  } catch {
    return null;
  }
}

export async function getSessionCities() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.main && Array.isArray(parsed.nearby)) return parsed;
    }
  } catch {}

  // Initialize
  try {
    const { lat, lon } = await getCurrentLocation();
    const mainName = await resolveCityName(lat, lon);
    // Prefer hardcoded personalisation clusters when available
    let nearby = getHardcodedNearby(mainName);
    if (!nearby?.length) {
      nearby = await getNearbyCities(lat, lon);
    }
    const data = { main: { name: mainName, lat, lon }, nearby };
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch (e) {
    // If geolocation fails/denied, avoid incorrect hardcoded defaults.
    const data = { main: null, nearby: [] };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
    return data;
  }
}

export async function ingestSessionCities() {
  const sess = await getSessionCities();
  const all = [sess.main, ...sess.nearby].filter(c => c && typeof c.lat === 'number' && typeof c.lon === 'number');
  const { data: sessData } = await supabase.auth.getSession();
  const userId = sessData?.session?.user?.id;
  const token = sessData?.session?.access_token;
  for (const c of all) {
    try {
      if (userId && token) {
        const isNearby = c?.name && sess?.main?.name && c.name !== sess.main.name;
        const url = `http://localhost:8080/api/ingest/now?lat=${c.lat}&lon=${c.lon}&name=${encodeURIComponent(c.name || '')}${isNearby ? '&nearby=1' : ''}`;
        const resp = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        // Prefer canonical location returned by backend (finalName) over client name
        const finalName = resp?.data?.data?.location || c.name || '';
        try {
          localStorage.setItem(INGEST_KEY, finalName);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ecw:ingestCity', { detail: finalName }));
          }
        } catch {}
      }
    } catch {}
  }
  return all;
}

export async function getSessionAllowlist() {
  const sess = await getSessionCities();
  const names = [sess.main?.name, ...sess.nearby.map(c => c.name)].filter(Boolean);
  return names;
}

export async function recomputeSessionCities() {
  try { localStorage.removeItem(KEY); } catch {}
  const sess = await getSessionCities();
  await ingestSessionCities();
  return sess;
}
