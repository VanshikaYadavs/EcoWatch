/**
 * Quick SMS Test Script
 * Tests the SMS notification system using the latest database reading
 * Checks ALL users and sends alerts to those whose thresholds are exceeded
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { sendEnvironmentalAlertSMS } from './src/smsService.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testSMS() {
  console.log('🧪 Testing SMS Alert System - Checking ALL Users...\n');
  
  // Fetch latest reading from database
  console.log('📡 Fetching latest environmental data from database...');
  const { data: readings, error } = await supabaseAdmin
    .from('environment_readings')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1);
  
  if (error || !readings?.length) {
    console.error('Error fetching readings:', error);
    return;
  }
  
  const reading = readings[0];
  console.log(`Latest reading from ${reading.location}:`);
  console.log(`AQI: ${reading.aqi}`);
  console.log(`Temperature: ${reading.temperature}°C`);
  console.log(`Humidity: ${reading.humidity}%`);
  console.log(`Noise: ${reading.noise_level}dB`);
  console.log(`Recorded at: ${reading.recorded_at}\n`);
  
  // Fetch ALL users with SMS alerts enabled
  const { data: prefs, error: prefsError } = await supabaseAdmin
    .from('user_alert_preferences')
    .select('*')
    .eq('sms_alerts', true);
  
  if (prefsError || !prefs?.length) {
    console.log('No users with SMS alerts enabled');
    return;
  }
  
  console.log(`Found ${prefs.length} user(s) with SMS alerts enabled\n`);
  
  // Fetch phone numbers for all SMS-enabled users
  const userIds = prefs.map(p => p.user_id);
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, phone_number')
    .in('id', userIds);
  
  const phoneMap = {};
  if (profiles) {
    profiles.forEach(p => {
      if (p.phone_number) phoneMap[p.id] = p.phone_number;
    });
  }
  
  let totalAlertsSent = 0;
  
  // Check each user's thresholds
  for (const pref of prefs) {
    const phoneNumber = phoneMap[pref.user_id];
    
    if (!phoneNumber) {
      console.log(`⚠️  User ${pref.user_id} has no phone number - skipping`);
      continue;
    }
    
    console.log(`\n👤 Checking user ${pref.user_id}:`);
    console.log(`   Phone: ${phoneNumber}`);
    console.log(`   Thresholds - AQI: ${pref.aqi_threshold}, Temp: ${pref.temp_threshold}, Noise: ${pref.noise_threshold}`);
    
    // Check AQI threshold
    if (pref.aqi_threshold && reading.aqi && Number(reading.aqi) >= Number(pref.aqi_threshold)) {
      console.log(`   ✅ AQI ${reading.aqi} >= ${pref.aqi_threshold} - SENDING ALERT`);
      const result = await sendEnvironmentalAlertSMS(phoneNumber, {
        type: 'AQI',
        value: reading.aqi,
        location: reading.location,
        threshold: pref.aqi_threshold,
      });
      if (result.success) totalAlertsSent++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (pref.aqi_threshold) {
      console.log(`   ❌ AQI ${reading.aqi} < ${pref.aqi_threshold} - no alert`);
    }
    
    // Check Temperature threshold
    if (pref.temp_threshold && reading.temperature && Number(reading.temperature) >= Number(pref.temp_threshold)) {
      console.log(`   ✅ Temperature ${reading.temperature}°C >= ${pref.temp_threshold}°C - SENDING ALERT`);
      const result = await sendEnvironmentalAlertSMS(phoneNumber, {
        type: 'HEAT',
        value: reading.temperature,
        location: reading.location,
        threshold: pref.temp_threshold,
      });
      if (result.success) totalAlertsSent++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (pref.temp_threshold) {
      console.log(`   ❌ Temperature ${reading.temperature}°C < ${pref.temp_threshold}°C - no alert`);
    }
    
    // Check Noise threshold
    if (pref.noise_threshold && reading.noise_level && Number(reading.noise_level) >= Number(pref.noise_threshold)) {
      console.log(`   ✅ Noise ${reading.noise_level}dB >= ${pref.noise_threshold}dB - SENDING ALERT`);
      const result = await sendEnvironmentalAlertSMS(phoneNumber, {
        type: 'NOISE',
        value: reading.noise_level,
        location: reading.location,
        threshold: pref.noise_threshold,
      });
      if (result.success) totalAlertsSent++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (pref.noise_threshold) {
      console.log(`   ❌ Noise ${reading.noise_level}dB < ${pref.noise_threshold}dB - no alert`);
    }
  }

  console.log(`\n✅ Test complete! ${totalAlertsSent} alert(s) sent total.`);
}

testSMS().catch(console.error);
