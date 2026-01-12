-- Check if your phone number is saved and SMS is enabled
SELECT 
  p.id,
  p.phone_number,
  uap.sms_alerts,
  uap.aqi_threshold,
  uap.noise_threshold,
  uap.temp_threshold
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_alert_preferences uap ON u.id = uap.user_id
WHERE u.email = 'aadyasingh1807@gmail.com';
