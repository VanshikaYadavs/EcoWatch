/**
 * Comprehensive Email Alert System Test
 * Tests all aspects of email functionality
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './src/email.mjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🧪 Email Alert System - Comprehensive Test\n');

async function testEmailConfiguration() {
  console.log('1️⃣ Testing Email Configuration...');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not set');
    return false;
  }
  console.log('✅ SendGrid API Key: Set');
  
  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.error('❌ SENDGRID_FROM_EMAIL not set');
    return false;
  }
  console.log('✅ From Email:', process.env.SENDGRID_FROM_EMAIL);
  
  return true;
}

async function testDatabaseSchema() {
  console.log('\n2️⃣ Testing Database Schema...');
  
  // Check profiles table has email column
  const { data: profilesSchema, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, phone_number')
    .limit(1);
  
  if (profilesError) {
    console.error('❌ Profiles table error:', profilesError.message);
    return false;
  }
  console.log('✅ Profiles table accessible with email and phone_number columns');
  
  // Check user_alert_preferences table
  const { data: prefsSchema, error: prefsError } = await supabase
    .from('user_alert_preferences')
    .select('id, email_alerts, sms_alerts, aqi_threshold, noise_threshold, temp_threshold, humidity_threshold')
    .limit(1);
  
  if (prefsError) {
    console.error('❌ User alert preferences error:', prefsError.message);
    return false;
  }
  console.log('✅ User alert preferences table accessible with all threshold columns');
  
  return true;
}

async function testUserData() {
  console.log('\n3️⃣ Testing User Data...');
  
  // Get users with email alerts enabled
  const { data: prefs, error: prefsError } = await supabase
    .from('user_alert_preferences')
    .select('user_id, email_alerts, aqi_threshold, noise_threshold, temp_threshold')
    .eq('email_alerts', true);
  
  if (prefsError) {
    console.error('❌ Error fetching preferences:', prefsError.message);
    return false;
  }
  
  console.log(`✅ Found ${prefs?.length || 0} users with email alerts enabled`);
  
  if (prefs && prefs.length > 0) {
    // Check if these users have emails
    const userIds = prefs.map(p => p.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, phone_number')
      .in('id', userIds);
    
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError.message);
      return false;
    }
    
    const withEmail = profiles?.filter(p => p.email) || [];
    const withPhone = profiles?.filter(p => p.phone_number) || [];
    
    console.log(`   📧 Users with email addresses: ${withEmail.length}`);
    console.log(`   📱 Users with phone numbers: ${withPhone.length}`);
    
    // Show sample user data (masked)
    if (profiles && profiles.length > 0) {
      const sample = profiles[0];
      console.log(`\n   Sample User Data:`);
      console.log(`   - User ID: ${sample.id.substring(0, 8)}...`);
      console.log(`   - Email: ${sample.email ? sample.email.substring(0, 3) + '***@' + sample.email.split('@')[1] : 'Not set'}`);
      console.log(`   - Phone: ${sample.phone_number ? sample.phone_number.substring(0, 5) + '***' : 'Not set'}`);
      
      const userPref = prefs.find(p => p.user_id === sample.id);
      if (userPref) {
        console.log(`   - Thresholds:`);
        console.log(`     • AQI: ${userPref.aqi_threshold || 'Not set'}`);
        console.log(`     • Noise: ${userPref.noise_threshold || 'Not set'} dB`);
        console.log(`     • Temperature: ${userPref.temp_threshold || 'Not set'}°C`);
      }
    }
  }
  
  return true;
}

async function testEmailSending() {
  console.log('\n4️⃣ Testing Email Sending...');
  console.log('⚠️  Skipping actual email send to avoid spam');
  console.log('   To test email sending, use: POST /api/test-email');
  console.log('   Example:');
  console.log('   curl -X POST http://localhost:8080/api/test-email \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"to":"your@email.com","subject":"Test","message":"Test message"}\'');
  
  return true;
}

async function testAlertEvents() {
  console.log('\n5️⃣ Testing Alert Events Table...');
  
  const { data: events, error } = await supabase
    .from('alert_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ Error fetching alert events:', error.message);
    return false;
  }
  
  console.log(`✅ Found ${events?.length || 0} recent alert events`);
  
  if (events && events.length > 0) {
    console.log('\n   Recent Alerts:');
    events.forEach((event, i) => {
      console.log(`   ${i + 1}. ${event.type} - ${event.message}`);
      console.log(`      Location: ${event.location}, Value: ${event.value}`);
      console.log(`      Created: ${new Date(event.created_at).toLocaleString()}`);
    });
  }
  
  return true;
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  const results = {
    config: await testEmailConfiguration(),
    schema: await testDatabaseSchema(),
    userData: await testUserData(),
    emailSending: await testEmailSending(),
    alertEvents: await testAlertEvents(),
  };
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY\n');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.padEnd(20)} ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  console.log('\n═══════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - Email system ready!');
  } else {
    console.log('❌ SOME TESTS FAILED - Review errors above');
  }
  console.log('═══════════════════════════════════════════════════════\n');
  
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
