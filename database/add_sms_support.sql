-- Add phone number to profiles table
alter table profiles 
add column if not exists phone_number text;

-- Add SMS alert preferences
alter table user_alert_preferences 
add column if not exists sms_alerts boolean not null default false;

-- Add humidity threshold support
alter table user_alert_preferences 
add column if not exists humidity_threshold double precision;

-- Create index for faster phone lookups
create index if not exists idx_profiles_phone on profiles (phone_number);

-- Comment for documentation
comment on column profiles.phone_number is 'User phone number for SMS alerts (E.164 format recommended, e.g., +911234567890)';
comment on column user_alert_preferences.sms_alerts is 'Enable SMS notifications when environmental thresholds are exceeded';
comment on column user_alert_preferences.humidity_threshold is 'Humidity percentage threshold for alerts (e.g., 80 for 80%)';
