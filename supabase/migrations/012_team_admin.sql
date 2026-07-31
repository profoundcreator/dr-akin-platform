-- Team admin — founder protection, team manager access, safe profile updates
-- Run after 011_work_orgs.sql

ALTER TABLE admin_profiles
  ADD COLUMN IF NOT EXISTS is_founder BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS admin_profiles_single_founder_idx
  ON admin_profiles ((is_founder))
  WHERE is_founder = true;

CREATE OR REPLACE FUNCTION is_team_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(ARRAY['super_admin', 'technical_admin', 'admin_manager']::admin_role[]);
$$;

CREATE OR REPLACE FUNCTION is_privileged_team_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(ARRAY['super_admin', 'technical_admin']::admin_role[]);
$$;

CREATE OR REPLACE FUNCTION is_operational_admin_role(p_role admin_role)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_role = ANY(
    ARRAY[
      'admin_manager',
      'executive_assistant',
      'executive_reviewer',
      'inbox_manager',
      'resource_manager',
      'read_only_auditor'
    ]::admin_role[]
  );
$$;

CREATE POLICY "Team managers can read all profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (is_team_manager());

CREATE OR REPLACE FUNCTION protect_founder_admin_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.is_founder THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'The founder account role cannot be changed.';
    END IF;

    IF NEW.account_state IS DISTINCT FROM OLD.account_state
       AND NEW.account_state IN ('suspended', 'revoked') THEN
      RAISE EXCEPTION 'The founder account cannot be suspended or revoked.';
    END IF;

    IF NEW.is_founder IS DISTINCT FROM OLD.is_founder AND NEW.is_founder = false THEN
      RAISE EXCEPTION 'The founder flag cannot be removed from the founder account.';
    END IF;
  END IF;

  IF NEW.is_founder = true AND (OLD.is_founder IS DISTINCT FROM true) THEN
    IF EXISTS (SELECT 1 FROM admin_profiles WHERE is_founder = true AND id <> NEW.id) THEN
      RAISE EXCEPTION 'Only one founder account is allowed.';
    END IF;

    IF NOT admin_has_role(ARRAY['super_admin']::admin_role[]) THEN
      RAISE EXCEPTION 'Only a Super Admin can designate the founder account.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_founder_admin_profile_trigger ON admin_profiles;

CREATE TRIGGER protect_founder_admin_profile_trigger
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_founder_admin_profile();

CREATE OR REPLACE FUNCTION update_admin_team_member(
  p_target_id UUID,
  p_role admin_role DEFAULT NULL,
  p_account_state admin_account_state DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL
)
RETURNS admin_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor admin_profiles%ROWTYPE;
  v_target admin_profiles%ROWTYPE;
  v_new_state admin_account_state;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_actor FROM admin_profiles WHERE id = auth.uid();
  IF v_actor.id IS NULL OR v_actor.account_state <> 'active' THEN
    RAISE EXCEPTION 'Active admin access required.';
  END IF;

  IF NOT is_team_manager() THEN
    RAISE EXCEPTION 'You do not have permission to manage team members.';
  END IF;

  SELECT * INTO v_target FROM admin_profiles WHERE id = p_target_id FOR UPDATE;
  IF v_target.id IS NULL THEN
    RAISE EXCEPTION 'Team member not found.';
  END IF;

  IF v_target.is_founder AND v_actor.id <> v_target.id THEN
    RAISE EXCEPTION 'The founder account can only be updated by the founder themselves.';
  END IF;

  IF p_target_id = v_actor.id AND p_account_state IN ('suspended', 'revoked') THEN
    RAISE EXCEPTION 'You cannot suspend or revoke your own account.';
  END IF;

  IF p_role IS NOT NULL AND p_role IS DISTINCT FROM v_target.role THEN
    IF v_target.is_founder THEN
      RAISE EXCEPTION 'The founder account role cannot be changed.';
    END IF;

    IF is_privileged_team_admin() THEN
      NULL;
    ELSIF v_actor.role = 'admin_manager' THEN
      IF NOT is_operational_admin_role(p_role) OR NOT is_operational_admin_role(v_target.role) THEN
        RAISE EXCEPTION 'Admin Managers can only assign operational roles.';
      END IF;
    ELSE
      RAISE EXCEPTION 'You do not have permission to change roles.';
    END IF;
  END IF;

  IF p_account_state IS NOT NULL AND p_account_state IS DISTINCT FROM v_target.account_state THEN
    IF v_target.is_founder AND p_account_state IN ('suspended', 'revoked') THEN
      RAISE EXCEPTION 'The founder account cannot be suspended or revoked.';
    END IF;

    IF NOT is_privileged_team_admin() AND v_actor.role = 'admin_manager' THEN
      IF NOT is_operational_admin_role(v_target.role) THEN
        RAISE EXCEPTION 'Admin Managers can only manage operational team members.';
      END IF;
    END IF;
  END IF;

  v_new_state := COALESCE(p_account_state, v_target.account_state);

  UPDATE admin_profiles
  SET
    role = COALESCE(p_role, role),
    account_state = v_new_state,
    full_name = COALESCE(NULLIF(trim(p_full_name), ''), full_name),
    session_revoked_at = CASE
      WHEN v_new_state IN ('suspended', 'revoked')
        AND v_new_state IS DISTINCT FROM v_target.account_state
      THEN now()
      ELSE session_revoked_at
    END,
    updated_at = now()
  WHERE id = p_target_id
  RETURNING * INTO v_target;

  RETURN v_target;
END;
$$;

CREATE OR REPLACE FUNCTION mark_admin_as_founder(p_target_id UUID)
RETURNS admin_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target admin_profiles%ROWTYPE;
BEGIN
  IF NOT admin_has_role(ARRAY['super_admin']::admin_role[]) THEN
    RAISE EXCEPTION 'Only a Super Admin can designate the founder account.';
  END IF;

  IF EXISTS (SELECT 1 FROM admin_profiles WHERE is_founder = true) THEN
    RAISE EXCEPTION 'A founder account is already designated.';
  END IF;

  UPDATE admin_profiles
  SET is_founder = true, updated_at = now()
  WHERE id = p_target_id
  RETURNING * INTO v_target;

  IF v_target.id IS NULL THEN
    RAISE EXCEPTION 'Team member not found.';
  END IF;

  RETURN v_target;
END;
$$;

GRANT EXECUTE ON FUNCTION update_admin_team_member(UUID, admin_role, admin_account_state, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_admin_as_founder(UUID) TO authenticated;
