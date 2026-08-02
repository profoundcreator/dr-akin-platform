-- Public contact RPC and additive insight metadata.
-- Run after 018_organizer_resources.sql.

ALTER TABLE insights_articles
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS social_image_alt TEXT;

CREATE TABLE IF NOT EXISTS public_enquiry_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS public_enquiry_rate_limits_lookup_idx
  ON public_enquiry_rate_limits (email_hash, created_at DESC);

ALTER TABLE public_enquiry_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION submit_general_enquiry(
  p_name TEXT,
  p_email TEXT,
  p_organization TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_privacy_agreed BOOLEAN,
  p_website TEXT DEFAULT NULL
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
BEGIN
  -- Honeypot submissions return a synthetic success without storing content.
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
      'submittedAt', now()
    )
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

REVOKE ALL ON FUNCTION submit_general_enquiry(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_general_enquiry(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT)
  TO anon, authenticated;
