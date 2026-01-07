import { supabaseAdmin } from './index.mjs';

export async function evaluateAndRecordAlerts(reading) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  const { data: prefs, error } = await supabaseAdmin
    .from('user_alert_preferences')
    .select('*')
    .eq('email_alerts', true);
  if (error) throw new Error(error.message);
  if (!prefs?.length) return { created: 0 };

  const items = [];
  for (const p of prefs) {
    // AQI threshold
    if (p.aqi_threshold != null && reading.aqi != null && Number(reading.aqi) >= Number(p.aqi_threshold)) {
      items.push({
        user_id: p.user_id,
        type: 'AQI',
        value: reading.aqi,
        message: `AQI ${reading.aqi} in ${reading.location} exceeds threshold ${p.aqi_threshold}`,
        location: reading.location,
        recorded_at: reading.recorded_at,
      });
    }
    // Noise threshold
    if (p.noise_threshold != null && reading.noise_level != null && Number(reading.noise_level) >= Number(p.noise_threshold)) {
      items.push({
        user_id: p.user_id,
        type: 'NOISE',
        value: reading.noise_level,
        message: `Noise ${reading.noise_level} dB in ${reading.location} exceeds threshold ${p.noise_threshold} dB` ,
        location: reading.location,
        recorded_at: reading.recorded_at,
      });
    }
    // Temperature threshold
    if (p.temp_threshold != null && reading.temperature != null && Number(reading.temperature) >= Number(p.temp_threshold)) {
      items.push({
        user_id: p.user_id,
        type: 'HEAT',
        value: reading.temperature,
        message: `Temperature ${reading.temperature}°C in ${reading.location} exceeds threshold ${p.temp_threshold}°C` ,
        location: reading.location,
        recorded_at: reading.recorded_at,
      });
    }
  }
  if (!items.length) return { created: 0 };

  const { error: insErr } = await supabaseAdmin.from('alert_events').insert(items);
  if (insErr) throw new Error(insErr.message);
  return { created: items.length };
}
