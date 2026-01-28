import './loadEnv.mjs';
import express from 'express';
import morgan from 'morgan';
import axios from 'axios';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { startScheduler } from './scheduler.mjs';

const app = express();
app.use(express.json());
// app.use(morgan('dev'));  // Disable morgan temporarily for testing
// Allow frontend dev origin for cross-origin requests
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

const PORT = process.env.PORT || 8080;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`[startup] PORT=${PORT}, SUPABASE_URL set=${!!SUPABASE_URL}`);

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

// Ping route (simplest possible)
app.get('/api/ping', (_req, res) => {
  console.log(`[ping] Received request`);
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

// Check Supabase connectivity
app.get('/api/check-supabase', async (_req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }
    const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true, message: 'Supabase connection OK', rowCount: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
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
          <li><a href="/api/ping">/api/ping</a> – quick ping test</li>
          <li><a href="/api/check-supabase">/api/check-supabase</a> – Supabase connectivity</li>
          <li><a href="/api/readings/latest">/api/readings/latest</a> – query latest readings</li>
          <li><a href="/api/readings/latest-by-city">/api/readings/latest-by-city</a> – latest row per configured city</li>
          <li><a href="/api/readings/latest-by-cluster?name=noida">/api/readings/latest-by-cluster</a> – latest row per city for a cluster</li>
          <li><a href="/api/ingest/all?demo=1">/api/ingest/all</a> – trigger parallel ingest for preset cities (dev)</li>
          <li><a href="/api/ingest/cluster?name=noida&demo=1">/api/ingest/cluster</a> – ingest all cities in a cluster</li>
          <li><a href="/api/ingest/clusters?demo=1">/api/ingest/clusters</a> – ingest all clusters in parallel</li>
          <li><a href="/api/ingest/now?name=Your%20Location&lat=28.56&lon=77.89&demo=1">/api/ingest/now</a> – trigger one-off ingest (dev demo link)</li>
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

// Auth middleware: derive user_id from Supabase JWT (Authorization: Bearer <token>)
async function requireAuth(req, res, next) {
  try {
    let userId = null;
    const allowDemo = (process.env.ALLOW_DEMO_INGEST === '1') || (process.env.NODE_ENV !== 'production');
    // Dev/demo bypass: allow anonymous ingest when demo=1 is present
    if (allowDemo && req.query?.demo === '1') {
      userId = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000';
    }
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    if (token && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user?.id) userId = data.user.id;
    }
    // Dev fallback: allow explicit user_id via query for testing
    if (!userId && req.query?.user_id) userId = req.query.user_id;
    if (!userId) return res.status(401).json({ error: 'unauthorized: missing auth token' });
    req.user_id = userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'unauthorized' });
  }
}

// Trigger ingestion for a single location
// GET /api/ingest/now?name=City&lat=..&lon=.. (auth required; user_id derived from JWT)
app.get('/api/ingest/now', requireAuth, async (req, res) => {
  try {
    let { name, lat, lon } = req.query;
    const user_id = req.user_id;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
    lat = Number(lat);
    lon = Number(lon);

    // Always resolve a canonical city label from coordinates.
    // If a client-provided name differs, prefer the resolved label to avoid mislabeling.
    let canonical = null;
    try { canonical = await resolveLocationName(lat, lon); } catch {}
    const finalName = canonical || name || 'User Location';

    console.log(`[ingest] coords=(${lat},${lon}) finalName="${finalName}" clientName="${name || ''}"`);
    // import ingest dynamically to avoid circular import during module init
    const { ingestOne } = await import('./ingest.mjs');
    const nearbyFlag = String(req.query?.nearby || '').trim() === '1';
    const targetTable = nearbyFlag ? 'nearby_environment_readings' : 'environment_readings';
    const data = await ingestOne({ name: finalName, lat, lon, user_id, targetTable });
    // Redact user_id from API response to avoid exposing identity
    const redacted = data ? {
      id: data.id,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      aqi: data.aqi,
        pm25: data.pm25,
        pm10: data.pm10,
        o3: data.o3,
        no2: data.no2,
      temperature: data.temperature,
      humidity: data.humidity,
      noise_level: data.noise_level,
      source: data.source,
      recorded_at: data.recorded_at,
      created_at: data.created_at,
    } : null;
      // Additionally route into cluster table based on coordinates
      try {
        const resolvedCluster = resolveClusterByCoords(lat, lon);
        if (resolvedCluster && supabaseAdmin && data) {
          // Try to fetch station name from WAQI; ignore errors
          let stationName = null;
          try { const { fetchAQI } = await import('./ingest.mjs'); const a = await fetchAQI(lat, lon); stationName = a?.station_name || null; } catch {}
          const payload = {
            city: resolvedCluster.name,
            station_name: stationName,
            latitude: lat,
            longitude: lon,
            aqi: data.aqi ?? null,
            pm25: data.pm25 ?? null,
            pm10: data.pm10 ?? null,
            o3: data.o3 ?? null,
            no2: data.no2 ?? null,
            recorded_at: data.recorded_at || new Date().toISOString(),
          };
          const { error: clErr } = await supabaseAdmin.from(resolvedCluster.table).insert([payload]);
          if (clErr) console.warn(`[cluster-insert] ${resolvedCluster.name} failed:`, clErr.message);
        }
      } catch (e) {
        console.warn('[cluster-insert] error:', e?.message || e);
      }
      res.json({ data: redacted });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

<<<<<<< HEAD
// Utility: default city list with approximate coordinates (expandable via env)
function getDefaultCities() {
  // Base NCR set aligned with resolver preferences
  const base = [
    { name: 'Noida', lat: 28.5355, lon: 77.3910 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538 },
    { name: 'Faridabad', lat: 28.4089, lon: 77.3178 },
    { name: 'Gurugram', lat: 28.4595, lon: 77.0266 },
    { name: 'Dadri', lat: 28.5680, lon: 77.5570 },
    { name: 'Greater Noida', lat: 28.4744, lon: 77.5030 },
    // Rajasthan cluster examples
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    { name: 'Tonk', lat: 26.1667, lon: 75.7833 },
    { name: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
    { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
    { name: 'Ajmer', lat: 26.4499, lon: 74.6399 },
  ];
  try {
    // Optional override via JSON array in env: [{"name":"City","lat":..,"lon":..}, ...]
    if (process.env.INGEST_CITIES_JSON) {
      const arr = JSON.parse(process.env.INGEST_CITIES_JSON);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {}
  return base;
}

// Trigger parallel ingest for a set of cities
app.get('/api/ingest/all', requireAuth, async (req, res) => {
  try {
    const user_id = req.user_id;
    const namesParam = (req.query?.cities || '').toString().trim();
    let cities = getDefaultCities();
    if (namesParam) {
      const want = namesParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      cities = cities.filter(c => want.includes(c.name.toLowerCase()));
    }
    if (!cities.length) return res.status(400).json({ error: 'no cities resolved' });

    const { ingestOne } = await import('./ingest.mjs');
    // Soft concurrency control
    const concurrency = Math.min(5, Number(req.query?.concurrency || 4));
    const queue = [...cities];
    const results = [];
    async function worker() {
      while (queue.length) {
        const c = queue.shift();
        try {
          const data = await ingestOne({ name: c.name, lat: c.lat, lon: c.lon, user_id, targetTable: 'environment_readings' });
          results.push({ city: c.name, ok: true, id: data?.id, recorded_at: data?.recorded_at });
        } catch (e) {
          results.push({ city: c.name, ok: false, error: e?.message || String(e) });
        }
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    res.json({ ok: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Latest row per configured city
app.get('/api/readings/latest-by-city', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
    const namesParam = (req.query?.cities || '').toString().trim();
    let cities = getDefaultCities().map(c => c.name);
    if (namesParam) cities = namesParam.split(',').map(s => s.trim()).filter(Boolean);
    const out = {};
    await Promise.all(cities.map(async (city) => {
      const { data, error } = await supabaseAdmin
        .from('environment_readings')
        .select('*')
        .eq('location', city)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      out[city] = error ? null : data || null;
    }));
    res.json({ data: out });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// -----------------------------
// Cluster ingestion and latest fetch
// -----------------------------

export const CLUSTERS = {
  noida: [
    { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538 },
    { name: 'Faridabad', lat: 28.4089, lon: 77.3178 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Dadri', lat: 28.5680, lon: 77.5570 },
  ],
  yamunapuram: [
    { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538 },
    { name: 'Faridabad', lat: 28.4089, lon: 77.3178 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Dadri', lat: 28.5680, lon: 77.5570 },
  ],
  jaipur: [
    { name: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
    { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
    { name: 'Ajmer', lat: 26.4499, lon: 74.6399 },
    { name: 'Tonk', lat: 26.1533, lon: 75.7863 },
  ],
};

const TABLE_MAP = {
  noida: 'noida_cluster_readings',
  yamunapuram: 'yamunapuram_cluster_readings',
  jaipur: 'jaipur_cluster_readings',
};

// City cluster geographic bounds (approximate, sufficient for hackathon)
export const CITY_BOUNDS = {
  jaipur: { name: 'Jaipur', latMin: 26.7, latMax: 27.1, lonMin: 75.6, lonMax: 76.0, table: 'jaipur_cluster_readings' },
  noida: { name: 'Noida', latMin: 28.4, latMax: 28.7, lonMin: 77.2, lonMax: 77.6, table: 'noida_cluster_readings' },
  yamunapuram: { name: 'Yamunapuram', latMin: 28.5, latMax: 28.7, lonMin: 77.7, lonMax: 78.0, table: 'yamunapuram_cluster_readings' },
};

export function resolveClusterByCoords(lat, lon) {
  for (const key of Object.keys(CITY_BOUNDS)) {
    const c = CITY_BOUNDS[key];
    if (lat >= c.latMin && lat <= c.latMax && lon >= c.lonMin && lon <= c.lonMax) {
      return c;
    }
  }
  return null;
}

async function ingestCluster(clusterName) {
  const cities = CLUSTERS[clusterName];
  const defaultTable = TABLE_MAP[clusterName];
  if (!cities || !defaultTable) throw new Error('Invalid cluster');
  const { fetchAQI } = await import('./ingest.mjs');
  await Promise.all(cities.map(async (c) => {
    try {
      const aqiData = await fetchAQI(c.lat, c.lon);
      const resolved = resolveClusterByCoords(c.lat, c.lon) || { name: c.name, table: defaultTable };
      const payload = {
        city: resolved.name,
        station_name: aqiData.station_name || null,
        latitude: c.lat,
        longitude: c.lon,
        aqi: aqiData.aqi ?? null,
        pm25: aqiData.pm25 ?? null,
        pm10: aqiData.pm10 ?? null,
        o3: aqiData.o3 ?? null,
        no2: aqiData.no2 ?? null,
        recorded_at: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from(resolved.table || defaultTable).insert([payload]);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn(`[ingestCluster] ${clusterName}/${c.name} failed:`, e?.message || e);
    }
  }));
}

async function ingestAllClusters() {
  await Promise.all([
    ingestCluster('noida'),
    ingestCluster('yamunapuram'),
    ingestCluster('jaipur'),
  ]);
}

// API: ingest a single cluster
app.get('/api/ingest/cluster', requireAuth, async (req, res) => {
  try {
    const name = (req.query?.name || '').toString().toLowerCase();
    if (!CLUSTERS[name]) return res.status(400).json({ error: 'invalid cluster name' });
    await ingestCluster(name);
    res.json({ ok: true, cluster: name });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// API: ingest all clusters
app.get('/api/ingest/clusters', requireAuth, async (_req, res) => {
  try {
    await ingestAllClusters();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// API: latest per city for a cluster
app.get('/api/readings/latest-by-cluster', async (req, res) => {
  try {
    const name = (req.query?.name || '').toString().toLowerCase();
    const table = TABLE_MAP[name];
    if (!table) return res.status(400).json({ error: 'invalid cluster name' });
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .order('city', { ascending: true })
      .order('recorded_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    const latestByCity = {};
    for (const row of data || []) {
      if (!row?.city) continue;
      if (!latestByCity[row.city]) latestByCity[row.city] = row;
    }
    res.json({ data: latestByCity });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Test email endpoint (dev/debug only)
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to) return res.status(400).json({ error: 'to email is required' });

    const { sendEmail } = await import('./email.mjs');
    const result = await sendEmail({
      to,
      subject: subject || 'EcoWatch Test Email',
      text: message || 'This is a test email from EcoWatch. If you received this, email sending works!',
    });

    if (!result.ok) {
      return res.status(500).json({ error: result.reason || 'Send failed' });
    }
    res.json({ ok: true, message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Test alert with suggestions endpoint (dev/debug only)
app.post('/api/test-alert-with-suggestions', async (req, res) => {
  try {
    const { to, aqi, noise_level, temperature, location } = req.body;
    if (!to) return res.status(400).json({ error: 'to email is required' });

    const { generateSuggestions } = await import('./alerts.mjs');
    const { sendEmail } = await import('./email.mjs');

    // Create a test reading object
    const testReading = {
      aqi: aqi || null,
      noise_level: noise_level || null,
      temperature: temperature || null,
      location: location || 'Test Location',
      recorded_at: new Date().toISOString(),
    };

    // Generate suggestions
    const suggestions = generateSuggestions(testReading);
    const alertType = aqi ? 'AQI' : noise_level ? 'NOISE' : temperature ? 'HEAT' : 'ALERT';
    
    const alertColor = alertType === 'NOISE' ? '#FF6B6B' : alertType === 'AQI' ? '#FFA500' : '#FF9800';
    
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">⚠️ EcoWatch Environmental Alert</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <div style="background: ${alertColor}; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
              <h3 style="margin: 0; font-size: 20px;">${alertType} Alert (Test)</h3>
            </div>
            
            <p style="font-size: 16px; margin: 15px 0;"><strong>📍 Location:</strong> ${testReading.location}</p>
            <p style="font-size: 16px; margin: 15px 0;"><strong>⏰ Time:</strong> ${new Date(testReading.recorded_at).toLocaleString()}</p>
            ${aqi ? `<p style="font-size: 16px; margin: 15px 0;"><strong>💨 AQI:</strong> ${aqi}</p>` : ''}
            ${noise_level ? `<p style="font-size: 16px; margin: 15px 0;"><strong>🔊 Noise:</strong> ${noise_level} dB</p>` : ''}
            ${temperature ? `<p style="font-size: 16px; margin: 15px 0;"><strong>🌡️ Temperature:</strong> ${temperature}°C</p>` : ''}
            
            ${suggestions.length > 0 ? `
            <div style="background: #f0f8e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 14px;">💡 Suggestions:</h4>
              ${suggestions.map(s => `<p style="margin: 8px 0; font-size: 14px; color: #333;">${s}</p>`).join('')}
            </div>
            ` : '<p style="font-size: 14px; color: #999;">No specific suggestions at this time.</p>'}
            
            <div style="background: #e8f4f8; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #555;">Check your EcoWatch dashboard for more details and adjust your alert thresholds if needed.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">© 2026 EcoWatch. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await sendEmail({
      to,
      subject: `🚨 EcoWatch: Test ${alertType} Alert in ${testReading.location}`,
      text: `Test alert for ${testReading.location}. ${suggestions.join(' ')}`,
      html,
    });

    if (!result.ok) {
      return res.status(500).json({ error: result.reason || 'Send failed' });
    }
    
    res.json({ 
      ok: true, 
      message: 'Alert with suggestions sent successfully',
      suggestions: suggestions,
      alertType: alertType
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const server = app.listen(PORT, 'localhost', () => {
  console.log(`[${new Date().toISOString()}] ✅ EcoWatch backend listening on http://localhost:${PORT}`);
  
  // Start the scheduler for automatic data ingestion and alerts
  if (process.env.ENABLE_SCHEDULER !== 'false') {
    startScheduler();
  }
});

server.on('error', (err) => {
  console.error(`[ERROR] Server failed to start: ${err.code} - ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[ERROR] Unhandled rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
  console.error(`[ERROR] Uncaught exception: ${err.message}`);
  process.exit(1);
=======
// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang, sourceLang } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields: text and targetLang' });
    }

    const apiKey = process.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.error('API Key not found in environment');
      return res.status(500).json({ error: 'Translation API key not configured' });
    }

    console.log(`Translating "${text}" to ${targetLang} with API key: ${apiKey.substring(0, 10)}...`);

    const languageCodes = {
      en: 'en',
      hi: 'hi',
      mr: 'mr',
      gu: 'gu',
      pa: 'pa'
    };

    const targetCode = languageCodes[targetLang] || targetLang;
    const url = `https://translation.googleapis.com/language/translate/v2`;
    
    const params = {
      key: apiKey,
      q: text,
      target: targetCode
    };

    // Only add source if it's provided and not 'auto'
    if (sourceLang && sourceLang !== 'auto') {
      params.source = languageCodes[sourceLang] || sourceLang;
    }

    console.log('Sending request to Google API:', { url, params: { ...params, key: 'HIDDEN' } });

    const response = await axios.get(url, { params });

    const translatedText = response.data.data.translations[0].translatedText;
    console.log(`Translation successful: "${text}" → "${translatedText}"`);
    res.json({ translatedText, originalText: text, targetLang });
  } catch (error) {
    console.error('Translation API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`EcoWatch backend listening on http://localhost:${PORT}`);
>>>>>>> translation
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
  const defaultUserId = process.env.DEFAULT_USER_ID || null;
  const allowAnon = process.env.ALLOW_ANON_INGEST === '0';
  const withUser = { ...payload, user_id: payload.user_id ?? defaultUserId ?? null };
  if (!withUser.user_id && !allowAnon) {
    console.warn('Skipping storeReading: missing user_id and ALLOW_ANON_INGEST!=1');
    return;
  }
  const { error } = await supabase.from('environment_readings').insert([withUser]);
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
  // Preference cities with tighter radii to reduce overlap
  const PREFERRED_CITIES = [
    { name: 'Noida', lat: 28.5355, lon: 77.3910, radiusKm: 18 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, radiusKm: 22 },
    { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, radiusKm: 18 },
    { name: 'Faridabad', lat: 28.4089, lon: 77.3178, radiusKm: 18 },
    { name: 'Gurugram', lat: 28.4595, lon: 77.0266, radiusKm: 18 },
    { name: 'Dadri', lat: 28.5680, lon: 77.5570, radiusKm: 12 },
    { name: 'Greater Noida', lat: 28.4744, lon: 77.5030, radiusKm: 14 },
  ];
  const toRad = n => n * Math.PI / 180;
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 1) WAQI station/city name (closest to physical sensor identity)
  try {
    const waqiToken = process.env.WAQI_API_KEY || process.env.WAQI_TOKEN;
    if (waqiToken) {
      const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`;
      const resp = await axios.get(url);
      if (resp?.data?.status === 'ok') {
        let nm = resp?.data?.data?.city?.name || null;
        if (typeof nm === 'string' && nm.length) {
          nm = nm.split(',')[0];
          nm = nm.split(' - ')[0];
          return nm.trim();
        }
      }
    }
  } catch {}

  // 2) OpenWeather reverse geocoding (try to pick exact match among common cities)
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (key) {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${key}`;
      const resp = await axios.get(geoUrl);
      const arr = Array.isArray(resp?.data) ? resp.data : [];
      const prefer = ['noida','delhi','ghaziabad','faridabad','gurugram'];
      for (const p of prefer) {
        const exact = arr.find(x => String(x?.name || '').toLowerCase() === p);
        if (exact?.name) return exact.name;
      }
      if (arr[0]?.name) return arr[0].name;
    }
  } catch {}

  // 3) OpenStreetMap Nominatim administrative city/town
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const resp = await axios.get(nomUrl, { headers: { 'User-Agent': 'EcoWatch/1.0 (+https://github.com/VanshikaYadavs/EcoWatch)' } });
    const addr = resp?.data?.address || {};
    const nm = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || addr.state_district || addr.state;
    if (nm) return nm;
  } catch {}

  // 4) Preference list by NEAREST within threshold (not first-by-order)
  try {
    let best = null;
    for (const c of PREFERRED_CITIES) {
      const d = haversineKm(lat, lon, c.lat, c.lon);
      if (d <= c.radiusKm) {
        if (!best || d < best.d) best = { name: c.name, d };
      }
    }
    if (best) return best.name;
  } catch {}

  // Final fallback
  return 'User Location';
}


