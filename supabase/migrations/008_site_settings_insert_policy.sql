-- Allow admins to upsert site settings if the singleton row is missing
-- Run after 007_site_settings.sql

CREATE POLICY "Active admins can insert site settings"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
    AND id = true
  );
