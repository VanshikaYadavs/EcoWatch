-- Quick Database Check for Email/SMS Alerts
-- Copy and paste this into your Supabase SQL Editor

-- Check 1: Verify profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('email', 'phone_number', 'id')
ORDER BY column_name;

-- Check 2: Verify user_alert_preferences structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_alert_preferences'
  AND column_name IN ('email_alerts', 'sms_alerts', 'aqi_threshold', 'noise_threshold', 'temp_threshold', 'humidity_threshold')
ORDER BY column_name;

-- Check 3: Count users with email alerts enabled
SELECT 
  COUNT(*) as total_with_email_alerts,
  COUNT(CASE WHEN email_alerts = true THEN 1 END) as enabled_count
FROM user_alert_preferences;

-- Check 4: Count profiles with email addresses
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(phone_number) as profiles_with_phone
FROM profiles;

-- Check 5: Show users ready to receive email alerts
SELECT 
  p.id,
  p.email,
  p.phone_number,
  uap.email_alerts,
  uap.sms_alerts,
  uap.aqi_threshold,
  uap.noise_threshold,
  uap.temp_threshold,
  uap.humidity_threshold
FROM profiles p
INNER JOIN user_alert_preferences uap ON p.id = uap.user_id
WHERE uap.email_alerts = true
LIMIT 10;

-- Check 6: Recent alert events
SELECT 
  type,
  value,
  message,
  location,
  created_at
FROM alert_events
ORDER BY created_at DESC
LIMIT 10;
