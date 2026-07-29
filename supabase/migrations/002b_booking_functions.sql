-- Run this SECOND (002 part 2 of 3)
-- Supabase SQL Editor -> New query -> paste all -> Run without RLS

CREATE OR REPLACE FUNCTION create_booking_request(p_form JSONB, p_source TEXT DEFAULT 'web')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
DECLARE
  v_reference TEXT;
  v_token TEXT;
  v_id UUID;
  v_email TEXT;
BEGIN
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
$fn$;

GRANT EXECUTE ON FUNCTION create_booking_request(JSONB, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION get_booking_for_organizer(p_reference TEXT, p_access_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
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
$fn$;

GRANT EXECUTE ON FUNCTION get_booking_for_organizer(TEXT, TEXT) TO anon, authenticated;
