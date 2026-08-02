-- Phase E: audit log access control, publish/delete enforcement on CMS tables
-- Requires is_active_admin() / admin_has_role() from earlier migrations.
-- Defines is_writable_admin() here if migration 015 was only partially applied.

CREATE OR REPLACE FUNCTION is_writable_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[]);
$$;

CREATE OR REPLACE FUNCTION is_audit_viewer_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(
    ARRAY['super_admin', 'technical_admin', 'read_only_auditor']::admin_role[]
  );
$$;

CREATE OR REPLACE FUNCTION is_content_approver_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(
    ARRAY['super_admin', 'executive_assistant', 'admin_manager']::admin_role[]
  );
$$;

CREATE OR REPLACE FUNCTION is_content_deleter_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(ARRAY['super_admin', 'admin_manager']::admin_role[]);
$$;

CREATE OR REPLACE FUNCTION enforce_content_publish_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status::text = 'published' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT is_content_approver_admin() THEN
      RAISE EXCEPTION 'Only approvers can publish content.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Audit log: restrict read to oversight roles; block auditor writes
DROP POLICY IF EXISTS "Active admins can read audit events" ON audit_events;
DROP POLICY IF EXISTS "Active admins can insert audit events" ON audit_events;

CREATE POLICY "Audit viewers can read audit events"
  ON audit_events FOR SELECT
  TO authenticated
  USING (is_audit_viewer_admin());

CREATE POLICY "Writable admins can insert audit events"
  ON audit_events FOR INSERT
  TO authenticated
  WITH CHECK (is_writable_admin());

CREATE OR REPLACE FUNCTION log_audit_event(
  p_event_type TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_summary JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role admin_role;
  v_id UUID;
BEGIN
  IF NOT is_writable_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT role INTO v_actor_role FROM admin_profiles WHERE id = auth.uid();

  INSERT INTO audit_events (actor_id, actor_role, event_type, target_type, target_id, summary, metadata)
  VALUES (auth.uid(), v_actor_role, p_event_type, p_target_type, p_target_id, p_summary, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION list_audit_events(p_limit INT DEFAULT 100, p_offset INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  actor_id UUID,
  actor_role admin_role,
  actor_name TEXT,
  actor_email TEXT,
  event_type TEXT,
  target_type TEXT,
  target_id UUID,
  summary JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_audit_viewer_admin() THEN
    RAISE EXCEPTION 'Not authorized to view audit logs.';
  END IF;

  RETURN QUERY
  SELECT
    ae.id,
    ae.actor_id,
    ae.actor_role,
    ap.full_name,
    ap.email,
    ae.event_type,
    ae.target_type,
    ae.target_id,
    ae.summary,
    ae.metadata,
    ae.created_at
  FROM audit_events ae
  LEFT JOIN admin_profiles ap ON ap.id = ae.actor_id
  ORDER BY ae.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
END;
$$;

GRANT EXECUTE ON FUNCTION list_audit_events(INT, INT) TO authenticated;

-- Publish approval triggers (draft/pending -> published)
DROP TRIGGER IF EXISTS enforce_event_publish_approval ON events;
CREATE TRIGGER enforce_event_publish_approval
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION enforce_content_publish_approval();

DROP TRIGGER IF EXISTS enforce_library_book_publish_approval ON library_books;
CREATE TRIGGER enforce_library_book_publish_approval
  BEFORE UPDATE ON library_books
  FOR EACH ROW EXECUTE FUNCTION enforce_content_publish_approval();

DROP TRIGGER IF EXISTS enforce_insight_publish_approval ON insights_articles;
CREATE TRIGGER enforce_insight_publish_approval
  BEFORE UPDATE ON insights_articles
  FOR EACH ROW EXECUTE FUNCTION enforce_content_publish_approval();

DROP TRIGGER IF EXISTS enforce_work_org_publish_approval ON work_orgs;
CREATE TRIGGER enforce_work_org_publish_approval
  BEFORE UPDATE ON work_orgs
  FOR EACH ROW EXECUTE FUNCTION enforce_content_publish_approval();

-- Permanent delete: Super Admin + Admin Manager only
DROP POLICY IF EXISTS "Active admins can delete events" ON events;
CREATE POLICY "Content deleters can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (is_content_deleter_admin());

DROP POLICY IF EXISTS "Active admins can delete library books" ON library_books;
CREATE POLICY "Content deleters can delete library books"
  ON library_books FOR DELETE
  TO authenticated
  USING (is_content_deleter_admin());

DROP POLICY IF EXISTS "Active admins can delete insight articles" ON insights_articles;
CREATE POLICY "Content deleters can delete insight articles"
  ON insights_articles FOR DELETE
  TO authenticated
  USING (is_content_deleter_admin());

DROP POLICY IF EXISTS "Active admins can delete work orgs" ON work_orgs;
CREATE POLICY "Content deleters can delete work orgs"
  ON work_orgs FOR DELETE
  TO authenticated
  USING (is_content_deleter_admin());
