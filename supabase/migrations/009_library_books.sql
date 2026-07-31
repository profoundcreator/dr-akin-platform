-- Phase 2 CMS: library books with approval workflow and cover uploads
-- Run after 008_site_settings_insert_policy.sql

CREATE TYPE library_book_status AS ENUM (
  'draft',
  'pending_approval',
  'published',
  'hidden'
);

CREATE TABLE library_books (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  subtitle            TEXT,
  year                TEXT,
  category            TEXT NOT NULL,
  description         TEXT NOT NULL,
  cover_image_path    TEXT,
  purchase_links      JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  sort_order          INT NOT NULL DEFAULT 0,
  status              library_book_status NOT NULL DEFAULT 'draft',
  manually_hidden     BOOLEAN NOT NULL DEFAULT false,
  submitted_by        UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_by         UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_at         TIMESTAMPTZ,
  rejection_note      TEXT,
  created_by          UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT library_books_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX library_books_public_idx
  ON library_books (status, manually_hidden, sort_order ASC, title ASC)
  WHERE status = 'published' AND manually_hidden = false;

CREATE UNIQUE INDEX library_books_single_featured_idx
  ON library_books (is_featured)
  WHERE is_featured = true AND status = 'published' AND manually_hidden = false;

CREATE TRIGGER library_books_updated_at
  BEFORE UPDATE ON library_books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION is_library_book_publicly_visible(
  p_status library_book_status,
  p_manually_hidden BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT p_status = 'published' AND NOT p_manually_hidden;
$$;

ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible library books"
  ON library_books FOR SELECT
  TO anon, authenticated
  USING (is_library_book_publicly_visible(status, manually_hidden));

CREATE POLICY "Active admins can read all library books"
  ON library_books FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert library books"
  ON library_books FOR INSERT TO authenticated
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update library books"
  ON library_books FOR UPDATE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  )
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete library books"
  ON library_books FOR DELETE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read book cover images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'book-covers');

CREATE POLICY "Active admins can upload book covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'book-covers'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update book covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'book-covers'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete book covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'book-covers'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );
