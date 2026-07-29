-- Run this THIRD (002 part 3 of 3)
-- Supabase SQL Editor -> New query -> paste all -> Run without RLS

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
AS $fn$
DECLARE
  v_actor_role admin_role;
  v_id UUID;
BEGIN
  IF NOT is_active_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT role INTO v_actor_role FROM admin_profiles WHERE id = auth.uid();

  INSERT INTO audit_events (actor_id, actor_role, event_type, target_type, target_id, summary, metadata)
  VALUES (auth.uid(), v_actor_role, p_event_type, p_target_type, p_target_id, p_summary, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION sync_admin_last_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  UPDATE admin_profiles
  SET last_sign_in_at = now()
  WHERE id = NEW.id
    AND account_state = 'active';
  RETURN NEW;
END;
$fn$;
