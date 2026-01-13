import { getCurrentLocation } from './location';
import { getNearbyCities } from './nearbyCities';
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

export async function getSessionCities() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.main && Array.isArray(parsed.nearby)) return parsed;
    }
  } catch {}

  // Return empty session instead of auto-detecting GPS location
  // Users should configure monitored locations in Notification Settings
  const data = { main: null, nearby: [] };
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  return data;
}

export async function ingestSessionCities() {
  // Disabled automatic ingestion - users should use monitored locations from settings
  // This prevents unwanted location data ingestion on every page load
  return [];
}

export async function getSessionAllowlist() {
  const sess = await getSessionCities();
  const names = [sess.main?.name, ...sess.nearby.map(c => c.name)].filter(Boolean);
  return names;
}

export async function recomputeSessionCities() {
  // Clear cached location data
  try { localStorage.removeItem(KEY); } catch {}
  // Return empty - users should configure monitored locations in settings
  const data = { main: null, nearby: [] };
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  return data;
}
