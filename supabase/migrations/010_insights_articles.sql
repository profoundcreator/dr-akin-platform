-- Phase 3 CMS: insights articles with approval workflow and rich text body
-- Run after 009_library_books.sql

CREATE TYPE insight_article_status AS ENUM (
  'draft',
  'pending_approval',
  'published',
  'hidden'
);

CREATE TABLE insights_articles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT NOT NULL UNIQUE,
  title                   TEXT NOT NULL,
  category                TEXT NOT NULL,
  summary                 TEXT NOT NULL,
  body                    TEXT NOT NULL DEFAULT '',
  published_at            TIMESTAMPTZ,
  sort_order              INT NOT NULL DEFAULT 0,
  is_homepage_featured    BOOLEAN NOT NULL DEFAULT false,
  homepage_feature_order  INT,
  status                  insight_article_status NOT NULL DEFAULT 'draft',
  manually_hidden         BOOLEAN NOT NULL DEFAULT false,
  submitted_by            UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_by             UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_at             TIMESTAMPTZ,
  rejection_note          TEXT,
  created_by              UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT insights_articles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT insights_articles_homepage_order_range CHECK (
    homepage_feature_order IS NULL OR homepage_feature_order BETWEEN 1 AND 3
  )
);

CREATE INDEX insights_articles_public_idx
  ON insights_articles (status, manually_hidden, published_at DESC, sort_order ASC)
  WHERE status = 'published' AND manually_hidden = false;

CREATE UNIQUE INDEX insights_articles_homepage_feature_order_idx
  ON insights_articles (homepage_feature_order)
  WHERE is_homepage_featured = true
    AND status = 'published'
    AND manually_hidden = false
    AND homepage_feature_order IS NOT NULL;

CREATE TRIGGER insights_articles_updated_at
  BEFORE UPDATE ON insights_articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION is_insight_article_publicly_visible(
  p_status insight_article_status,
  p_manually_hidden BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT p_status = 'published' AND NOT p_manually_hidden;
$$;

ALTER TABLE insights_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible insight articles"
  ON insights_articles FOR SELECT
  TO anon, authenticated
  USING (is_insight_article_publicly_visible(status, manually_hidden));

CREATE POLICY "Active admins can read all insight articles"
  ON insights_articles FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert insight articles"
  ON insights_articles FOR INSERT TO authenticated
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update insight articles"
  ON insights_articles FOR UPDATE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  )
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete insight articles"
  ON insights_articles FOR DELETE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );
