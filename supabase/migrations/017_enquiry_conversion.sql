-- Convert a general inbox enquiry into a structured booking request (admin action)
-- Run after 016_phase_e_security.sql

CREATE OR REPLACE FUNCTION convert_enquiry_to_booking(p_enquiry_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_enq enquiries%ROWTYPE;
  v_reference TEXT;
  v_token TEXT;
  v_id UUID;
  v_form JSONB;
BEGIN
  IF NOT is_writable_admin() THEN
    RAISE EXCEPTION 'Not authorized to convert enquiries.';
  END IF;

  SELECT * INTO v_enq FROM enquiries WHERE id = p_enquiry_id FOR UPDATE;

  IF v_enq.id IS NULL THEN
    RAISE EXCEPTION 'Enquiry not found.';
  END IF;

  IF v_enq.booking_request_id IS NOT NULL THEN
    RAISE EXCEPTION 'This enquiry is already linked to a booking request.';
  END IF;

  v_form := jsonb_build_object(
    'name', v_enq.contact_name,
    'email', lower(trim(v_enq.contact_email)),
    'organization', COALESCE(NULLIF(trim(v_enq.organization), ''), 'To be confirmed'),
    'phone', COALESCE(NULLIF(trim(v_enq.contact_phone), ''), 'Pending'),
    'timezone', 'Africa/Lagos',
    'engagementType', 'Keynote',
    'eventTitle', COALESCE(NULLIF(trim(v_enq.subject), ''), 'Engagement request'),
    'audienceSize', 'To be confirmed',
    'format', 'To be confirmed',
    'preferredDate', to_char((CURRENT_DATE + INTERVAL '90 days')::date, 'YYYY-MM-DD'),
    'alternativeDate', '',
    'city', 'To be confirmed',
    'country', 'To be confirmed',
    'travelDetails', COALESCE(v_enq.message, ''),
    'budgetRange', 'To be confirmed',
    'recordingPermission', 'To be confirmed',
    'vipProtocol', '',
    'termsAgreed', true,
    'convertedFromEnquiryId', v_enq.id::text
  );

  v_reference := generate_booking_reference();
  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  INSERT INTO booking_requests (
    reference, access_token, organizer_email, form_data, submission_source
  ) VALUES (
    v_reference, v_token, lower(trim(v_enq.contact_email)), v_form, 'inbox_conversion'
  ) RETURNING id INTO v_id;

  INSERT INTO booking_status_events (
    booking_request_id, previous_status, new_status, actor, organizer_message
  ) VALUES (
    v_id, NULL, 'Received', 'Admin',
    'Your enquiry was converted into a structured booking request. Our team will follow up for any missing details.'
  );

  UPDATE enquiries
  SET
    booking_request_id = v_id,
    status = 'Open',
    updated_at = now()
  WHERE id = p_enquiry_id;

  RETURN jsonb_build_object(
    'booking_request_id', v_id,
    'reference', v_reference,
    'access_token', v_token
  );
END;
$$;

GRANT EXECUTE ON FUNCTION convert_enquiry_to_booking(UUID) TO authenticated;
