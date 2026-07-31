-- Run AFTER creating a user in Supabase Auth Dashboard (Authentication → Users → Add user)
-- Replace placeholders below with your auth user UUID and email.

INSERT INTO admin_profiles (id, email, full_name, role, account_state, invited_at, is_founder)
VALUES (
  'paste-user-uid-here',
  'admin@yourdomain.com',
  'Dr. Akin Akinpelu',
  'super_admin',
  'active',
  now(),
  true
)
ON CONFLICT (id) DO UPDATE SET
  account_state = 'active',
  role = 'super_admin',
  is_founder = EXCLUDED.is_founder,
  updated_at = now();

-- Tip: only one account can be founder. Mark the primary Super Admin with is_founder = true.
-- After migration 012_team_admin.sql, you can also mark the founder from Admin → Team.
