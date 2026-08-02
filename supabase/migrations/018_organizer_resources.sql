-- Secure, booking-scoped organizer materials.
-- Files remain in a private bucket; signed URLs are created by the server API only.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organizer-materials',
  'organizer-materials',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE organizer_resource_files (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  logical_key TEXT NOT NULL CHECK (logical_key ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 160),
  category TEXT NOT NULL CHECK (length(trim(category)) BETWEEN 2 AND 80),
  audience_variant TEXT NOT NULL DEFAULT 'professional'
    CHECK (audience_variant IN ('professional', 'christian', 'universal')),
  version INTEGER NOT NULL CHECK (version > 0),
  file_name TEXT NOT NULL CHECK (length(trim(file_name)) BETWEEN 1 AND 255),
  object_path TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 26214400),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'retired')),
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES admin_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  retired_by UUID REFERENCES admin_profiles(id),
  retired_at TIMESTAMPTZ,
  UNIQUE (logical_key, version)
);

CREATE INDEX organizer_resource_files_status_idx
  ON organizer_resource_files (status, category, title);

CREATE UNIQUE INDEX organizer_resource_files_current_idx
  ON organizer_resource_files (logical_key)
  WHERE is_current = true;

CREATE TABLE booking_resource_grants (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  booking_request_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  resource_file_id UUID NOT NULL REFERENCES organizer_resource_files(id),
  granted_by UUID NOT NULL REFERENCES admin_profiles(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES admin_profiles(id),
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  CHECK (expires_at IS NULL OR expires_at > granted_at)
);

CREATE UNIQUE INDEX booking_resource_grants_active_idx
  ON booking_resource_grants (booking_request_id, resource_file_id)
  WHERE revoked_at IS NULL;

CREATE INDEX booking_resource_grants_booking_idx
  ON booking_resource_grants (booking_request_id, granted_at DESC);

ALTER TABLE organizer_resource_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_resource_grants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION can_view_resource_metadata()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(
    ARRAY['super_admin', 'admin_manager', 'executive_assistant', 'resource_manager']::admin_role[]
  );
$$;

CREATE OR REPLACE FUNCTION can_upload_resource_files()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(
    ARRAY['super_admin', 'admin_manager', 'resource_manager']::admin_role[]
  );
$$;

CREATE OR REPLACE FUNCTION can_assign_resource_files()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_has_role(
    ARRAY['super_admin', 'admin_manager', 'executive_assistant']::admin_role[]
  );
$$;

CREATE POLICY "Resource managers can read resource metadata"
  ON organizer_resource_files FOR SELECT
  TO authenticated
  USING (can_view_resource_metadata());

CREATE POLICY "Resource managers can read booking grants"
  ON booking_resource_grants FOR SELECT
  TO authenticated
  USING (can_view_resource_metadata());

-- Storage bytes are intentionally unavailable to EAs, reviewers, auditors, and technical admins.
CREATE POLICY "Resource uploaders can insert organizer materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'organizer-materials'
    AND can_upload_resource_files()
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Resource uploaders can read organizer materials"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'organizer-materials'
    AND can_upload_resource_files()
  );

CREATE POLICY "Resource uploaders can remove organizer materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'organizer-materials'
    AND can_upload_resource_files()
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION register_organizer_resource(
  p_logical_key TEXT,
  p_title TEXT,
  p_category TEXT,
  p_audience_variant TEXT,
  p_file_name TEXT,
  p_object_path TEXT,
  p_mime_type TEXT,
  p_size_bytes BIGINT
)
RETURNS organizer_resource_files
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_version INTEGER;
  v_resource organizer_resource_files%ROWTYPE;
BEGIN
  IF NOT can_upload_resource_files() THEN
    RAISE EXCEPTION 'Resource upload permission required.';
  END IF;

  IF p_audience_variant NOT IN ('professional', 'christian', 'universal') THEN
    RAISE EXCEPTION 'Choose a valid audience variant.';
  END IF;

  IF p_object_path IS NULL
     OR split_part(p_object_path, '/', 1) <> auth.uid()::text
     OR NOT EXISTS (
       SELECT 1 FROM storage.objects
       WHERE bucket_id = 'organizer-materials' AND name = p_object_path
     ) THEN
    RAISE EXCEPTION 'Uploaded organizer material was not found in your private upload folder.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(lower(trim(p_logical_key))));

  SELECT COALESCE(max(version), 0) + 1
  INTO v_version
  FROM organizer_resource_files
  WHERE logical_key = lower(trim(p_logical_key));

  UPDATE organizer_resource_files
  SET is_current = false
  WHERE logical_key = lower(trim(p_logical_key)) AND is_current = true;

  INSERT INTO organizer_resource_files (
    logical_key, title, category, audience_variant, version, file_name, object_path,
    mime_type, size_bytes, created_by
  ) VALUES (
    lower(trim(p_logical_key)), trim(p_title), trim(p_category), p_audience_variant, v_version,
    trim(p_file_name), p_object_path, p_mime_type, p_size_bytes, auth.uid()
  )
  RETURNING * INTO v_resource;

  PERFORM log_audit_event(
    'organizer_resource.uploaded',
    'organizer_resource_file',
    v_resource.id,
    jsonb_build_object(
      'title', v_resource.title,
      'logicalKey', v_resource.logical_key,
      'audienceVariant', v_resource.audience_variant,
      'version', v_resource.version,
      'fileName', v_resource.file_name
    ),
    jsonb_build_object('mimeType', v_resource.mime_type, 'sizeBytes', v_resource.size_bytes)
  );

  RETURN v_resource;
END;
$$;

CREATE OR REPLACE FUNCTION retire_organizer_resource(p_resource_file_id UUID)
RETURNS organizer_resource_files
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_resource organizer_resource_files%ROWTYPE;
BEGIN
  IF NOT can_upload_resource_files() THEN
    RAISE EXCEPTION 'Resource management permission required.';
  END IF;

  UPDATE organizer_resource_files
  SET status = 'retired', is_current = false, retired_by = auth.uid(), retired_at = now()
  WHERE id = p_resource_file_id AND status = 'available'
  RETURNING * INTO v_resource;

  IF v_resource.id IS NULL THEN
    RAISE EXCEPTION 'Available organizer resource not found.';
  END IF;

  PERFORM log_audit_event(
    'organizer_resource.retired',
    'organizer_resource_file',
    v_resource.id,
    jsonb_build_object('title', v_resource.title, 'version', v_resource.version)
  );

  RETURN v_resource;
END;
$$;

CREATE OR REPLACE FUNCTION grant_booking_resource(
  p_booking_request_id UUID,
  p_resource_file_id UUID,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS booking_resource_grants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grant booking_resource_grants%ROWTYPE;
  v_resource organizer_resource_files%ROWTYPE;
BEGIN
  IF NOT can_assign_resource_files() THEN
    RAISE EXCEPTION 'Resource assignment permission required.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM booking_requests WHERE id = p_booking_request_id) THEN
    RAISE EXCEPTION 'Booking request not found.';
  END IF;

  SELECT * INTO v_resource
  FROM organizer_resource_files
  WHERE id = p_resource_file_id AND status = 'available' AND is_current = true;

  IF v_resource.id IS NULL THEN
    RAISE EXCEPTION 'Available organizer resource not found.';
  END IF;

  IF p_expires_at IS NOT NULL AND p_expires_at <= now() THEN
    RAISE EXCEPTION 'Grant expiry must be in the future.';
  END IF;

  INSERT INTO booking_resource_grants (
    booking_request_id, resource_file_id, granted_by, expires_at
  ) VALUES (
    p_booking_request_id, p_resource_file_id, auth.uid(), p_expires_at
  )
  RETURNING * INTO v_grant;

  PERFORM log_audit_event(
    'organizer_resource.granted',
    'booking_resource_grant',
    v_grant.id,
    jsonb_build_object(
      'bookingRequestId', p_booking_request_id,
      'resourceFileId', p_resource_file_id,
      'resourceTitle', v_resource.title,
      'resourceVersion', v_resource.version,
      'expiresAt', p_expires_at
    )
  );

  RETURN v_grant;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'This resource is already granted to the booking.';
END;
$$;

CREATE OR REPLACE FUNCTION revoke_booking_resource(
  p_grant_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS booking_resource_grants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role admin_role;
  v_grant booking_resource_grants%ROWTYPE;
BEGIN
  SELECT role INTO v_actor_role
  FROM admin_profiles
  WHERE id = auth.uid() AND account_state = 'active';

  SELECT * INTO v_grant
  FROM booking_resource_grants
  WHERE id = p_grant_id AND revoked_at IS NULL
  FOR UPDATE;

  IF v_grant.id IS NULL THEN
    RAISE EXCEPTION 'Active resource grant not found.';
  END IF;

  IF v_actor_role IN ('super_admin', 'admin_manager') THEN
    NULL;
  ELSIF v_actor_role = 'executive_assistant' AND v_grant.granted_by = auth.uid() THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'You cannot revoke this resource grant.';
  END IF;

  UPDATE booking_resource_grants
  SET revoked_at = now(), revoked_by = auth.uid(), revoke_reason = NULLIF(trim(p_reason), '')
  WHERE id = p_grant_id
  RETURNING * INTO v_grant;

  PERFORM log_audit_event(
    'organizer_resource.revoked',
    'booking_resource_grant',
    v_grant.id,
    jsonb_build_object(
      'bookingRequestId', v_grant.booking_request_id,
      'resourceFileId', v_grant.resource_file_id,
      'reason', v_grant.revoke_reason
    )
  );

  RETURN v_grant;
END;
$$;

CREATE OR REPLACE FUNCTION get_organizer_resources(
  p_reference TEXT,
  p_access_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_resources JSONB;
BEGIN
  SELECT id INTO v_booking_id
  FROM booking_requests
  WHERE upper(reference) = upper(trim(p_reference))
    AND access_token = p_access_token;

  IF v_booking_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'grantId', g.id,
      'resourceId', r.id,
      'title', r.title,
      'category', r.category,
      'audienceVariant', r.audience_variant,
      'version', r.version,
      'fileName', r.file_name,
      'mimeType', r.mime_type,
      'sizeBytes', r.size_bytes,
      'grantedAt', g.granted_at,
      'expiresAt', g.expires_at
    ) ORDER BY r.category, r.title, r.version DESC
  ), '[]'::JSONB)
  INTO v_resources
  FROM booking_resource_grants g
  JOIN organizer_resource_files r ON r.id = g.resource_file_id
  WHERE g.booking_request_id = v_booking_id
    AND g.revoked_at IS NULL
    AND (g.expires_at IS NULL OR g.expires_at > now())
    AND r.status = 'available';

  RETURN jsonb_build_object(
    'bookingRequestId', v_booking_id,
    'resources', v_resources
  );
END;
$$;

CREATE OR REPLACE FUNCTION record_organizer_resource_access(
  p_reference TEXT,
  p_access_token TEXT,
  p_resource_file_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_grant_id UUID;
BEGIN
  SELECT id INTO v_booking_id
  FROM booking_requests
  WHERE upper(reference) = upper(trim(p_reference))
    AND access_token = p_access_token;

  IF v_booking_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT g.id INTO v_grant_id
  FROM booking_resource_grants g
  JOIN organizer_resource_files r ON r.id = g.resource_file_id
  WHERE g.booking_request_id = v_booking_id
    AND g.resource_file_id = p_resource_file_id
    AND g.revoked_at IS NULL
    AND (g.expires_at IS NULL OR g.expires_at > now())
    AND r.status = 'available';

  IF v_grant_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO audit_events (
    actor_id, actor_role, event_type, target_type, target_id, summary, metadata
  ) VALUES (
    NULL, NULL, 'organizer_resource.downloaded', 'organizer_resource_file',
    p_resource_file_id,
    jsonb_build_object('bookingRequestId', v_booking_id, 'grantId', v_grant_id),
    jsonb_build_object('source', 'organizer_tracker')
  );

  RETURN true;
END;
$$;

REVOKE ALL ON organizer_resource_files FROM anon;
REVOKE ALL ON booking_resource_grants FROM anon;
REVOKE ALL ON organizer_resource_files FROM authenticated;
REVOKE ALL ON booking_resource_grants FROM authenticated;
GRANT SELECT ON organizer_resource_files TO authenticated;
GRANT SELECT ON booking_resource_grants TO authenticated;

REVOKE ALL ON FUNCTION register_organizer_resource(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION retire_organizer_resource(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION grant_booking_resource(UUID, UUID, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION revoke_booking_resource(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_organizer_resources(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_organizer_resource_access(TEXT, TEXT, UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION register_organizer_resource(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION retire_organizer_resource(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION grant_booking_resource(UUID, UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_booking_resource(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_organizer_resources(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_organizer_resource_access(TEXT, TEXT, UUID) TO anon, authenticated;
