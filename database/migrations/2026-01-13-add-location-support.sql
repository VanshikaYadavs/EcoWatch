-- Migration: Add comprehensive location support to alert system
-- Date: 2026-01-13
-- Purpose: Enable users to select specific locations for monitoring and alerts

-- 1. Add monitored_locations column to user_alert_preferences
ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS monitored_locations TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Add location radius preference (in kilometers)
ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS alert_radius_km INTEGER DEFAULT 50;

-- 3. Add auto_detect_location preference
ALTER TABLE user_alert_preferences 
ADD COLUMN IF NOT EXISTS auto_detect_location BOOLEAN DEFAULT false;

-- 4. Create location_name_mapping table for normalization
CREATE TABLE IF NOT EXISTS location_name_mappings (
  id SERIAL PRIMARY KEY,
  canonical_name TEXT NOT NULL UNIQUE,
  alternate_names TEXT[] NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add index for faster location lookups
CREATE INDEX IF NOT EXISTS idx_location_name_mappings_canonical 
ON location_name_mappings(canonical_name);

-- 6. Insert initial Rajasthan city mappings
INSERT INTO location_name_mappings (canonical_name, alternate_names, latitude, longitude, state)
VALUES 
  ('Jaipur', ARRAY['Jaipur', 'Jaipur Municipal Corporation', 'Police Commissionerate', 'Jaipur City', 'Pink City'], 26.9124, 75.7873, 'Rajasthan'),
  ('Jodhpur', ARRAY['Jodhpur', 'Jodhpur Municipal Corporation', 'Blue City'], 26.2389, 73.0243, 'Rajasthan'),
  ('Udaipur', ARRAY['Udaipur', 'Udaipur Municipal Corporation', 'City of Lakes'], 24.5854, 73.7125, 'Rajasthan'),
  ('Kota', ARRAY['Kota', 'Kota Municipal Corporation'], 25.2138, 75.8648, 'Rajasthan'),
  ('Bikaner', ARRAY['Bikaner', 'Bikaner Municipal Corporation'], 28.0229, 73.3119, 'Rajasthan'),
  ('Ajmer', ARRAY['Ajmer', 'Ajmer Municipal Corporation'], 26.4499, 74.6399, 'Rajasthan'),
  ('Alwar', ARRAY['Alwar', 'Alwar Municipal Corporation'], 27.5530, 76.6346, 'Rajasthan'),
  ('Bharatpur', ARRAY['Bharatpur', 'Bharatpur Municipal Corporation'], 27.2152, 77.4908, 'Rajasthan'),
  ('Sikar', ARRAY['Sikar', 'Sikar Municipal Corporation'], 27.6094, 75.1399, 'Rajasthan'),
  ('Pali', ARRAY['Pali', 'Pali Municipal Corporation'], 25.7711, 73.3234, 'Rajasthan')
ON CONFLICT (canonical_name) DO NOTHING;

-- 7. Create function to normalize location names
CREATE OR REPLACE FUNCTION normalize_location_name(input_name TEXT)
RETURNS TEXT AS $$
DECLARE
  canonical TEXT;
BEGIN
  -- Trim and normalize whitespace
  input_name := TRIM(input_name);
  
  -- Look up in mappings table
  SELECT canonical_name INTO canonical
  FROM location_name_mappings
  WHERE input_name = ANY(alternate_names);
  
  -- Return canonical name if found, otherwise return cleaned input
  RETURN COALESCE(canonical, input_name);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Create index on environment_readings.location for faster filtering
CREATE INDEX IF NOT EXISTS idx_environment_readings_location 
ON environment_readings(location);

-- 9. Add comment for documentation
COMMENT ON COLUMN user_alert_preferences.monitored_locations IS 
'Array of location names the user wants to monitor. Alerts will only be sent for readings from these locations.';

COMMENT ON COLUMN user_alert_preferences.alert_radius_km IS 
'Radius in kilometers for location-based alerts when using geolocation. Default 50km.';

COMMENT ON COLUMN user_alert_preferences.auto_detect_location IS 
'Whether to automatically detect user location and send alerts for nearby readings.';

COMMENT ON TABLE location_name_mappings IS 
'Mapping table to normalize location names from various sources (APIs, manual input) to canonical names.';

-- 10. Set default monitored locations for existing users (Jaipur as example)
-- UPDATE user_alert_preferences 
-- SET monitored_locations = ARRAY['Jaipur']
-- WHERE monitored_locations = ARRAY[]::TEXT[] OR monitored_locations IS NULL;

-- You can run the above UPDATE command manually after reviewing existing user preferences
