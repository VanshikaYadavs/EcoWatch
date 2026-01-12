-- Enable SMS alerts for your user account directly in the database
-- This bypasses the UI issue

-- First, find your user ID (replace with your email)
SELECT id, email FROM auth.users WHERE email = 'aadyasingh1807@gmail.com';

-- Copy the ID from above, then run this (replace YOUR_USER_ID):
UPDATE user_alert_preferences 
SET sms_alerts = true
WHERE user_id = 'YOUR_USER_ID';

-- If no preferences exist yet, insert them:
INSERT INTO user_alert_preferences (user_id, sms_alerts, aqi_threshold, noise_threshold, temp_threshold, email_alerts)
VALUES ('YOUR_USER_ID', true, 50, 40, 15, true)
ON CONFLICT (user_id) DO UPDATE 
SET sms_alerts = true;

-- Verify it worked:
SELECT * FROM user_alert_preferences WHERE user_id = 'YOUR_USER_ID';
