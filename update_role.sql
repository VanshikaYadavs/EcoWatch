-- Update your user role to 'official' to access notification settings
-- Replace 'your-user-email@example.com' with your actual email

-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-user-email@example.com';

-- Then update your profile role (use the ID from above)
UPDATE profiles 
SET role = 'official' 
WHERE id = 'paste-your-user-id-here';

-- Verify the change
SELECT * FROM profiles WHERE id = 'paste-your-user-id-here';
