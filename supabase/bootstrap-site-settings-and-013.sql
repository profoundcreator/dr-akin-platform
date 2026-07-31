-- Run this in Supabase SQL Editor if migration 013 failed with:
--   relation "site_settings" does not exist
--
-- This creates site_settings (from 007) if missing, then applies 013.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING.

CREATE TABLE IF NOT EXISTS site_settings (
  id                         BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  homepage_events_enabled    BOOLEAN NOT NULL DEFAULT true,
  homepage_hero_mode         TEXT NOT NULL DEFAULT 'portrait'
    CHECK (homepage_hero_mode IN ('portrait', 'banner', 'minimal')),
  homepage_banner_image_path TEXT,
  homepage_portrait_image_path TEXT,
  updated_by                 UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'Public can read site settings'
  ) THEN
    CREATE POLICY "Public can read site settings"
      ON site_settings FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'Active admins can update site settings'
  ) THEN
    CREATE POLICY "Active admins can update site settings"
      ON site_settings FOR UPDATE TO authenticated
      USING (
        is_active_admin()
        AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
      )
      WITH CHECK (
        is_active_admin()
        AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'Active admins can read site settings for admin'
  ) THEN
    CREATE POLICY "Active admins can read site settings for admin"
      ON site_settings FOR SELECT TO authenticated
      USING (is_active_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'Active admins can insert site settings'
  ) THEN
    CREATE POLICY "Active admins can insert site settings"
      ON site_settings FOR INSERT TO authenticated
      WITH CHECK (
        is_active_admin()
        AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
        AND id = true
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'site_settings_updated_at'
  ) THEN
    CREATE TRIGGER site_settings_updated_at
      BEFORE UPDATE ON site_settings
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hidden_preloaded_insight_slugs TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hidden_preloaded_book_slugs TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN site_settings.hidden_preloaded_insight_slugs IS
  'Slugs of seed insight articles hidden from the public site by admins.';
COMMENT ON COLUMN site_settings.hidden_preloaded_book_slugs IS
  'Slugs of seed library books hidden from the public site by admins.';
