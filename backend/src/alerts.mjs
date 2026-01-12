import { supabaseAdmin } from './index.mjs';
import { sendBulkAlertSMS } from './smsService.mjs';
import { sendEmail } from './email.mjs';
import { generateAlertEmail } from './emailTemplate.mjs';

export async function evaluateAndRecordAlerts(reading) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  
  console.log(`[alerts] Evaluating reading for ${reading.location}:`, {
    aqi: reading.aqi,
    temp: reading.temperature,
    humidity: reading.humidity,
    noise: reading.noise_level
  });
  
  // Fetch user preferences
  const { data: prefs, error } = await supabaseAdmin
    .from('user_alert_preferences')
    .select('*')
    .or('email_alerts.eq.true,sms_alerts.eq.true');
  
  if (error) throw new Error(error.message);
  if (!prefs?.length) {
    console.log('[alerts] No users with alerts enabled');
    return { created: 0, smsSent: 0, emailSent: 0 };
  }
  
  console.log(`[alerts] Found ${prefs.length} users with alerts enabled`);
  
  // Fetch user profiles (phone numbers and emails)
  const userIds = prefs.map(p => p.user_id);
  let userProfiles = {};
  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, phone_number, email')
      .in('id', userIds);
    if (profileError) {
      console.error('[alerts] Error fetching profiles:', profileError.message);
    } else if (profiles) {
      userProfiles = Object.fromEntries(profiles.map(p => [p.id, p]));
      const emailCount = profiles.filter(p => p.email).length;
      const phoneCount = profiles.filter(p => p.phone_number).length;
      console.log(`[alerts] User profiles: ${emailCount} with email, ${phoneCount} with phone`);
    }
  }

  const items = [];
  const smsQueue = [];
  const emailQueue = [];
  
  for (const p of prefs) {
    const userProfile = userProfiles[p.user_id];
    const phoneNumber = userProfile?.phone_number;
    const email = userProfile?.email;
    
    // ===== LOCATION FILTERING =====
    // Skip if user has monitored_locations set and this reading's location is not in their list
    if (p.monitored_locations && Array.isArray(p.monitored_locations) && p.monitored_locations.length > 0) {
      // Normalize the reading location for comparison
      const normalizedReadingLocation = (reading.location || '').trim();
      console.log(`[alerts] User ${p.user_id} monitors: [${p.monitored_locations.join(', ')}], reading location: "${normalizedReadingLocation}"`);
      const isMonitored = p.monitored_locations.some(loc => {
        const normalizedUserLocation = (loc || '').trim();
        // Case-insensitive partial match to handle variations like "Jaipur" vs "Jaipur Municipal Corporation"
        return normalizedReadingLocation.toLowerCase().includes(normalizedUserLocation.toLowerCase()) ||
               normalizedUserLocation.toLowerCase().includes(normalizedReadingLocation.toLowerCase());
      });
      
      if (!isMonitored) {
        // User is not monitoring this location, skip all alerts for this user
        console.log(`[alerts] ❌ Skipping user ${p.user_id}: "${normalizedReadingLocation}" not in monitored locations`);
        continue;
      }
      console.log(`[alerts] ✅ User ${p.user_id} monitors this location`);
    }
    // ===== END LOCATION FILTERING =====
    
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
      
      // Queue Email if enabled and email exists
      if (p.email_alerts && email) {
        const emailContent = generateAlertEmail({
          type: 'AQI',
          value: reading.aqi,
          location: reading.location,
          threshold: p.aqi_threshold,
        });
        emailQueue.push({
          userId: p.user_id,
          email,
          subject: emailContent.subject,
          text: emailContent.plainText,
          html: emailContent.html,
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
      
      // Queue Email if enabled and email exists
      if (p.email_alerts && email) {
        const emailContent = generateAlertEmail({
          type: 'NOISE',
          value: reading.noise_level,
          location: reading.location,
          threshold: p.noise_threshold,
        });
        emailQueue.push({
          userId: p.user_id,
          email,
          subject: emailContent.subject,
          text: emailContent.plainText,
          html: emailContent.html,
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
      
      // Queue Email if enabled and email exists
      if (p.email_alerts && email) {
        const emailContent = generateAlertEmail({
          type: 'HEAT',
          value: reading.temperature,
          location: reading.location,
          threshold: p.temp_threshold,
        });
        emailQueue.push({
          userId: p.user_id,
          email,
          subject: emailContent.subject,
          text: emailContent.plainText,
          html: emailContent.html,
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
      
      // Queue Email if enabled and email exists
      if (p.email_alerts && email) {
        const emailContent = generateAlertEmail({
          type: 'HUMIDITY',
          value: reading.humidity,
          location: reading.location,
          threshold: p.humidity_threshold,
        });
        emailQueue.push({
          userId: p.user_id,
          email,
          subject: emailContent.subject,
          text: emailContent.plainText,
          html: emailContent.html,
        });
      }
    }
  }
  
  if (!items.length) {
    console.log('[alerts] No thresholds exceeded');
    return { created: 0, smsSent: 0, emailSent: 0 };
  }
  
  console.log(`[alerts] ${items.length} threshold(s) exceeded, ${emailQueue.length} emails queued, ${smsQueue.length} SMS queued`);

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
  
  // Send Email notifications (non-blocking)
  let emailSent = 0;
  if (emailQueue.length > 0) {
    console.log(`[alerts] Sending ${emailQueue.length} email(s)...`);
    try {
      for (const emailData of emailQueue) {
        const result = await sendEmail({
          to: emailData.email,
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
          userId: emailData.userId,
        });
        if (result.ok) {
          emailSent++;
        } else {
          console.error(`[alerts] Failed to send email to ${emailData.email}: ${result.reason}`);
        }
        // Small delay to avoid rate limiting from SendGrid
        if (emailQueue.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      console.log(`📧 Sent ${emailSent}/${emailQueue.length} Email alerts`);
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      // Don't fail the entire operation if email fails
    }
  }
  
  return { created: items.length, smsSent, emailSent };
}
