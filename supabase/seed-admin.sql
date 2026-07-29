-- Run AFTER creating a user in Supabase Auth Dashboard (Authentication → Users → Add user)
-- Replace placeholders below with your auth user UUID and email.

INSERT INTO admin_profiles (id, email, full_name, role, account_state, invited_at)
VALUES (
  '<AUTH_USER_UUID>',
  'admin@yourdomain.com',
  'Dr. Akin Akinpelu',
  'super_admin',
  'active',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  account_state = 'active',
  role = 'super_admin',
  updated_at = now();
