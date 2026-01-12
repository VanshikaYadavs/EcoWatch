import { supabaseAdmin } from './index.mjs';
import { sendBulkAlertSMS } from './smsService.mjs';

export async function evaluateAndRecordAlerts(reading) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  
  // Fetch user preferences
  const { data: prefs, error } = await supabaseAdmin
    .from('user_alert_preferences')
    .select('*')
    .or('email_alerts.eq.true,sms_alerts.eq.true');
  
  if (error) throw new Error(error.message);
  if (!prefs?.length) return { created: 0, smsSent: 0 };
  
  // Fetch phone numbers for users with SMS alerts enabled
  const smsUserIds = prefs.filter(p => p.sms_alerts).map(p => p.user_id);
  let phoneMap = {};
  if (smsUserIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, phone_number')
      .in('id', smsUserIds);
    if (profiles) {
      phoneMap = Object.fromEntries(profiles.map(p => [p.id, p.phone_number]));
    }
  }

  const items = [];
  const smsQueue = [];
  
  for (const p of prefs) {
    const phoneNumber = phoneMap[p.user_id];
    
    // AQI threshold
    if (p.aqi_threshold != null && reading.aqi != null && Number(reading.aqi) >= Number(p.aqi_threshold)) {
      const alertItem = {
        user_id: p.user_id,
        type: 'AQI',
        value: reading.aqi,
        message: `AQI ${reading.aqi} in ${reading.location} exceeds threshold ${p.aqi_threshold}`,
        location: reading.location,
        recorded_at: reading.recorded_at,
      };
      items.push(alertItem);
      
      // Queue SMS if enabled and phone number exists
      if (p.sms_alerts && phoneNumber) {
        smsQueue.push({
          phoneNumber,
          alert: {
            type: 'AQI',
            value: reading.aqi,
            location: reading.location,
            threshold: p.aqi_threshold,
          },
        });
      }
    }
    
    // Noise threshold
    if (p.noise_threshold != null && reading.noise_level != null && Number(reading.noise_level) >= Number(p.noise_threshold)) {
      const alertItem = {
        user_id: p.user_id,
        type: 'NOISE',
        value: reading.noise_level,
        message: `Noise ${reading.noise_level} dB in ${reading.location} exceeds threshold ${p.noise_threshold} dB`,
        location: reading.location,
        recorded_at: reading.recorded_at,
      };
      items.push(alertItem);
      
      // Queue SMS if enabled and phone number exists
      if (p.sms_alerts && phoneNumber) {
        smsQueue.push({
          phoneNumber,
          alert: {
            type: 'NOISE',
            value: reading.noise_level,
            location: reading.location,
            threshold: p.noise_threshold,
          },
        });
      }
    }
    
    // Temperature threshold
    if (p.temp_threshold != null && reading.temperature != null && Number(reading.temperature) >= Number(p.temp_threshold)) {
      const alertItem = {
        user_id: p.user_id,
        type: 'HEAT',
        value: reading.temperature,
        message: `Temperature ${reading.temperature}°C in ${reading.location} exceeds threshold ${p.temp_threshold}°C`,
        location: reading.location,
        recorded_at: reading.recorded_at,
      };
      items.push(alertItem);
      
      // Queue SMS if enabled and phone number exists
      if (p.sms_alerts && phoneNumber) {
        smsQueue.push({
          phoneNumber,
          alert: {
            type: 'HEAT',
            value: reading.temperature,
            location: reading.location,
            threshold: p.temp_threshold,
          },
        });
      }
    }
    
    // Humidity threshold (new)
    if (p.humidity_threshold != null && reading.humidity != null && Number(reading.humidity) >= Number(p.humidity_threshold)) {
      const alertItem = {
        user_id: p.user_id,
        type: 'HUMIDITY',
        value: reading.humidity,
        message: `Humidity ${reading.humidity}% in ${reading.location} exceeds threshold ${p.humidity_threshold}%`,
        location: reading.location,
        recorded_at: reading.recorded_at,
      };
      items.push(alertItem);
      
      // Queue SMS if enabled and phone number exists
      if (p.sms_alerts && phoneNumber) {
        smsQueue.push({
          phoneNumber,
          alert: {
            type: 'HUMIDITY',
            value: reading.humidity,
            location: reading.location,
            threshold: p.humidity_threshold,
          },
        });
      }
    }
  }
  
  if (!items.length) return { created: 0, smsSent: 0 };

  // Insert alert events into database
  const { error: insErr } = await supabaseAdmin.from('alert_events').insert(items);
  if (insErr) throw new Error(insErr.message);
  
  // Send SMS notifications (non-blocking)
  let smsSent = 0;
  if (smsQueue.length > 0) {
    try {
      const smsResults = await sendBulkAlertSMS(smsQueue);
      smsSent = smsResults.filter(r => r.success).length;
      console.log(`📱 Sent ${smsSent}/${smsQueue.length} SMS alerts`);
    } catch (smsError) {
      console.error('SMS sending error:', smsError.message);
      // Don't fail the entire operation if SMS fails
    }
  }
  
  return { created: items.length, smsSent };
}
