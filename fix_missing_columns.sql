-- Fix Missing Columns in user_alert_preferences
-- Run this in Supabase SQL Editor

-- Add all missing threshold columns
ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS temp_threshold DOUBLE PRECISION;

ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS humidity_threshold DOUBLE PRECISION;

ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS sms_alerts BOOLEAN NOT NULL DEFAULT false;

-- Add comments
COMMENT ON COLUMN user_alert_preferences.temp_threshold IS 'Temperature threshold in Celsius for heat alerts (e.g., 35 for 35°C)';
COMMENT ON COLUMN user_alert_preferences.humidity_threshold IS 'Humidity percentage threshold for alerts (e.g., 80 for 80%)';
COMMENT ON COLUMN user_alert_preferences.sms_alerts IS 'Enable SMS notifications when environmental thresholds are exceeded';

-- Verify all columns exist
SELECT 
  column_name, 
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_alert_preferences'
ORDER BY column_name;
