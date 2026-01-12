import { supabase } from './supabaseClient';

export async function loadUserPreferences(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_alert_preferences')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data || null;
}

export async function saveUserPreferences(userId, prefs) {
  if (!userId) throw new Error('Missing userId');
  const payload = { user_id: userId, ...mapSettingsToPrefs(prefs) };
  // Upsert by user_id
  const { data, error } = await supabase
    .from('user_alert_preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

function mapSettingsToPrefs(settings) {
  // Map the UI settings shape to DB prefs (simple mapping for MVP)
  return {
    aqi_threshold: settings?.airQuality?.aqiThreshold ?? null,
    noise_threshold: settings?.noise?.thresholdExceeded ?? null,
    temp_threshold: settings?.temperature?.heatWarning ?? null,
    humidity_threshold: settings?.humidity?.thresholdExceeded ?? null,
    email_alerts: settings?.channels?.email ?? true,
    sms_alerts: settings?.channels?.sms ?? false,
  };
}
