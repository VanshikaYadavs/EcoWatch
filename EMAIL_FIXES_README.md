# Email Alert System - Setup & Fixes Applied

## 🔧 Issues Found & Fixed

### 1. Missing Database Columns ❌ → ✅
**Problem:** `user_alert_preferences` table was missing:
- `temp_threshold` column
- `humidity_threshold` column  
- `sms_alerts` column

**Fix:** Created migration file: `fix_missing_columns.sql`

### 2. Rate Limiting Too Aggressive ✅
**Problem:** 15-minute rate limit could block legitimate alerts during testing

**Fix:** 
- Added `EMAIL_RATE_LIMIT=false` option to disable rate limiting
- Improved logging to show remaining wait time
- Better error messages

### 3. Poor Logging ✅
**Problem:** Hard to debug what was happening with alerts

**Fix:** Added comprehensive logging:
- Shows reading values being evaluated
- Counts users with alerts enabled
- Shows email/phone availability
- Logs each threshold check
- Shows success/failure for each email

### 4. Missing Email Sync ✅
**Problem:** User emails might not be synced from auth.users to profiles

**Fix:** Created complete migration with triggers:
- Auto-syncs email on user creation
- Auto-syncs email on updates
- Backfills existing emails

## 📝 Files Created/Modified

### Database Migrations:
1. `database/migrations/2026-01-13-complete-email-sms-setup.sql` - Complete setup
2. `fix_missing_columns.sql` - Quick fix for missing columns
3. `database/check-email-setup.sql` - Diagnostic queries
4. `database/add_sms_support.sql` - Updated with humidity support

### Backend Files:
1. `backend/src/email.mjs` - Improved rate limiting and logging
2. `backend/src/alerts.mjs` - Enhanced logging and error handling
3. `backend/test-email-system.mjs` - Comprehensive test suite

## 🚀 Setup Instructions

### Step 1: Fix Database Schema
Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns
ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS temp_threshold DOUBLE PRECISION;

ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS humidity_threshold DOUBLE PRECISION;

ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS sms_alerts BOOLEAN NOT NULL DEFAULT false;

-- Add email column to profiles if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create or replace email sync function
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, updated_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id)
  DO UPDATE SET
    email = new.email,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sync_user_email();

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sync_user_email();

-- Backfill existing emails
UPDATE public.profiles
SET email = auth.users.email, updated_at = now()
FROM auth.users
WHERE profiles.id = auth.users.id
  AND (profiles.email IS NULL OR profiles.email = '');
```

### Step 2: Verify Database
Run the diagnostic queries in `database/check-email-setup.sql` to verify everything is set up correctly.

### Step 3: Test Email System
```bash
cd backend
node test-email-system.mjs
```

All tests should pass now! ✅

### Step 4: Test Sending Email
```bash
curl -X POST http://localhost:8080/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com","subject":"Test Alert","message":"Testing EcoWatch email alerts"}'
```

## 📧 How Email Alerts Work

### The Flow:
1. **Scheduler** ingests environmental data every hour
2. **Alerts System** (`alerts.mjs`) evaluates readings against user thresholds
3. For each exceeded threshold:
   - Creates alert event in database
   - Queues SMS (if enabled + phone exists)
   - Queues Email (if enabled + email exists)
4. Sends all queued notifications
5. Logs results

### Email Configuration (.env):
```env
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=alertsandsuggestions@gmail.com
EMAIL_MIN_INTERVAL_MINUTES=15  # Rate limit (optional)
EMAIL_RATE_LIMIT=true  # Set to false for testing (optional)
```

### Alert Types:
- **AQI Alert** - "🚨 High Air Quality Index"
- **Temperature Alert** - "🚨 High Temperature"  
- **Humidity Alert** - "🚨 High Humidity"
- **Noise Alert** - "🚨 High Noise Level"

## 🧪 Testing

### Test 1: Check Database Setup
```sql
-- In Supabase SQL Editor, run:
SELECT * FROM information_schema.columns
WHERE table_name IN ('profiles', 'user_alert_preferences')
ORDER BY table_name, column_name;
```

### Test 2: Check User Configuration
```sql
SELECT 
  p.email,
  uap.email_alerts,
  uap.aqi_threshold,
  uap.temp_threshold
FROM profiles p
JOIN user_alert_preferences uap ON p.id = uap.user_id
WHERE uap.email_alerts = true;
```

### Test 3: Trigger Alert Manually
1. Lower a user's threshold (e.g., AQI threshold to 50)
2. Trigger ingestion: `GET http://localhost:8080/api/ingest/now?demo=1`
3. Check backend logs for email sending
4. Check your email inbox

## 🐛 Debugging

### Check Backend Logs
Look for these log messages:
```
[alerts] Evaluating reading for Jaipur: { aqi: 152, temp: 28, ... }
[alerts] Found 3 users with alerts enabled
[alerts] User profiles: 2 with email, 1 with phone
[alerts] 1 threshold(s) exceeded, 2 emails queued, 1 SMS queued
[email] ✅ Sent to user@example.com - Subject: "🚨 EcoWatch Alert: High Air Quality Index in Jaipur"
📧 Sent 2/2 Email alerts
```

### Common Issues:

**"No users with alerts enabled"**
- Check `user_alert_preferences` table has `email_alerts=true`

**"User profiles: 0 with email"**
- Run the email backfill SQL
- Check `profiles` table has email values

**"Rate limited for user@example.com"**
- Set `EMAIL_RATE_LIMIT=false` in .env for testing
- Wait 15 minutes between alerts to same user

**"SendGrid error: ..."**
- Verify SENDGRID_API_KEY is correct
- Check SendGrid dashboard for delivery status
- Verify sender email is verified in SendGrid

## ✅ Verification Checklist

- [ ] Database has all required columns
- [ ] Email sync triggers are created
- [ ] User profiles have email addresses
- [ ] `user_alert_preferences` has `email_alerts=true` for test users
- [ ] Thresholds are set low enough to trigger
- [ ] SendGrid API key is valid
- [ ] Backend server is running
- [ ] Test email endpoint works
- [ ] Ingestion triggers alerts
- [ ] Email arrives in inbox

## 🎯 Next Steps

1. **Run the database migration** (Step 1 above)
2. **Run the test suite** to verify setup
3. **Test with real data** by triggering ingestion
4. **Monitor logs** to ensure emails are being sent
5. **Check email delivery** in your inbox and SendGrid dashboard

---

All fixes have been applied! The email system should now work smoothly. 📧✨
