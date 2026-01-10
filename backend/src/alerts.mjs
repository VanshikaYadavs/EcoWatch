export async function evaluateAndRecordAlerts(reading) {
  // Resolve supabaseAdmin at runtime to avoid circular imports
  const { supabaseAdmin } = await import('./index.mjs');
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
  console.log(`[alerts] Created ${items.length} alert event(s)`);

  // Fire-and-forget email notifications (best-effort)
  try {
    const { sendEmail } = await import('./email.mjs');
    for (const it of items) {
      try {
        // Try to resolve user's email via admin API
        let email = null;
        try {
          const resp = await supabaseAdmin.auth.admin.getUserById(it.user_id);
          email = resp?.data?.user?.email || resp?.data?.email || null;
        } catch (e) {
          // some supabase versions may return different shapes; fallback to users table query
        }
        if (!email) {
          const { data: userRow } = await supabaseAdmin.from('auth.users').select('email').eq('id', it.user_id).maybeSingle();
          email = userRow?.email || null;
        }

        if (!email) {
          console.warn(`[alerts] No email for user ${it.user_id}`);
          continue;
        }

        const subject = `🚨 EcoWatch: ${it.type} Alert in ${it.location}`;
        const text = `${it.message} (recorded at ${it.recorded_at})`;
        
        const alertColor = it.type === 'NOISE' ? '#FF6B6B' : it.type === 'AQI' ? '#FFA500' : '#FF9800';
        const html = `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; font-size: 24px;">⚠️ EcoWatch Environmental Alert</h2>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                <div style="background: ${alertColor}; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
                  <h3 style="margin: 0; font-size: 20px;">${it.type} Alert</h3>
                </div>
                
                <p style="font-size: 16px; margin: 15px 0;"><strong>📍 Location:</strong> ${it.location}</p>
                <p style="font-size: 16px; margin: 15px 0;"><strong>⏰ Time:</strong> ${new Date(it.recorded_at).toLocaleString()}</p>
                <p style="font-size: 16px; margin: 15px 0;"><strong>ℹ️ Details:</strong> ${it.message}</p>
                
                <div style="background: #e8f4f8; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #555;">Check your EcoWatch dashboard for more details and adjust your alert thresholds if needed.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="font-size: 12px; color: #999;">You received this email because you enabled alerts for ${it.type} in EcoWatch.</p>
                  <p style="font-size: 12px; color: #999;">© 2026 EcoWatch. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;
        
        const result = await sendEmail({ to: email, subject, text, html, userId: it.user_id });
        console.log(`[alerts] Email to ${email} (${it.type}): ${result.ok ? 'OK' : result.reason}`);
      } catch (e) {
        console.warn(`[alerts] Error notifying user ${it.user_id}: ${e?.message}`);
      }
    }
  } catch (e) {
    console.warn(`[alerts] Email subsystem error: ${e?.message}`);
  }

  return { created: items.length };
}
