/**
 * SMS notification service using Twilio
 * Sends SMS alerts to users when environmental thresholds are exceeded
 */
import twilio from 'twilio';

// Initialize Twilio client
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

let twilioClient = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio SMS service initialized');
} else {
  console.warn('⚠️  Twilio credentials not configured. SMS alerts will be disabled.');
  console.warn('   Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
}

/**
 * Send an SMS to a phone number
 * @param {string} to - Recipient phone number (E.164 format: +911234567890)
 * @param {string} message - SMS message body
 * @returns {Promise<object>} - Twilio message object or error
 */
export async function sendSMS(to, message) {
  if (!twilioClient) {
    throw new Error('Twilio client not initialized. Check environment variables.');
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to,
    });
    
    console.log(`✅ SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid, to };
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    return { success: false, error: error.message, to };
  }
}

/**
 * Send environmental alert SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {object} alert - Alert details
 * @returns {Promise<object>}
 */
export async function sendEnvironmentalAlertSMS(phoneNumber, alert) {
  const { type, value, location, threshold, message: customMessage } = alert;
  
  // Format the message
  let messageBody = customMessage || `🚨 EcoWatch Alert: ${type} alert in ${location}`;
  
  // Add details based on alert type
  if (type === 'AQI') {
    messageBody = `🚨 EcoWatch Alert\nAir Quality: ${value} AQI\nLocation: ${location}\nThreshold: ${threshold}\n⚠️ Poor air quality detected!`;
  } else if (type === 'NOISE') {
    messageBody = `🚨 EcoWatch Alert\nNoise Level: ${value} dB\nLocation: ${location}\nThreshold: ${threshold} dB\n⚠️ Excessive noise detected!`;
  } else if (type === 'HEAT') {
    messageBody = `🚨 EcoWatch Alert\nTemperature: ${value}°C\nLocation: ${location}\nThreshold: ${threshold}°C\n⚠️ High temperature detected!`;
  } else if (type === 'HUMIDITY') {
    messageBody = `🚨 EcoWatch Alert\nHumidity: ${value}%\nLocation: ${location}\nThreshold: ${threshold}%\n⚠️ Unusual humidity detected!`;
  }
  
  // Add timestamp
  messageBody += `\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
  
  return sendSMS(phoneNumber, messageBody);
}

/**
 * Send bulk SMS alerts to multiple users
 * @param {Array} alerts - Array of {phoneNumber, alert} objects
 * @returns {Promise<Array>} - Array of results
 */
export async function sendBulkAlertSMS(alerts) {
  if (!twilioClient) {
    console.warn('Twilio not configured, skipping SMS alerts');
    return [];
  }

  const results = [];
  
  // Send SMS sequentially to avoid rate limiting (can be optimized with Promise.all if needed)
  for (const { phoneNumber, alert } of alerts) {
    try {
      const result = await sendEnvironmentalAlertSMS(phoneNumber, alert);
      results.push(result);
      
      // Small delay to respect rate limits (optional)
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error sending SMS to ${phoneNumber}:`, error);
      results.push({ success: false, phoneNumber, error: error.message });
    }
  }
  
  return results;
}

/**
 * Validate phone number format (basic E.164 check)
 * @param {string} phoneNumber
 * @returns {boolean}
 */
export function isValidPhoneNumber(phoneNumber) {
  if (!phoneNumber) return false;
  // Basic E.164 format: +[country code][number] (e.g., +911234567890)
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

export default {
  sendSMS,
  sendEnvironmentalAlertSMS,
  sendBulkAlertSMS,
  isValidPhoneNumber,
};
