/**
 * Quick SMS Test Script
 * Tests the SMS notification system directly
 */
import 'dotenv/config';
import { sendEnvironmentalAlertSMS } from './src/smsService.mjs';

// Replace with your verified phone number
const TEST_PHONE = '+919430312572'; // Your verified number

async function testSMS() {
  console.log('🧪 Testing SMS Alert System...\n');
  
  // Test 1: AQI Alert
  console.log('📱 Sending AQI test alert...');
  const aqiResult = await sendEnvironmentalAlertSMS(TEST_PHONE, {
    type: 'AQI',
    value: 150,
    location: 'Jaipur',
    threshold: 100,
  });
  console.log('Result:', aqiResult, '\n');

  // Wait a second between messages
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Temperature Alert
  console.log('📱 Sending Temperature test alert...');
  const tempResult = await sendEnvironmentalAlertSMS(TEST_PHONE, {
    type: 'HEAT',
    value: 38,
    location: 'Jaipur',
    threshold: 35,
  });
  console.log('Result:', tempResult, '\n');

  console.log('✅ Test complete! Check your phone for SMS messages.');
}

testSMS().catch(console.error);
