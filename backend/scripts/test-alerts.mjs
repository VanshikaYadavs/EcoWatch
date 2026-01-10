#!/usr/bin/env node
/**
 * Standalone test script for email alerts
 * Directly triggers ingest and email notifications without HTTP
 * Run: node backend/scripts/test-alerts.mjs
 */

import '../src/loadEnv.mjs';
import { createClient } from '@supabase/supabase-js';
import { ingestOne } from '../src/ingest.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n' + '='.repeat(70));
console.log('🧪 EcoWatch Email Alert Test Script');
console.log('='.repeat(70) + '\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

if (!process.env.SENDGRID_API_KEY) {
  console.warn('⚠️  SENDGRID_API_KEY not set — emails will be rate-limited or fail');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testAlertFlow() {
  try {
    console.log('📍 Step 1: Checking user preferences in Supabase...\n');
    
    const { data: prefs, error: prefError } = await supabaseAdmin
      .from('user_alert_preferences')
      .select('*')
      .eq('email_alerts', true);

    if (prefError) {
      console.error('❌ Failed to fetch preferences:', prefError.message);
      process.exit(1);
    }

    if (!prefs || prefs.length === 0) {
      console.error('❌ No users with email_alerts=true found in Supabase');
      process.exit(1);
    }

    console.log(`✅ Found ${prefs.length} user(s) with alerts enabled:\n`);
    prefs.forEach((p, i) => {
      console.log(`   ${i + 1}. User ID: ${p.user_id}`);
      console.log(`      - AQI threshold: ${p.aqi_threshold}`);
      console.log(`      - Noise threshold: ${p.noise_threshold}`);
      console.log(`      - Temp threshold: ${p.temp_threshold}`);
    });

    console.log('\n📍 Step 2: Creating test reading with values ABOVE thresholds...\n');
    
    // Create a reading that will trigger alerts
    const testReading = {
      location: 'Jaipur',
      latitude: 26.91,
      longitude: 75.78,
      aqi: 250,          // Above threshold 200
      temperature: 45,   // Above threshold 40
      humidity: 60,
      noise_level: 85,   // Above threshold 75
      source: 'test-script',
      recorded_at: new Date().toISOString(),
    };

    console.log('Test Reading Data:');
    console.log(`   Location: ${testReading.location}`);
    console.log(`   AQI: ${testReading.aqi} (threshold: 200)`);
    console.log(`   Noise: ${testReading.noise_level} dB (threshold: 75)`);
    console.log(`   Temperature: ${testReading.temperature}°C (threshold: 40)`);

    console.log('\n📍 Step 3: Running ingestOne() to create alerts...\n');
    
    const result = await ingestOne({
      name: testReading.location,
      lat: testReading.latitude,
      lon: testReading.longitude,
    });

    console.log('✅ Ingest completed successfully');
    console.log(`   Reading ID: ${result.id}\n`);

    console.log('📍 Step 4: Checking alert_events table...\n');
    
    const { data: events, error: eventError } = await supabaseAdmin
      .from('alert_events')
      .select('*')
      .eq('location', 'Jaipur')
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventError) {
      console.error('❌ Failed to fetch events:', eventError.message);
      process.exit(1);
    }

    if (!events || events.length === 0) {
      console.warn('⚠️  No alert events created (thresholds may not have been crossed)');
    } else {
      console.log(`✅ Created ${events.length} alert event(s):\n`);
      events.forEach((evt, i) => {
        console.log(`   ${i + 1}. Type: ${evt.type}`);
        console.log(`      Value: ${evt.value}`);
        console.log(`      Message: ${evt.message}`);
        console.log(`      Created: ${evt.created_at}\n`);
      });
    }

    console.log('📍 Step 5: Email sending logs (check above for [email] lines)...\n');
    
    console.log('✅ Test complete!\n');
    console.log('📧 Next steps:');
    console.log('   1. Check your email inboxes for alert messages');
    console.log('   2. Check SendGrid Activity dashboard for delivery status');
    console.log('   3. View alert_events table in Supabase for created alerts\n');

    console.log('='.repeat(70) + '\n');

    process.exit(0);

  } catch (err) {
    console.error('\n❌ Test failed with error:');
    console.error(err.message);
    console.error('\nFull error:', err);
    process.exit(1);
  }
}

// Run the test
testAlertFlow();
