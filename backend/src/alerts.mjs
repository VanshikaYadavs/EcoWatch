// Generate suggestions based on environmental readings
export function generateSuggestions(reading) {
  const suggestions = [];
  
  // AQI suggestions
  if (reading.aqi != null) {
    const aqi = Number(reading.aqi);
    if (aqi >= 301) {
      suggestions.push('🏠 STAY INDOORS: Avoid all outdoor activities');
      suggestions.push('😷 WEAR N95/KN95 MASK: If you must go outside, use certified masks');
      suggestions.push('🪟 CLOSE ALL WINDOWS: Keep indoor air clean');
      suggestions.push('💨 USE AIR PURIFIER: Run HEPA filters to clean indoor air');
      suggestions.push('🚗 AVOID DRIVING: Vehicle pollution adds to outdoor air quality');
      suggestions.push('🚫 CANCEL OUTDOOR PLANS: Postpone sports, exercise, and outdoor events');
    } else if (aqi >= 201) {
      suggestions.push('🏠 LIMIT OUTDOOR TIME: Minimize time spent outside');
      suggestions.push('😷 WEAR MASK: Use N95 masks for necessary outdoor activities');
      suggestions.push('👥 VULNERABLE GROUPS STAY INDOORS: Children, elderly, and those with respiratory issues should avoid going out');
      suggestions.push('💨 USE AIR PURIFIER: Maintain indoor air quality');
      suggestions.push('🪟 KEEP WINDOWS CLOSED: Reduce outdoor air infiltration');
      suggestions.push('🏃 REDUCE EXERCISE: Avoid strenuous outdoor activities');
    } else if (aqi >= 151) {
      suggestions.push('⚠️ SENSITIVE GROUPS SHOULD LIMIT OUTDOOR ACTIVITIES');
      suggestions.push('😷 WEAR MASK IF GOING OUT: Especially for children, elderly, and people with asthma');
      suggestions.push('🏃 REDUCE STRENUOUS EXERCISE: Avoid heavy workouts outdoors');
      suggestions.push('💨 USE AIR PURIFIER: Improve indoor air quality');
      suggestions.push('🪟 CLOSE WINDOWS WHEN POSSIBLE: Limit outdoor air entry');
      suggestions.push('👨‍👩‍👧‍👦 MONITOR VULNERABLE FAMILY MEMBERS: Watch for symptoms of respiratory distress');
    } else if (aqi >= 101) {
      suggestions.push('⚡ MODERATE AIR QUALITY: Reduce outdoor activities for sensitive groups');
      suggestions.push('😷 CONSIDER MASK: Optional but recommended for people with respiratory conditions');
      suggestions.push('🏃 REDUCE INTENSE EXERCISE: Take breaks during outdoor activities');
      suggestions.push('💨 VENTILATE INDOOR SPACES: Use air purifiers or open windows in less polluted areas');
      suggestions.push('👃 BE AWARE OF SYMPTOMS: Monitor for coughing, shortness of breath');
    }
  }
  
  // Noise suggestions
  if (reading.noise_level != null) {
    const noise = Number(reading.noise_level);
    if (noise >= 85) {
      suggestions.push('🔊 HIGH NOISE EXPOSURE: Limit time in this area');
      suggestions.push('🎧 USE HEARING PROTECTION: Wear earplugs or noise-cancelling headphones');
      suggestions.push('🏠 STAY INDOORS IF POSSIBLE: Keep windows and doors closed');
      suggestions.push('🪟 SEAL WINDOWS & DOORS: Reduce noise infiltration into your home');
      suggestions.push('🎵 USE BACKGROUND SOUND: White noise or soft music can mask noise');
      suggestions.push('⏰ SCHEDULE BREAKS: Take regular breaks from the noise exposure');
    } else if (noise >= 70) {
      suggestions.push('🔊 ELEVATED NOISE LEVELS: Avoid prolonged exposure');
      suggestions.push('🎧 CONSIDER EAR PROTECTION: Use earplugs if staying in the area');
      suggestions.push('🪟 KEEP WINDOWS CLOSED: Reduce noise entering your space');
      suggestions.push('🏠 PREFER QUIETER LOCATIONS: Move to quieter areas if possible');
      suggestions.push('🎵 USE NOISE-MASKING: Soft background music or white noise');
    }
  }
  
  // Temperature suggestions
  if (reading.temperature != null) {
    const temp = Number(reading.temperature);
    if (temp >= 40) {
      suggestions.push('🌡️ EXTREME HEAT ALERT: Minimize outdoor exposure');
      suggestions.push('💧 DRINK WATER CONSTANTLY: Stay hydrated - drink 2-3 liters per hour');
      suggestions.push('🏠 STAY IN AIR-CONDITIONED SPACES: Seek cool, shaded areas immediately');
      suggestions.push('☀️ AVOID DIRECT SUNLIGHT: Do not go out during peak heat hours (10 AM - 4 PM)');
      suggestions.push('👕 WEAR LIGHT CLOTHES: Use lightweight, light-colored, loose-fitting garments');
      suggestions.push('🚫 CANCEL OUTDOOR ACTIVITIES: Postpone sports, exercise, and outdoor work');
      suggestions.push('🧴 APPLY SUNSCREEN: Use SPF 30+ if you must go out');
      suggestions.push('⏰ TAKE COOL BATHS/SHOWERS: Cool down your body temperature regularly');
      suggestions.push('👀 WATCH FOR HEAT STROKE: Dizziness, nausea, headache require immediate medical help');
    } else if (temp >= 35) {
      suggestions.push('☀️ HIGH TEMPERATURE: Exercise caution outdoors');
      suggestions.push('💧 DRINK PLENTY OF WATER: Stay hydrated throughout the day');
      suggestions.push('🚫 AVOID INTENSE EXERCISE: Reduce strenuous outdoor activities');
      suggestions.push('👕 WEAR LIGHT CLOTHING: Light colors and loose-fitting clothes help');
      suggestions.push('⏰ LIMIT TIME OUTDOORS: Reduce duration of outdoor activities');
      suggestions.push('☀️ SEEK SHADE: Use umbrellas or stay in shaded areas');
      suggestions.push('🧴 APPLY SUNSCREEN: Protect skin from UV radiation');
      suggestions.push('👥 MONITOR ELDERLY & CHILDREN: Check on vulnerable people for heat exhaustion');
    }
  }
  
  return suggestions;
}

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
        
        // Generate suggestions based on the reading type and value
        const readingForSuggestions = {
          aqi: it.type === 'AQI' ? it.value : null,
          noise_level: it.type === 'NOISE' ? it.value : null,
          temperature: it.type === 'HEAT' ? it.value : null,
        };
        const suggestions = generateSuggestions(readingForSuggestions);
        
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
                
                ${suggestions.length > 0 ? `
                <div style="background: #f0f8e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h4 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 14px;">💡 Suggestions:</h4>
                  ${suggestions.map(s => `<p style="margin: 8px 0; font-size: 14px; color: #333;">${s}</p>`).join('')}
                </div>
                ` : ''}
                
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
