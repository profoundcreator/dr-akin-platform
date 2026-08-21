-- Unified marketing audience (opt-in only). Run after 027_aald_performx_cta_copy.sql.

CREATE TABLE IF NOT EXISTS audience_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL,
  name                TEXT,
  consent_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_source      TEXT NOT NULL CHECK (consent_source IN ('contact', 'booking', 'newsletter', 'summit_interest')),
  engagement_context  JSONB,
  esp_provider        TEXT,
  esp_subscriber_id   TEXT,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  unsubscribed_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audience_members_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS audience_members_status_idx ON audience_members (status, consent_at DESC);
CREATE INDEX IF NOT EXISTS audience_members_source_idx ON audience_members (consent_source);

ALTER TABLE audience_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active admins can read audience members"
  ON audience_members FOR SELECT
  TO authenticated
  USING (is_active_admin());

CREATE OR REPLACE FUNCTION subscribe_audience_member(
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_consent_source TEXT DEFAULT 'newsletter',
  p_engagement_context JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
DECLARE
  v_email TEXT := lower(trim(COALESCE(p_email, '')));
  v_id UUID;
BEGIN
  IF length(v_email) > 254 OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;

  IF p_consent_source NOT IN ('contact', 'booking', 'newsletter', 'summit_interest') THEN
    RAISE EXCEPTION 'Invalid consent source.';
  END IF;

  INSERT INTO audience_members (
    email, name, consent_at, consent_source, engagement_context, status, unsubscribed_at
  ) VALUES (
    v_email,
    NULLIF(trim(COALESCE(p_name, '')), ''),
    now(),
    p_consent_source,
    p_engagement_context,
    'active',
    NULL
  )
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, audience_members.name),
    consent_at = now(),
    consent_source = EXCLUDED.consent_source,
    engagement_context = EXCLUDED.engagement_context,
    status = 'active',
    unsubscribed_at = NULL,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;

REVOKE ALL ON FUNCTION subscribe_audience_member(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION subscribe_audience_member(TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
