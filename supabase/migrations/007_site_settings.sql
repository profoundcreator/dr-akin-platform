-- Phase 1 CMS: site settings (homepage toggles, hero banner) + featured event flag
-- Run after 006_events.sql

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_homepage_featured BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS events_single_homepage_featured_idx
  ON events (is_homepage_featured)
  WHERE is_homepage_featured = true;

CREATE TABLE site_settings (
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

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

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

CREATE POLICY "Active admins can read site settings for admin"
  ON site_settings FOR SELECT TO authenticated
  USING (is_active_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homepage-assets',
  'homepage-assets',
  true,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read homepage assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'homepage-assets');

CREATE POLICY "Active admins can upload homepage assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'homepage-assets'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update homepage assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'homepage-assets'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete homepage assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'homepage-assets'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );
