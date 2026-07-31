-- Insight article hero images and optional original-source attribution
-- Run after 013_preloaded_content_controls.sql

ALTER TABLE insights_articles
  ADD COLUMN IF NOT EXISTS hero_image_path TEXT,
  ADD COLUMN IF NOT EXISTS source_label TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'insight-images',
  'insight-images',
  true,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read insight images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'insight-images');

CREATE POLICY "Active admins can upload insight images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'insight-images'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update insight images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'insight-images'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete insight images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'insight-images'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );
