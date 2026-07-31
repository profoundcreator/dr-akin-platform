-- Phase 4 CMS: work org platforms with approval workflow and hero uploads
-- Run after 010_insights_articles.sql

CREATE TYPE work_org_status AS ENUM (
  'draft',
  'pending_approval',
  'published',
  'hidden'
);

CREATE TABLE work_orgs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT NOT NULL UNIQUE,
  brand_key               TEXT NOT NULL,
  page_title              TEXT NOT NULL,
  pillar_title            TEXT NOT NULL,
  brand_label             TEXT NOT NULL,
  kicker                  TEXT NOT NULL,
  headline                TEXT NOT NULL,
  headline_secondary      TEXT,
  description             TEXT NOT NULL,
  hub_card_description    TEXT NOT NULL,
  sections                JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_label               TEXT,
  cta_href                TEXT,
  secondary_cta_label     TEXT,
  secondary_cta_href      TEXT,
  related_links           JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_image_path         TEXT,
  logo_image_path         TEXT,
  external_url            TEXT,
  sort_order              INT NOT NULL DEFAULT 0,
  status                  work_org_status NOT NULL DEFAULT 'draft',
  manually_hidden         BOOLEAN NOT NULL DEFAULT false,
  submitted_by            UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_by             UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_at             TIMESTAMPTZ,
  rejection_note          TEXT,
  created_by              UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT work_orgs_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX work_orgs_public_idx
  ON work_orgs (status, manually_hidden, sort_order ASC, pillar_title ASC)
  WHERE status = 'published' AND manually_hidden = false;

CREATE TRIGGER work_orgs_updated_at
  BEFORE UPDATE ON work_orgs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION is_work_org_publicly_visible(
  p_status work_org_status,
  p_manually_hidden BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT p_status = 'published' AND NOT p_manually_hidden;
$$;

ALTER TABLE work_orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible work orgs"
  ON work_orgs FOR SELECT
  TO anon, authenticated
  USING (is_work_org_publicly_visible(status, manually_hidden));

CREATE POLICY "Active admins can read all work orgs"
  ON work_orgs FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert work orgs"
  ON work_orgs FOR INSERT TO authenticated
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update work orgs"
  ON work_orgs FOR UPDATE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  )
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete work orgs"
  ON work_orgs FOR DELETE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-org-assets',
  'work-org-assets',
  true,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read work org assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'work-org-assets');

CREATE POLICY "Active admins can upload work org assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'work-org-assets'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update work org assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'work-org-assets'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete work org assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'work-org-assets'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );
