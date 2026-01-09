import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import axios from 'axios';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { ingestOne } from './ingest.mjs';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
// Allow frontend dev origin for cross-origin requests
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

const PORT = process.env.PORT || 8080;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. Some routes will not function.');
}

// Server-side Supabase client (service role for secure operations)
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Alias used in collection helpers below
const supabase = supabaseAdmin;

// Health route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ecowatch-backend' });
});

// Root route – helpful message for developers
app.get('/', (_req, res) => {
  res.status(200).send(`
    <html>
      <head><title>EcoWatch Backend</title></head>
      <body style="font-family: system-ui; padding: 24px;">
        <h2>EcoWatch Backend is running ✅</h2>
        <p>Available endpoints:</p>
        <ul>
          <li><a href="/health">/health</a> – service status</li>
          <li><a href="/api/readings/latest">/api/readings/latest</a> – query latest readings</li>
          <li><a href="/api/ingest/now?name=Jaipur&lat=26.91&lon=75.78">/api/ingest/now</a> – trigger one-off ingest</li>
        </ul>
        <p>If you expected the frontend UI, run it separately at <code>npm start</code> in the <strong>frontend</strong> folder.</p>
      </body>
    </html>
  `);
});

// Example: fetch latest environment readings for a location
app.get('/api/readings/latest', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    const { location, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('environment_readings')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(Number(limit));

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Example: insert a new environment reading (server trusted path)
app.post('/api/readings', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    const body = req.body;
    // Expecting: { location, latitude, longitude, aqi, temperature, humidity, noise_level, source, recorded_at? }
    const payload = {
      location: body.location ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      aqi: body.aqi ?? null,
      temperature: body.temperature ?? null,
      humidity: body.humidity ?? null,
      noise_level: body.noise_level ?? null,
      source: body.source ?? 'api',
      recorded_at: body.recorded_at ?? new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('environment_readings')
      .insert([payload])
      .select('*')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Trigger ingestion for a single location
// GET /api/ingest/now?name=Jaipur&lat=26.91&lon=75.78
app.get('/api/ingest/now', async (req, res) => {
  try {
    let { name, lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
    lat = Number(lat);
    lon = Number(lon);

    // Optional reverse geocoding to get city name when not provided
    if (!name) {
      name = await resolveLocationName(lat, lon);
    }

    console.log(`[ingest] coords=(${lat},${lon}) resolvedName="${name}"`);
    const data = await ingestOne({ name, lat, lon });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`EcoWatch backend listening on http://localhost:${PORT}`);
});

// -----------------------------
// Simple one-off data collection
// -----------------------------

async function fetchAQI(lat, lon) {
  const token = process.env.WAQI_API_KEY || process.env.WAQI_TOKEN;
  if (!token) throw new Error('Missing WAQI API key');
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
  const res = await axios.get(url);
  if (res?.data?.status !== 'ok') {
    throw new Error('WAQI fetch failed');
  }
  return res.data.data.aqi;
}

async function fetchWeather(lat, lon) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) throw new Error('Missing OpenWeather API key');
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
  const res = await axios.get(url);
  return {
    temperature: res.data?.main?.temp,
    humidity: res.data?.main?.humidity,
  };
}

function simulateNoiseLevel() {
  return Math.floor(Math.random() * (85 - 40 + 1)) + 40;
}

async function storeReading(payload) {
  if (!supabase) {
    console.warn('Supabase not configured; skip storeReading');
    return;
  }
  const { error } = await supabase.from('environment_readings').insert([payload]);
  if (error) {
    console.error('DB insert failed:', error.message);
  } else {
    console.log('✅ Environmental data stored');
  }
}

async function collectEnvironmentalData() {
  try {
    const location = 'Delhi';
    const lat = 28.6139;
    const lon = 77.2090;

    const aqi = await fetchAQI(lat, lon);
    const weather = await fetchWeather(lat, lon);
    const noise = simulateNoiseLevel();

    await storeReading({
      location,
      latitude: lat,
      longitude: lon,
      aqi,
      temperature: weather.temperature,
      humidity: weather.humidity,
      noise_level: noise,
      source: 'WAQI + OpenWeather',
    });
  } catch (err) {
    console.error('❌ Data collection error:', err?.message || String(err));
  }
}

// Run a one-time collection at startup if enabled
if (process.env.COLLECT_ON_STARTUP === '1') {
  collectEnvironmentalData();
}

// -----------------------------
// Reverse geocoding helper
// -----------------------------

async function resolveLocationName(lat, lon) {
  // 1) Prefer WAQI city/station name when available (often more granular for Indian cities)
  try {
    const waqiToken = process.env.WAQI_API_KEY || process.env.WAQI_TOKEN;
    if (waqiToken) {
      const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`;
      const resp = await axios.get(url);
      if (resp?.data?.status === 'ok') {
        let nm = resp?.data?.data?.city?.name || null;
        if (typeof nm === 'string' && nm.length) {
          // Clean up station formatting like "Noida - Sector 62, India"
          nm = nm.split(',')[0];
          nm = nm.split(' - ')[0];
          return nm.trim();
        }
      }
    }
  } catch {}

  // 2) Try OpenWeather reverse geocoding (increase limit to 5 and choose best candidate)
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (key) {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${key}`;
      const resp = await axios.get(geoUrl);
      const arr = Array.isArray(resp?.data) ? resp.data : [];
      // Prefer entries explicitly named 'Noida' or large cities (by heuristic on name length)
      const exact = arr.find(x => String(x?.name || '').toLowerCase() === 'noida');
      if (exact?.name) return exact.name;
      if (arr[0]?.name) return arr[0].name;
    }
  } catch {}

  // 3) Fallback to OpenStreetMap Nominatim for administrative city/town
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const resp = await axios.get(nomUrl, { headers: { 'User-Agent': 'EcoWatch/1.0 (+https://github.com/VanshikaYadavs/EcoWatch)' } });
    const addr = resp?.data?.address || {};
    const nm = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || addr.state_district || addr.state;
    if (nm) return nm;
  } catch {}

  // 4) NCR proximity heuristic – prefer major city names by distance
  try {
    const KNOWN_CITIES = [
      { name: 'Noida', lat: 28.5355, lon: 77.3910, radiusKm: 20 },
      { name: 'Delhi', lat: 28.6139, lon: 77.2090, radiusKm: 25 },
      { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, radiusKm: 18 },
      { name: 'Greater Noida', lat: 28.4744, lon: 77.5030, radiusKm: 15 },
      { name: 'Gurugram', lat: 28.4595, lon: 77.0266, radiusKm: 20 },
    ];

    const toRad = n => n * Math.PI / 180;
    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let best = null;
    for (const c of KNOWN_CITIES) {
      const d = haversineKm(lat, lon, c.lat, c.lon);
      if (d <= c.radiusKm) {
        if (!best || d < best.d) best = { name: c.name, d };
      }
    }
    if (best?.name) return best.name;
  } catch {}

  // Final fallback
  return 'User Location';
}


