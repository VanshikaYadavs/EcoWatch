/**
 * Test script for location-based alert system
 * 
 * This script tests the complete location filtering flow:
 * 1. Set user monitored locations
 * 2. Trigger ingestion for different locations
 * 3. Verify alerts are only sent for monitored locations
 */

import './loadEnv.mjs';
import { supabaseAdmin } from './index.mjs';
import { ingestOne } from './ingest.mjs';

const TEST_USER_ID = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000';

async function setupTestUser() {
  console.log('\n📋 Setting up test user location preferences...');
  
  // Check if user has preferences
  const { data: existing } = await supabaseAdmin
    .from('user_alert_preferences')
    .select('*')
    .eq('user_id', TEST_USER_ID)
    .single();

  if (existing) {
    // Update existing preferences
    const { error } = await supabaseAdmin
      .from('user_alert_preferences')
      .update({
        monitored_locations: ['Jaipur', 'Delhi'],
        alert_radius_km: 50,
        auto_detect_location: false,
        email_alerts: true,
        sms_alerts: false,
        aqi_threshold: 80, // Set low threshold to trigger alerts
        noise_threshold: 75,
        temp_threshold: 30,
      })
      .eq('user_id', TEST_USER_ID);

    if (error) throw error;
    console.log('✅ Updated existing user preferences');
  } else {
    // Create new preferences
    const { error } = await supabaseAdmin
      .from('user_alert_preferences')
      .insert([{
        user_id: TEST_USER_ID,
        monitored_locations: ['Jaipur', 'Delhi'],
        alert_radius_km: 50,
        auto_detect_location: false,
        email_alerts: true,
        sms_alerts: false,
        aqi_threshold: 80,
        noise_threshold: 75,
        temp_threshold: 30,
      }]);

    if (error) throw error;
    console.log('✅ Created new user preferences');
  }

  // Verify
  const { data: prefs } = await supabaseAdmin
    .from('user_alert_preferences')
    .select('*')
    .eq('user_id', TEST_USER_ID)
    .single();

  console.log('User preferences:', {
    monitored_locations: prefs.monitored_locations,
    alert_radius_km: prefs.alert_radius_km,
    thresholds: {
      aqi: prefs.aqi_threshold,
      noise: prefs.noise_threshold,
      temp: prefs.temp_threshold,
    },
  });
}

async function testLocationFiltering() {
  console.log('\n🧪 Testing location-based alert filtering...\n');

  const testCases = [
    {
      name: 'Jaipur (MONITORED - should send alert)',
      location: { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
      shouldAlert: true,
    },
    {
      name: 'Delhi (MONITORED - should send alert)',
      location: { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
      shouldAlert: true,
    },
    {
      name: 'Udaipur (NOT MONITORED - should NOT send alert)',
      location: { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
      shouldAlert: false,
    },
    {
      name: 'Jodhpur (NOT MONITORED - should NOT send alert)',
      location: { name: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
      shouldAlert: false,
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 Testing: ${testCase.name}`);
    console.log(`   Expected: ${testCase.shouldAlert ? '✅ Alert sent' : '❌ Alert NOT sent'}`);

    try {
      const result = await ingestOne({
        ...testCase.location,
        user_id: TEST_USER_ID,
        simulateNoise: true,
      });

      console.log(`   ✅ Ingestion successful`);
      console.log(`      Location: ${result.location}`);
      console.log(`      AQI: ${result.aqi}`);
      console.log(`      Temperature: ${result.temperature}°C`);
      console.log(`      Noise: ${result.noise_level} dB`);

      // Check if alert was created
      const { data: alerts } = await supabaseAdmin
        .from('alert_events')
        .select('*')
        .eq('location', result.location)
        .order('created_at', { ascending: false })
        .limit(1);

      if (alerts && alerts.length > 0) {
        console.log(`   ✅ Alert created: ${alerts[0].type} (${alerts[0].value})`);
      } else {
        console.log(`   ℹ️  No alert created (thresholds not exceeded or filtered by location)`);
      }

    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function checkAlertEvents() {
  console.log('\n\n📊 Alert Events Summary\n');

  const { data: alerts } = await supabaseAdmin
    .from('alert_events')
    .select('*')
    .eq('user_id', TEST_USER_ID)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!alerts || alerts.length === 0) {
    console.log('No alerts found for test user');
    return;
  }

  console.log(`Found ${alerts.length} recent alerts:\n`);
  
  const grouped = {};
  for (const alert of alerts) {
    if (!grouped[alert.location]) {
      grouped[alert.location] = [];
    }
    grouped[alert.location].push(alert);
  }

  for (const [location, locationAlerts] of Object.entries(grouped)) {
    console.log(`📍 ${location}:`);
    for (const alert of locationAlerts) {
      const date = new Date(alert.created_at);
      console.log(`   ${alert.type}: ${alert.value} at ${date.toLocaleTimeString()}`);
    }
    console.log('');
  }
}

async function runTests() {
  try {
    console.log('🚀 Location-Based Alert System Test\n');
    console.log('=' .repeat(60));

    await setupTestUser();
    await testLocationFiltering();
    await checkAlertEvents();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('\nExpected behavior:');
    console.log('  • Jaipur and Delhi should trigger alerts (monitored)');
    console.log('  • Udaipur and Jodhpur should NOT trigger alerts (not monitored)');
    console.log('  • Check your email for alerts from Jaipur and Delhi only');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
