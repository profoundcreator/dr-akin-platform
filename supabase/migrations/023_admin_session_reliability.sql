-- Clear session_revoked_at when an admin account becomes active again.
-- Run after 022_submission_notifications.sql.

CREATE OR REPLACE FUNCTION activate_invited_admin()
RETURNS admin_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile admin_profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_profile FROM admin_profiles WHERE id = auth.uid() FOR UPDATE;

  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'Admin profile not found.';
  END IF;

  IF v_profile.account_state = 'active' THEN
    RETURN v_profile;
  END IF;

  IF v_profile.account_state <> 'invited' THEN
    RAISE EXCEPTION 'This account cannot be activated automatically.';
  END IF;

  UPDATE admin_profiles
  SET
    account_state = 'active',
    session_revoked_at = NULL,
    updated_at = now()
  WHERE id = auth.uid()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION activate_invited_admin() TO authenticated;
