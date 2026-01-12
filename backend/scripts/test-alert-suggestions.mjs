#!/usr/bin/env node

/**
 * Test script to send alerts with suggestions via email
 * Usage: node scripts/test-alert-suggestions.mjs <email> [aqi] [noise] [temp] [location]
 * 
 * Examples:
 *   node scripts/test-alert-suggestions.mjs user@example.com 350           # High AQI
 *   node scripts/test-alert-suggestions.mjs user@example.com 0 90 0        # High Noise
 *   node scripts/test-alert-suggestions.mjs user@example.com 0 0 42 "Delhi" # High Temp
 *   node scripts/test-alert-suggestions.mjs user@example.com 250 75 38 "Jaipur" # All metrics
 */

import axios from 'axios';

const args = process.argv.slice(2);
const email = args[0];
const aqi = args[1] ? Number(args[1]) : null;
const noise = args[2] ? Number(args[2]) : null;
const temp = args[3] ? Number(args[3]) : null;
const location = args[4] || 'Test Location';

if (!email) {
  console.error('❌ Usage: node test-alert-suggestions.mjs <email> [aqi] [noise] [temp] [location]');
  process.exit(1);
}

const API_URL = process.env.API_URL || 'http://localhost:8083';

console.log('📧 Testing Alert with Suggestions...\n');
console.log(`Email: ${email}`);
console.log(`Location: ${location}`);
if (aqi) console.log(`AQI: ${aqi}`);
if (noise) console.log(`Noise: ${noise} dB`);
if (temp) console.log(`Temperature: ${temp}°C`);
console.log();

const payload = {
  to: email,
  aqi: aqi || undefined,
  noise_level: noise || undefined,
  temperature: temp || undefined,
  location,
};

// Remove undefined values
Object.keys(payload).forEach(key => 
  payload[key] === undefined && delete payload[key]
);

axios
  .post(`${API_URL}/api/test-alert-with-suggestions`, payload)
  .then(res => {
    if (res.data.ok) {
      console.log('✅ Alert sent successfully!\n');
      console.log(`Alert Type: ${res.data.alertType}`);
      if (res.data.suggestions.length > 0) {
        console.log('\n💡 Suggestions included:');
        res.data.suggestions.forEach(s => console.log(`  • ${s}`));
      }
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.response?.data?.error || err.message);
    process.exit(1);
  });
