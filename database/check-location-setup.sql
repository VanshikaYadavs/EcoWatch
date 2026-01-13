-- Check current location setup and user preferences
-- Run this in Supabase SQL Editor to diagnose location issues

-- 1. Check if user_alert_preferences has location fields
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_alert_preferences'
ORDER BY column_name;

-- 2. Check if profiles table has location fields
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY column_name;

-- 3. Show environment_readings structure
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'environment_readings'
  AND column_name LIKE '%location%' OR column_name LIKE '%lat%' OR column_name LIKE '%lon%'
ORDER BY column_name;

-- 4. Check recent readings and their locations
SELECT 
  location,
  latitude,
  longitude,
  aqi,
  temperature,
  user_id,
  recorded_at
FROM environment_readings
ORDER BY recorded_at DESC
LIMIT 10;

-- 5. Check if users have location preferences set
SELECT 
  uap.user_id,
  p.email,
  uap.email_alerts,
  uap.aqi_threshold,
  'No location preference stored' as issue
FROM user_alert_preferences uap
JOIN profiles p ON p.id = uap.user_id
WHERE uap.email_alerts = true
LIMIT 10;
