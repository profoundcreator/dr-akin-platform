-- Content planning reviews — interactive decisions and approvals before CMS copy changes
-- Run after 023_admin_session_reliability.sql

CREATE TYPE content_plan_status AS ENUM (
  'draft',
  'pending_review',
  'approved'
);

CREATE TABLE content_plans (
  slug                TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  variables           JSONB NOT NULL DEFAULT '{}'::jsonb,
  decisions           JSONB NOT NULL DEFAULT '{}'::jsonb,
  section_approvals   JSONB NOT NULL DEFAULT '{}'::jsonb,
  checklist           JSONB NOT NULL DEFAULT '{}'::jsonb,
  pages               JSONB NOT NULL DEFAULT '[]'::jsonb,
  status              content_plan_status NOT NULL DEFAULT 'draft',
  approval_note       TEXT NOT NULL DEFAULT '',
  updated_by          UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER content_plans_updated_at
  BEFORE UPDATE ON content_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active admins can read content plans"
  ON content_plans FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Approvers can insert content plans"
  ON content_plans FOR INSERT TO authenticated
  WITH CHECK (
    is_active_admin()
    AND admin_has_role(ARRAY['super_admin', 'executive_assistant', 'admin_manager']::admin_role[])
  );

CREATE POLICY "Approvers can update content plans"
  ON content_plans FOR UPDATE TO authenticated
  USING (
    is_active_admin()
    AND admin_has_role(ARRAY['super_admin', 'executive_assistant', 'admin_manager']::admin_role[])
  )
  WITH CHECK (
    is_active_admin()
    AND admin_has_role(ARRAY['super_admin', 'executive_assistant', 'admin_manager']::admin_role[])
  );

-- Seed AALD + PerformX plan with defaults (pages/decisions/variables from product seed)
INSERT INTO content_plans (
  slug,
  title,
  variables,
  decisions,
  section_approvals,
  checklist,
  pages,
  status,
  approval_note
) VALUES (
  'aald-performx',
  'AALD + PerformX Nexus + Summit 2026',
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  '[]'::jsonb,
  'draft',
  ''
)
ON CONFLICT (slug) DO NOTHING;
