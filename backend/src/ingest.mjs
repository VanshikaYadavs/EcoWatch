import './loadEnv.mjs';
import { evaluateAndRecordAlerts } from './alerts.mjs';

const WAQI_TOKEN = process.env.WAQI_TOKEN;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const hasGlobalFetch = typeof fetch === 'function';

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} for ${url}: ${text}`);
  }
  return res.json();
}

export async function fetchAQI(lat, lon) {
  if (!WAQI_TOKEN) return { aqi: null, source: null };
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`;
  const data = await fetchJSON(url);
  if (data?.status !== 'ok') throw new Error(`WAQI error: ${data?.data || data?.status}`);
  const aqi = Number(data?.data?.aqi ?? null);
  return { aqi, source: 'waqi' };
}

export async function fetchWeather(lat, lon) {
  if (!OPENWEATHER_API_KEY) return { temperature: null, humidity: null, source: null };
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const data = await fetchJSON(url);
  const temperature = Number(data?.main?.temp ?? null);
  const humidity = Number(data?.main?.humidity ?? null);
  return { temperature, humidity, source: 'openweather' };
}

function maybeSimulateNoise() {
  // Optional simple noise simulation (50-85 dB)
  const min = 50, max = 85;
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

/**
 * Normalize location name using the database mapping table
 * Falls back to the original name if normalization fails
 */
async function normalizeLocationName(locationName, supabaseAdmin) {
  if (!locationName || !supabaseAdmin) return locationName;
  
  try {
    const { data, error } = await supabaseAdmin
      .rpc('normalize_location_name', { input_name: locationName });
    
    if (error) {
      console.warn(`[ingest] Location normalization failed for "${locationName}":`, error.message);
      return locationName;
    }
    
    // If the normalized name is different, log it
    if (data && data !== locationName) {
      console.log(`[ingest] Normalized location: "${locationName}" → "${data}"`);
    }
    
    return data || locationName;
  } catch (err) {
    console.warn(`[ingest] Location normalization error for "${locationName}":`, err.message);
    return locationName;
  }
}

export async function ingestOne({ name, lat, lon, user_id, simulateNoise = true }) {
  if (!hasGlobalFetch) throw new Error('Global fetch is not available. Use Node 18+ or polyfill fetch.');
  // Resolve supabaseAdmin at runtime to avoid circular import issues
  const { supabaseAdmin } = await import('./index.mjs');
  if (!supabaseAdmin) throw new Error('Supabase admin client is not configured');
  // Enforce user identity unless explicitly allowed for dev via env flag
  const allowAnon = process.env.ALLOW_ANON_INGEST === '1';
  if (!user_id && !allowAnon) {
    throw new Error('Missing user_id (set ALLOW_ANON_INGEST=1 to allow anonymous ingest)');
  }

  const [aqiRes, wxRes] = await Promise.all([
    fetchAQI(lat, lon).catch(() => ({ aqi: null, source: null })),
    fetchWeather(lat, lon).catch(() => ({ temperature: null, humidity: null, source: null })),
  ]);

  // Normalize location name for consistent matching
  const normalizedLocation = await normalizeLocationName(name, supabaseAdmin);

  const sources = [aqiRes.source, wxRes.source].filter(Boolean).join(',');
  const payload = {
    location: normalizedLocation,
    latitude: lat,
    longitude: lon,
    aqi: aqiRes.aqi,
    temperature: wxRes.temperature,
    humidity: wxRes.humidity,
    noise_level: simulateNoise ? maybeSimulateNoise() : null,
    source: sources || null,
    recorded_at: new Date().toISOString(),
    user_id: user_id ?? null,
  };

  const { data, error } = await supabaseAdmin.from('environment_readings').insert([payload]).select('*').single();
  if (error) throw new Error(error.message);
  try {
    await evaluateAndRecordAlerts(payload);
  } catch (e) {
    // Log but don't fail the ingestion on alert errors
    console.warn('Alert evaluation error:', e?.message || e);
  }
  return data;
}

export async function ingestMany(locations) {
  const results = [];
  for (const loc of locations) {
    try {
      const data = await ingestOne(loc);
      results.push({ ok: true, data });
    } catch (err) {
      results.push({ ok: false, error: String(err), location: loc });
    }
  }
  return results;
}

// CLI entry: `npm run ingest`
if (import.meta.url === (new URL(process.argv[1], 'file://')).href) {
  (async () => {
    try {
      const def = process.env.DEFAULT_LOCATIONS ? JSON.parse(process.env.DEFAULT_LOCATIONS) : [];
      if (!def.length) {
        console.log('No DEFAULT_LOCATIONS configured. Set a JSON array in .env');
        process.exit(0);
      }
      const defaultUserId = process.env.DEFAULT_USER_ID || null;
      if (!defaultUserId && process.env.ALLOW_ANON_INGEST !== '1') {
        console.error('Refusing CLI ingest: DEFAULT_USER_ID not set and ALLOW_ANON_INGEST!=1');
        process.exit(1);
      }
      const withUser = def.map((loc) => ({ ...loc, user_id: defaultUserId }));
      const results = await ingestMany(withUser);
      console.log(JSON.stringify(results, null, 2));
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
