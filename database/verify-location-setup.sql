-- Quick verification of location system setup
-- Run this to check if all components are in place

-- 1. Check if monitored_locations column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_alert_preferences' 
AND column_name IN ('monitored_locations', 'alert_radius_km', 'auto_detect_location');

-- 2. Check if location_name_mappings table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'location_name_mappings';

-- 3. Check available locations
SELECT canonical_name, state, 
       array_length(alternate_names, 1) as alternate_count
FROM location_name_mappings
ORDER BY canonical_name;

-- 4. Test normalize_location_name function
SELECT 
  'Jaipur Municipal Corporation' as input,
  normalize_location_name('Jaipur Municipal Corporation') as normalized;

SELECT 
  'Police Commissionerate' as input,
  normalize_location_name('Police Commissionerate') as normalized;

-- 5. Check user alert preferences with locations
SELECT 
  user_id,
  monitored_locations,
  alert_radius_km,
  auto_detect_location,
  email_alerts,
  sms_alerts
FROM user_alert_preferences
ORDER BY user_id;

-- 6. Count users with/without location preferences
SELECT 
  COUNT(*) FILTER (WHERE monitored_locations IS NULL OR array_length(monitored_locations, 1) = 0) as without_locations,
  COUNT(*) FILTER (WHERE array_length(monitored_locations, 1) > 0) as with_locations
FROM user_alert_preferences;
