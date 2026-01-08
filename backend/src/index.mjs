import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { createClient } from '@supabase/supabase-js';
import { ingestOne } from './ingest.mjs';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

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

// Example: fetch latest readings for a location or sensor type
app.get('/api/readings/latest', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    const { location_id, type, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(Number(limit));

    if (location_id) {
      query = query.eq('location_id', location_id);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Example: insert a new reading (server trusted path)
app.post('/api/readings', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });

    const body = req.body;
    // Expecting: { sensor_id, location_id, type, metric, value, unit, timestamp }
    const { data, error } = await supabaseAdmin
      .from('readings')
      .insert([{ ...body, timestamp: body.timestamp ?? new Date().toISOString() }])
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
    const { name, lat, lon } = req.query;
    if (!name || !lat || !lon) return res.status(400).json({ error: 'name, lat, lon are required' });
    const data = await ingestOne({ name, lat: Number(lat), lon: Number(lon) });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`EcoWatch backend listening on http://localhost:${PORT}`);
});


