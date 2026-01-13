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
// GET /api/ingest/now?name=City&lat=..&lon=..&accuracy=.. (auth required; user_id derived from JWT)
app.get('/api/ingest/now', requireAuth, async (req, res) => {
  try {
    let { name, lat, lon, accuracy, timestamp } = req.query;
    const user_id = req.user_id;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
    lat = Number(lat);
    lon = Number(lon);
    accuracy = accuracy ? Number(accuracy) : null;

    // Log request details for monitoring
    console.log(`📥 [ingest/now] Request from user ${user_id}:`);
    console.log(`   Coords: (${lat.toFixed(6)}, ${lon.toFixed(6)})`);
    if (accuracy) console.log(`   GPS Accuracy: ±${accuracy.toFixed(0)}m`);
    if (timestamp) console.log(`   Client timestamp: ${new Date(parseInt(timestamp)).toISOString()}`);

    // Always resolve a canonical city label from coordinates.
    // If a client-provided name differs, prefer the resolved label to avoid mislabeling.
    let canonical = null;
    try { canonical = await resolveLocationName(lat, lon); } catch {}
    const finalName = canonical || name || 'User Location';

    console.log(`[ingest] coords=(${lat},${lon}) finalName="${finalName}" clientName="${name || ''}"`);
    // import ingest dynamically to avoid circular import during module init
    const { ingestOne } = await import('./ingest.mjs');
    const data = await ingestOne({ name: finalName, lat, lon, user_id, accuracy });
    // Redact user_id from API response to avoid exposing identity
    const redacted = data ? {
      id: data.id,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      aqi: data.aqi,
      temperature: data.temperature,
      humidity: data.humidity,
      noise_level: data.noise_level,
      source: data.source,
      recorded_at: data.recorded_at,
      created_at: data.created_at,
    } : null;
    res.json({ data: redacted });
  } catch (err) {
    console.error('❌ [ingest/now] Error:', err);
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

// Get dashboard statistics (public - no auth required)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    // Get latest readings count
    const { count: readingsCount } = await supabaseAdmin
      .from('environment_readings')
      .select('*', { count: 'exact', head: true });

    // Get active sensors (unique locations in last 5 minutes for real-time accuracy)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentReadings } = await supabaseAdmin
      .from('environment_readings')
      .select('location')
      .gte('recorded_at', fiveMinutesAgo);
    
    const activeSensors = new Set(recentReadings?.map(r => r.location) || []).size;

    // Get alerts today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: alertsToday } = await supabaseAdmin
      .from('alert_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // Get average values from recent readings (last 10 minutes for real-time accuracy)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: avgData } = await supabaseAdmin
      .from('environment_readings')
      .select('aqi, temperature, humidity, noise_level')
      .gte('recorded_at', tenMinutesAgo);

    let avgAqi = 0, avgTemp = 0, avgHumidity = 0, avgNoise = 0;
    if (avgData && avgData.length > 0) {
      avgAqi = avgData.reduce((sum, r) => sum + (r.aqi || 0), 0) / avgData.length;
      avgTemp = avgData.reduce((sum, r) => sum + (r.temperature || 0), 0) / avgData.length;
      avgHumidity = avgData.reduce((sum, r) => sum + (r.humidity || 0), 0) / avgData.length;
      avgNoise = avgData.reduce((sum, r) => sum + (r.noise_level || 0), 0) / avgData.length;
    }

    console.log(`📊 [dashboard/stats] Returning stats: ${readingsCount} readings, ${activeSensors} active sensors, ${alertsToday} alerts today`);

    res.json({
      readingsCount: readingsCount || 0,
      activeSensors,
      alertsToday: alertsToday || 0,
      averages: {
        aqi: Math.round(avgAqi),
        temperature: Math.round(avgTemp * 10) / 10,
        humidity: Math.round(avgHumidity),
        noise: Math.round(avgNoise),
      },
      dataWindow: '10 minutes',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[dashboard/stats] Error:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Get map sensors data (public - no auth required)
app.get('/api/dashboard/sensors', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    // Get latest reading per location
    const { data: latestReadings, error } = await supabaseAdmin
      .rpc('get_latest_city_readings_v2')
      .limit(100);

    if (error) {
      // Fallback: get latest 100 readings and group by location
      const { data: allReadings } = await supabaseAdmin
        .from('environment_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(200);

      // Group by location, keep most recent for each
      const locationMap = new Map();
      allReadings?.forEach(reading => {
        if (!locationMap.has(reading.location)) {
          locationMap.set(reading.location, reading);
        }
      });

      const grouped = Array.from(locationMap.values());
      
      const sensors = grouped.map((r, i) => ({
        id: i + 1,
        location: r.location || 'Unknown',
        address: r.location,
        aqi: r.aqi ?? 0,
        noise: r.noise_level ?? 0,
        temperature: r.temperature ?? 0,
        humidity: r.humidity ?? 0,
        status: (r.aqi ?? 0) >= 150 ? 'poor' : (r.aqi ?? 0) >= 100 ? 'moderate' : 'good',
        lat: r.latitude ?? 0,
        lng: r.longitude ?? 0,
        recorded_at: r.recorded_at,
      }));

      return res.json({ sensors, count: sensors.length });
    }

    // Success with RPC
    const sensors = (latestReadings || []).map((r, i) => ({
      id: i + 1,
      location: r.location || 'Unknown',
      address: r.location,
      aqi: r.aqi ?? 0,
      noise: r.noise_level ?? 0,
      temperature: r.temperature ?? 0,
      humidity: r.humidity ?? 0,
      status: (r.aqi ?? 0) >= 150 ? 'poor' : (r.aqi ?? 0) >= 100 ? 'moderate' : 'good',
      lat: r.latitude ?? 0,
      lng: r.longitude ?? 0,
      recorded_at: r.recorded_at,
    }));

    res.json({ sensors, count: sensors.length });
  } catch (err) {
    console.error('[dashboard/sensors] Error:', err);
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

// ===================================================
// LOCATION MANAGEMENT ENDPOINTS
// ===================================================

// Get user's monitored locations
app.get('/api/user/locations', requireAuth, async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
    const userId = req.user_id;

    const { data, error } = await supabaseAdmin
      .from('user_alert_preferences')
      .select('monitored_locations, alert_radius_km, auto_detect_location')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      monitored_locations: data?.monitored_locations || [],
      alert_radius_km: data?.alert_radius_km || 50,
      auto_detect_location: data?.auto_detect_location || false
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Update user's monitored locations
app.put('/api/user/locations', requireAuth, async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
    const userId = req.user_id;
    const { monitored_locations, alert_radius_km, auto_detect_location } = req.body;

    // Validate monitored_locations is an array of strings
    if (monitored_locations && !Array.isArray(monitored_locations)) {
      return res.status(400).json({ error: 'monitored_locations must be an array' });
    }

    // Check if preferences exist
    const { data: existing } = await supabaseAdmin
      .from('user_alert_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    const updates = {};
    if (monitored_locations !== undefined) updates.monitored_locations = monitored_locations;
    if (alert_radius_km !== undefined) updates.alert_radius_km = alert_radius_km;
    if (auto_detect_location !== undefined) updates.auto_detect_location = auto_detect_location;

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabaseAdmin
        .from('user_alert_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select('monitored_locations, alert_radius_km, auto_detect_location')
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ success: true, data });
    } else {
      // Create new preferences
      const { data, error } = await supabaseAdmin
        .from('user_alert_preferences')
        .insert([{ user_id: userId, ...updates }])
        .select('monitored_locations, alert_radius_km, auto_detect_location')
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json({ success: true, data });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Get list of available locations (from location_name_mappings table)
app.get('/api/locations', async (_req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    const { data, error } = await supabaseAdmin
      .from('location_name_mappings')
      .select('canonical_name, latitude, longitude, state')
      .order('canonical_name');

    if (error) return res.status(400).json({ error: error.message });

    res.json({ locations: data || [] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Normalize a location name (convert alternate names to canonical)
app.post('/api/locations/normalize', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
    const { location_name } = req.body;

    if (!location_name || typeof location_name !== 'string') {
      return res.status(400).json({ error: 'location_name is required' });
    }

    // Use the database function we created
    const { data, error } = await supabaseAdmin
      .rpc('normalize_location_name', { input_name: location_name });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ normalized_name: data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Find nearby locations based on coordinates
app.get('/api/locations/nearby', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
    
    const { lat, lon, radius_km } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon query parameters are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = radius_km ? parseFloat(radius_km) : 50;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid lat or lon values' });
    }

    // Get all locations and calculate distances
    const { data: locations, error } = await supabaseAdmin
      .from('location_name_mappings')
      .select('canonical_name, latitude, longitude, state');

    if (error) return res.status(400).json({ error: error.message });

    // Calculate distances using Haversine formula
    const toRad = n => n * Math.PI / 180;
    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearbyLocations = (locations || [])
      .map(loc => ({
        ...loc,
        distance_km: haversineKm(latitude, longitude, parseFloat(loc.latitude), parseFloat(loc.longitude))
      }))
      .filter(loc => loc.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json({ 
      user_location: { latitude, longitude },
      radius_km: radiusKm,
      nearby_locations: nearbyLocations 
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
  const KNOWN_CITIES = [
    { name: 'Noida', lat: 28.5355, lon: 77.3910, radiusKm: 20 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, radiusKm: 25 },
    { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, radiusKm: 18 },
    { name: 'Greater Noida', lat: 28.4744, lon: 77.5030, radiusKm: 15 },
    { name: 'Gurugram', lat: 28.4595, lon: 77.0266, radiusKm: 20 },
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

  // 1) If within a known city radius, prefer that label upfront
  try {
    let best = null;
    for (const c of KNOWN_CITIES) {
      const d = haversineKm(lat, lon, c.lat, c.lon);
      if (d <= c.radiusKm && (!best || d < best.d)) best = { name: c.name, d };
    }
    if (best?.name) return best.name;
  } catch {}

  // 2) WAQI station/city name
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

  // 3) Try OpenWeather reverse geocoding (increase limit to 5 and choose best candidate)
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

  // 4) Fallback to OpenStreetMap Nominatim for administrative city/town
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const resp = await axios.get(nomUrl, { headers: { 'User-Agent': 'EcoWatch/1.0 (+https://github.com/VanshikaYadavs/EcoWatch)' } });
    const addr = resp?.data?.address || {};
    const nm = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || addr.state_district || addr.state;
    if (nm) return nm;
  } catch {}

  // Final fallback
  return 'User Location';
}



