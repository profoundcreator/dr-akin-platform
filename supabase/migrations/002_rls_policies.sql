-- Dr. Akin Platform — RLS Policies & RPC Functions

-- ── Helper functions ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
      AND account_state = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION admin_has_role(allowed admin_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
      AND account_state = 'active'
      AND role = ANY(allowed)
  );
$$;

CREATE OR REPLACE FUNCTION is_privileged_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT admin_has_role(ARRAY['super_admin', 'technical_admin']::admin_role[]);
$$;

-- ── Enable RLS ────────────────────────────────────────────────────────────────

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- ── admin_profiles policies ───────────────────────────────────────────────────

CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_active_admin());

CREATE POLICY "Privileged admins can read all profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (is_privileged_admin());

CREATE POLICY "Privileged admins can insert profiles"
  ON admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_privileged_admin());

CREATE POLICY "Privileged admins can update profiles"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (is_privileged_admin())
  WITH CHECK (is_privileged_admin());

-- ── booking_requests policies ─────────────────────────────────────────────────

CREATE POLICY "Active admins can read all booking requests"
  ON booking_requests FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can update booking requests"
  ON booking_requests FOR UPDATE
  TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- No direct public INSERT — use create_booking_request RPC

-- ── booking_status_events policies ──────────────────────────────────────────────

CREATE POLICY "Active admins can read status events"
  ON booking_status_events FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert status events"
  ON booking_status_events FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin());

-- ── booking_documents policies ──────────────────────────────────────────────────

CREATE POLICY "Active admins can manage documents"
  ON booking_documents FOR ALL
  TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- ── enquiries policies ──────────────────────────────────────────────────────────

CREATE POLICY "Active admins can read enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can update enquiries"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

CREATE POLICY "Active admins can insert enquiries"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin());

-- ── audit_events policies (append-only) ───────────────────────────────────────

CREATE POLICY "Active admins can read audit events"
  ON audit_events FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert audit events"
  ON audit_events FOR INSERT
  TO authenticated
  WITH CHECK (is_active_admin());

-- No UPDATE or DELETE policies — append-only by design

-- ── Public RPC: Create booking request ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_booking_request(p_form JSONB, p_source TEXT DEFAULT 'web')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reference TEXT;
  v_token TEXT;
  v_id UUID;
  v_email TEXT;
BEGIN
  -- Validate required fields
  IF p_form->>'name' IS NULL OR length(trim(p_form->>'name')) < 2 THEN
    RAISE EXCEPTION 'Name is required';
  END IF;
  IF p_form->>'email' IS NULL OR position('@' in p_form->>'email') = 0 THEN
    RAISE EXCEPTION 'Valid email is required';
  END IF;
  IF p_form->>'organization' IS NULL OR length(trim(p_form->>'organization')) < 2 THEN
    RAISE EXCEPTION 'Organization is required';
  END IF;
  IF (p_form->>'termsAgreed')::BOOLEAN IS NOT TRUE THEN
    RAISE EXCEPTION 'Terms must be agreed';
  END IF;

  v_reference := generate_booking_reference();
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_email := lower(trim(p_form->>'email'));

  INSERT INTO booking_requests (
    reference, access_token, organizer_email, form_data, submission_source
  ) VALUES (
    v_reference, v_token, v_email, p_form, COALESCE(p_source, 'web')
  ) RETURNING id INTO v_id;

  INSERT INTO booking_status_events (
    booking_request_id, previous_status, new_status, actor, organizer_message
  ) VALUES (
    v_id, NULL, 'Received', 'System',
    'Your booking request has been received.'
  );

  INSERT INTO enquiries (
    source, contact_name, contact_email, contact_phone, organization,
    subject, message, booking_request_id, payload
  ) VALUES (
    'Booking',
    p_form->>'name',
    v_email,
    p_form->>'phone',
    p_form->>'organization',
    COALESCE(p_form->>'eventTitle', 'Booking Request'),
    COALESCE(p_form->>'travelDetails', ''),
    v_id,
    p_form
  );

  RETURN jsonb_build_object(
    'id', v_id,
    'reference', v_reference,
    'access_token', v_token
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_booking_request(JSONB, TEXT) TO anon, authenticated;

-- ── Public RPC: Get booking for organizer ───────────────────────────────────────

CREATE OR REPLACE FUNCTION get_booking_for_organizer(p_reference TEXT, p_access_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_request booking_requests%ROWTYPE;
  v_events JSONB;
  v_documents JSONB;
BEGIN
  SELECT * INTO v_request
  FROM booking_requests
  WHERE upper(reference) = upper(p_reference)
    AND access_token = p_access_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'previousStatus', previous_status,
      'newStatus', new_status,
      'timestamp', created_at,
      'actor', actor,
      'organizerMessage', organizer_message
    ) ORDER BY created_at
  ), '[]'::JSONB)
  INTO v_events
  FROM booking_status_events
  WHERE booking_request_id = v_request.id;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'category', category,
      'uploadedAt', created_at
    ) ORDER BY created_at
  ), '[]'::JSONB)
  INTO v_documents
  FROM booking_documents
  WHERE booking_request_id = v_request.id;

  RETURN jsonb_build_object(
    'id', v_request.id,
    'reference', v_request.reference,
    'status', v_request.status,
    'internalStatus', v_request.internal_status,
    'priority', v_request.priority,
    'assignedEa', (SELECT full_name FROM admin_profiles WHERE id = v_request.assigned_ea_id),
    'conflictDetected', v_request.conflict_detected,
    'form', v_request.form_data,
    'documents', v_documents,
    'statusHistory', v_events,
    'createdAt', v_request.created_at,
    'updatedAt', v_request.updated_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_booking_for_organizer(TEXT, TEXT) TO anon, authenticated;

-- ── Admin RPC: Log audit event ──────────────────────────────────────────────────

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
SET search_path = public, extensions
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;

-- ── Trigger: sync admin last sign-in ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_admin_last_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE admin_profiles
  SET last_sign_in_at = now()
  WHERE id = NEW.id
    AND account_state = 'active';
  RETURN NEW;
END;
$$;

-- Note: Attach to auth.users via Supabase Dashboard webhook or auth hook in production

-- ── Seed helper comment ─────────────────────────────────────────────────────────
-- After creating Super Admin in Supabase Auth Dashboard, run:
-- INSERT INTO admin_profiles (id, email, full_name, role, account_state, invited_at)
-- VALUES ('<auth-user-uuid>', 'admin@example.com', 'Dr. Akin Akinpelu', 'super_admin', 'active', now());
