-- Admin reliability: invited self-activation, auditor read-only on bookings/inbox
-- Run after 014_insight_hero_images.sql

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
  SET account_state = 'active', updated_at = now()
  WHERE id = auth.uid()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION activate_invited_admin() TO authenticated;

-- Booking requests: auditors may read, not write
DROP POLICY IF EXISTS "Active admins can update booking requests" ON booking_requests;

CREATE POLICY "Writable admins can update booking requests"
  ON booking_requests FOR UPDATE
  TO authenticated
  USING (is_writable_admin())
  WITH CHECK (is_writable_admin());

-- Status events: auditors may read, not insert
DROP POLICY IF EXISTS "Active admins can insert status events" ON booking_status_events;

CREATE POLICY "Writable admins can insert status events"
  ON booking_status_events FOR INSERT
  TO authenticated
  WITH CHECK (is_writable_admin());

-- Documents: auditors may read, not write
DROP POLICY IF EXISTS "Active admins can manage booking documents" ON booking_documents;

CREATE POLICY "Active admins can read booking documents"
  ON booking_documents FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE POLICY "Writable admins can manage booking documents"
  ON booking_documents FOR INSERT
  TO authenticated
  WITH CHECK (is_writable_admin());

CREATE POLICY "Writable admins can update booking documents"
  ON booking_documents FOR UPDATE
  TO authenticated
  USING (is_writable_admin())
  WITH CHECK (is_writable_admin());

CREATE POLICY "Writable admins can delete booking documents"
  ON booking_documents FOR DELETE
  TO authenticated
  USING (is_writable_admin());

-- Enquiries: auditors may read, not write
DROP POLICY IF EXISTS "Active admins can update enquiries" ON enquiries;
DROP POLICY IF EXISTS "Active admins can insert enquiries" ON enquiries;

CREATE POLICY "Writable admins can update enquiries"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (is_writable_admin())
  WITH CHECK (is_writable_admin());

CREATE POLICY "Writable admins can insert enquiries"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (is_writable_admin());
