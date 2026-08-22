-- Combined migration helper — contact platform routing (029 → 031)
-- Paste into Supabase SQL Editor AFTER 022 and 028 are applied.
--
-- If contact submit fails with "Could not choose the best candidate function",
-- run fix-submit-general-enquiry-overload.sql (or migration 032) first.

DROP FUNCTION IF EXISTS public.submit_general_enquiry(
  TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT
);

-- ========== BEGIN 029 ==========
-- Store contact form platform/referrer context for brand notification routing.
-- Run after 028_audience_members.sql.

CREATE OR REPLACE FUNCTION submit_general_enquiry(
  p_name TEXT,
  p_email TEXT,
  p_organization TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_privacy_agreed BOOLEAN,
  p_website TEXT DEFAULT NULL,
  p_referrer_path TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
DECLARE
  v_id UUID;
  v_email TEXT := lower(trim(COALESCE(p_email, '')));
  v_hash TEXT;
  v_platform TEXT := lower(trim(COALESCE(p_platform, '')));
  v_referrer TEXT := NULLIF(trim(COALESCE(p_referrer_path, '')), '');
BEGIN
  IF length(trim(COALESCE(p_website, ''))) > 0 THEN
    RETURN extensions.gen_random_uuid();
  END IF;

  IF length(trim(COALESCE(p_name, ''))) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION 'Please enter your name.';
  END IF;
  IF length(v_email) > 254 OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;
  IF length(trim(COALESCE(p_organization, ''))) > 160 THEN
    RAISE EXCEPTION 'Organization is too long.';
  END IF;
  IF length(trim(COALESCE(p_subject, ''))) NOT BETWEEN 3 AND 160 THEN
    RAISE EXCEPTION 'Please enter a subject.';
  END IF;
  IF length(trim(COALESCE(p_message, ''))) NOT BETWEEN 20 AND 5000 THEN
    RAISE EXCEPTION 'Message must be between 20 and 5,000 characters.';
  END IF;
  IF p_privacy_agreed IS NOT TRUE THEN
    RAISE EXCEPTION 'Privacy acknowledgement is required.';
  END IF;
  IF v_platform <> '' AND v_platform NOT IN ('aald', 'performx', 'erudio-hub', 'auctus-africa') THEN
    RAISE EXCEPTION 'Invalid platform context.';
  END IF;
  IF v_referrer IS NOT NULL AND length(v_referrer) > 500 THEN
    RAISE EXCEPTION 'Referrer path is too long.';
  END IF;

  v_hash := encode(extensions.digest(v_email, 'sha256'), 'hex');
  PERFORM pg_advisory_xact_lock(hashtext(v_hash));
  IF (
    SELECT count(*)
    FROM public_enquiry_rate_limits
    WHERE email_hash = v_hash
      AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many enquiries. Please wait before trying again.';
  END IF;

  INSERT INTO public_enquiry_rate_limits (email_hash) VALUES (v_hash);
  DELETE FROM public_enquiry_rate_limits WHERE created_at < now() - interval '7 days';

  INSERT INTO enquiries (
    source, contact_name, contact_email, organization, subject, message, payload
  ) VALUES (
    'Contact',
    trim(p_name),
    v_email,
    NULLIF(trim(COALESCE(p_organization, '')), ''),
    trim(p_subject),
    trim(p_message),
    jsonb_build_object(
      'privacyAgreed', true,
      'privacyNotice', '/privacy',
      'submittedAt', now(),
      'platform', NULLIF(v_platform, ''),
      'referrerPath', v_referrer
    )
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

REVOKE ALL ON FUNCTION submit_general_enquiry(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_general_enquiry(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT)
  TO anon, authenticated;

-- ========== END 029 ==========

-- ========== BEGIN 030 ==========
-- Allow future-africa platform context on contact submissions.
-- Run after 029_enquiry_notification_context.sql.

CREATE OR REPLACE FUNCTION submit_general_enquiry(
  p_name TEXT,
  p_email TEXT,
  p_organization TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_privacy_agreed BOOLEAN,
  p_website TEXT DEFAULT NULL,
  p_referrer_path TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
DECLARE
  v_id UUID;
  v_email TEXT := lower(trim(COALESCE(p_email, '')));
  v_hash TEXT;
  v_platform TEXT := lower(trim(COALESCE(p_platform, '')));
  v_referrer TEXT := NULLIF(trim(COALESCE(p_referrer_path, '')), '');
BEGIN
  IF length(trim(COALESCE(p_website, ''))) > 0 THEN
    RETURN extensions.gen_random_uuid();
  END IF;

  IF length(trim(COALESCE(p_name, ''))) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION 'Please enter your name.';
  END IF;
  IF length(v_email) > 254 OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;
  IF length(trim(COALESCE(p_organization, ''))) > 160 THEN
    RAISE EXCEPTION 'Organization is too long.';
  END IF;
  IF length(trim(COALESCE(p_subject, ''))) NOT BETWEEN 3 AND 160 THEN
    RAISE EXCEPTION 'Please enter a subject.';
  END IF;
  IF length(trim(COALESCE(p_message, ''))) NOT BETWEEN 20 AND 5000 THEN
    RAISE EXCEPTION 'Message must be between 20 and 5,000 characters.';
  END IF;
  IF p_privacy_agreed IS NOT TRUE THEN
    RAISE EXCEPTION 'Privacy acknowledgement is required.';
  END IF;
  IF v_platform <> '' AND v_platform NOT IN (
    'aald', 'performx', 'erudio-hub', 'auctus-africa', 'future-africa'
  ) THEN
    RAISE EXCEPTION 'Invalid platform context.';
  END IF;
  IF v_referrer IS NOT NULL AND length(v_referrer) > 500 THEN
    RAISE EXCEPTION 'Referrer path is too long.';
  END IF;

  v_hash := encode(extensions.digest(v_email, 'sha256'), 'hex');
  PERFORM pg_advisory_xact_lock(hashtext(v_hash));
  IF (
    SELECT count(*)
    FROM public_enquiry_rate_limits
    WHERE email_hash = v_hash
      AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many enquiries. Please wait before trying again.';
  END IF;

  INSERT INTO public_enquiry_rate_limits (email_hash) VALUES (v_hash);
  DELETE FROM public_enquiry_rate_limits WHERE created_at < now() - interval '7 days';

  INSERT INTO enquiries (
    source, contact_name, contact_email, organization, subject, message, payload
  ) VALUES (
    'Contact',
    trim(p_name),
    v_email,
    NULLIF(trim(COALESCE(p_organization, '')), ''),
    trim(p_subject),
    trim(p_message),
    jsonb_build_object(
      'privacyAgreed', true,
      'privacyNotice', '/privacy',
      'submittedAt', now(),
      'platform', NULLIF(v_platform, ''),
      'referrerPath', v_referrer
    )
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

REVOKE ALL ON FUNCTION submit_general_enquiry(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_general_enquiry(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT)
  TO anon, authenticated;

-- ========== END 030 ==========

-- ========== BEGIN 031 ==========
-- Route work-page partnership CTAs through /contact?platform= for brand email routing.
-- Run after 030_enquiry_future_africa_platform.sql.

UPDATE work_orgs SET
  secondary_cta_href = '/contact?platform=aald',
  updated_at = now()
WHERE slug = 'aald';

UPDATE work_orgs SET
  cta_href = '/contact?platform=performx',
  related_links = '[
    {"label": "Request partnership deck", "href": "/contact?platform=performx"},
    {"label": "PerformX Summit 2026", "href": "/events/performx-summit-2026"},
    {"label": "AALD", "href": "/work/aald"}
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'performx';

UPDATE work_orgs SET
  secondary_cta_label = 'Discuss a partnership',
  secondary_cta_href = '/contact?platform=erudio-hub',
  updated_at = now()
WHERE slug = 'erudio-hub';

UPDATE work_orgs SET
  secondary_cta_label = 'Discuss a partnership',
  secondary_cta_href = '/contact?platform=auctus-africa',
  related_links = '[{"label": "Explore the education pillar", "href": "/work#education"}]'::jsonb,
  updated_at = now()
WHERE slug = 'auctus-africa';

UPDATE work_orgs SET
  cta_href = '/contact?platform=future-africa',
  updated_at = now()
WHERE slug = 'future-africa';

-- ========== END 031 ==========

