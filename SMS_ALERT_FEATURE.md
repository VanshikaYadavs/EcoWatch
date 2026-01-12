# SMS Alert Feature - Implementation Guide

## Overview
The SMS alert feature sends real-time text message notifications to users when environmental parameters (AQI, temperature, humidity, noise levels) exceed configured thresholds.

## Features Implemented

### ✅ Backend Components
1. **SMS Service Module** (`backend/src/smsService.mjs`)
   - Twilio integration for SMS delivery
   - Support for multiple alert types (AQI, Temperature, Noise, Humidity)
   - Bulk SMS sending with rate limiting
   - Phone number validation (E.164 format)

2. **Enhanced Alert System** (`backend/src/alerts.mjs`)
   - Monitors environmental readings against user thresholds
   - Triggers SMS alerts when thresholds are exceeded
   - Supports multiple notification channels (Email + SMS)
   - Logs all alert events to database

3. **Database Schema Updates** (`database/add_sms_support.sql`)
   - Added `phone_number` column to `profiles` table
   - Added `sms_alerts` column to `user_alert_preferences` table
   - Added `humidity_threshold` support

### ✅ Frontend Components
1. **Phone Number Management**
   - User profile phone number input with E.164 format validation
   - Real-time validation feedback
   - Save and update phone numbers

2. **SMS Notification Settings**
   - Toggle SMS alerts on/off
   - Configure thresholds for:
     - Air Quality Index (AQI)
     - Temperature
     - Humidity
     - Noise levels
   - View notification channel preferences

## Setup Instructions

### 1. Database Setup
Run the SQL migration to add phone number and SMS support:

```bash
# In your Supabase SQL editor or using psql
psql -h your-database-host -U postgres -d postgres -f database/add_sms_support.sql
```

Or manually run:
```sql
-- Add phone number to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add SMS alert preferences
ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS sms_alerts BOOLEAN NOT NULL DEFAULT FALSE;

-- Add humidity threshold
ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS humidity_threshold DOUBLE PRECISION;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles (phone_number);
```

### 2. Twilio Account Setup

1. **Create a Twilio Account**
   - Sign up at https://www.twilio.com/
   - Verify your email and phone number
   - Complete the onboarding wizard

2. **Get Your Credentials**
   - Go to https://console.twilio.com/
   - Find your Account SID and Auth Token on the dashboard
   - Get a Twilio phone number (or use your trial number)

3. **Configure Environment Variables**
   Edit `backend/.env` and add:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### 3. Install Dependencies
```bash
cd backend
npm install twilio
```

### 4. Restart Backend Server
```bash
cd backend
npm run dev
```

## Usage

### For End Users

1. **Set Up Phone Number**
   - Navigate to Notification Settings
   - Go to "Notification Channels" tab
   - Enter your phone number in E.164 format (e.g., `+911234567890` for India)
   - Click "Save Phone Number"

2. **Enable SMS Alerts**
   - In the same page, toggle "SMS Notifications" ON
   - The SMS channel card will show as enabled

3. **Configure Thresholds**
   - Go to "Alert Thresholds" tab
   - Set your desired thresholds for:
     - **AQI**: Air quality index (e.g., 100 for unhealthy)
     - **Temperature**: Heat warning (e.g., 35°C)
     - **Humidity**: High humidity (e.g., 80%)
     - **Noise**: Noise level in dB (e.g., 85 dB)
   - Click "Save Settings"

4. **Receive Alerts**
   - When environmental data exceeds your thresholds, you'll receive an SMS like:
   ```
   🚨 EcoWatch Alert
   Air Quality: 150 AQI
   Location: Jaipur
   Threshold: 100
   ⚠️ Poor air quality detected!
   Time: Jan 12, 2026, 3:45 PM
   ```

### For Administrators

1. **Monitor SMS Delivery**
   - Check backend logs for SMS delivery status
   - Look for messages like: `✅ SMS sent to +911234567890: SMxxxxxxxx`

2. **Twilio Dashboard**
   - View SMS logs and delivery status at https://console.twilio.com/
   - Monitor usage and costs
   - Check for failed deliveries

## API Reference

### SMS Service Functions

```javascript
import { sendEnvironmentalAlertSMS, sendBulkAlertSMS } from './smsService.mjs';

// Send single alert
await sendEnvironmentalAlertSMS('+911234567890', {
  type: 'AQI',
  value: 150,
  location: 'Jaipur',
  threshold: 100
});

// Send bulk alerts
await sendBulkAlertSMS([
  {
    phoneNumber: '+911234567890',
    alert: { type: 'AQI', value: 150, location: 'Jaipur', threshold: 100 }
  },
  {
    phoneNumber: '+919876543210',
    alert: { type: 'HEAT', value: 38, location: 'Udaipur', threshold: 35 }
  }
]);
```

## Phone Number Format

**E.164 Format Required**: `+[country code][number]`

Examples:
- India: `+911234567890` (91 is country code)
- USA: `+14155552671` (1 is country code)
- UK: `+447700900123` (44 is country code)

## Alert Types

| Type | Description | Example Message |
|------|-------------|----------------|
| `AQI` | Air Quality Index | "Air Quality: 150 AQI in Jaipur exceeds threshold 100" |
| `HEAT` | High Temperature | "Temperature: 38°C in Jaipur exceeds threshold 35°C" |
| `NOISE` | Noise Pollution | "Noise Level: 90 dB in Jaipur exceeds threshold 85 dB" |
| `HUMIDITY` | High Humidity | "Humidity: 85% in Jaipur exceeds threshold 80%" |

## Cost Considerations

### Twilio Pricing (as of 2024)
- **Trial Account**: Free credits for testing
- **India SMS**: ~₹0.50-1.00 per message
- **USA SMS**: ~$0.0079 per message
- **International rates vary by country**

### Optimization Tips
1. **Rate Limiting**: Built-in 100ms delay between messages
2. **Deduplication**: Only send alerts when thresholds are first exceeded
3. **User Preferences**: Respect user's SMS opt-in/opt-out
4. **Quiet Hours**: Implement time-based restrictions (future enhancement)

## Testing

### Test SMS Sending
```bash
# Using the backend API
curl -X POST http://localhost:8080/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+911234567890",
    "message": "Test alert from EcoWatch"
  }'
```

### Simulate Environmental Alert
```bash
# Trigger a reading that exceeds thresholds
curl -X GET "http://localhost:8080/api/ingest/now?name=Jaipur&lat=26.91&lon=75.78"
```

## Troubleshooting

### Issue: SMS not being sent
**Check:**
- ✅ Twilio credentials are correctly set in `.env`
- ✅ Phone number is saved in user profile
- ✅ `sms_alerts` is enabled in user preferences
- ✅ Environmental reading exceeds user's threshold
- ✅ Backend logs show "SMS sent" message

### Issue: Invalid phone number error
**Solution:**
- Use E.164 format: `+[country code][number]`
- Remove spaces, dashes, and parentheses
- Include country code (e.g., +91 for India)

### Issue: Twilio authentication error
**Solution:**
- Verify Account SID and Auth Token are correct
- Check if Twilio account is active (not suspended)
- Ensure phone number is verified in Twilio dashboard

## Security Considerations

1. **Environment Variables**: Never commit Twilio credentials to git
2. **Phone Number Privacy**: Phone numbers are stored securely in database
3. **Rate Limiting**: Prevents SMS spam and excessive costs
4. **User Consent**: Users must explicitly opt-in for SMS alerts
5. **Input Validation**: Phone numbers are validated before saving

## Future Enhancements

- [ ] SMS verification (OTP)
- [ ] Quiet hours support (no SMS during night time)
- [ ] SMS delivery confirmation tracking
- [ ] Multi-language SMS support
- [ ] SMS cost tracking and budgets
- [ ] Batch SMS optimization
- [ ] Alternative SMS providers (AWS SNS, MessageBird)
- [ ] Two-way SMS support (reply to alerts)

## Related Files

### Backend
- `backend/src/smsService.mjs` - SMS service implementation
- `backend/src/alerts.mjs` - Alert evaluation and triggering
- `backend/src/ingest.mjs` - Environmental data ingestion
- `backend/.env` - Configuration (Twilio credentials)

### Frontend
- `frontend/src/pages/notification-setting/` - Notification settings UI
- `frontend/src/utils/profileService.js` - Profile management
- `frontend/src/utils/preferences.js` - Alert preferences

### Database
- `database/add_sms_support.sql` - Schema migration
- `database/schema.sql` - Full database schema

## Support

For issues or questions:
1. Check Twilio dashboard for SMS delivery status
2. Review backend logs for error messages
3. Verify database schema is updated correctly
4. Test with Twilio's test credentials first

## License

This feature is part of the EcoWatch environmental monitoring system.
