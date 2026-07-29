-- Run this FIRST (002 part 1 of 3)
-- Supabase SQL Editor -> New query -> paste all -> Run without RLS

CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
      AND account_state = 'active'
  );
$fn$;

CREATE OR REPLACE FUNCTION admin_has_role(allowed admin_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
      AND account_state = 'active'
      AND role = ANY(allowed)
  );
$fn$;

CREATE OR REPLACE FUNCTION is_privileged_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT admin_has_role(ARRAY['super_admin', 'technical_admin']::admin_role[]);
$fn$;

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_active_admin());

CREATE POLICY "Privileged admins can read all profiles"
  ON admin_profiles FOR SELECT TO authenticated
  USING (is_privileged_admin());

CREATE POLICY "Privileged admins can insert profiles"
  ON admin_profiles FOR INSERT TO authenticated
  WITH CHECK (is_privileged_admin());

CREATE POLICY "Privileged admins can update profiles"
  ON admin_profiles FOR UPDATE TO authenticated
  USING (is_privileged_admin())
  WITH CHECK (is_privileged_admin());

CREATE POLICY "Active admins can read all booking requests"
  ON booking_requests FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can update booking requests"
  ON booking_requests FOR UPDATE TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can read status events"
  ON booking_status_events FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert status events"
  ON booking_status_events FOR INSERT TO authenticated
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can manage documents"
  ON booking_documents FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can read enquiries"
  ON enquiries FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can update enquiries"
  ON enquiries FOR UPDATE TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can insert enquiries"
  ON enquiries FOR INSERT TO authenticated
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can read audit events"
  ON audit_events FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert audit events"
  ON audit_events FOR INSERT TO authenticated
  WITH CHECK (is_active_admin());
