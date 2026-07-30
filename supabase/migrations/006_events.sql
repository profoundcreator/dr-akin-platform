-- Events system — public pages, admin CRUD, approval workflow, cover images
-- Run after 005_featured_podcast_episodes.sql

-- Admin Manager sits between Super Admin and Technical Admin (inbox, resources, approvals)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'admin_role' AND e.enumlabel = 'admin_manager'
  ) THEN
    ALTER TYPE admin_role ADD VALUE 'admin_manager';
  END IF;
END
$$;

CREATE TYPE event_type AS ENUM (
  'hosted_by_dr_akin',
  'featured_appearance',
  'org_brand'
);

CREATE TYPE event_brand AS ENUM (
  'dr_akin',
  'aald',
  'erudio',
  'performx',
  'tc_resource',
  'other'
);

CREATE TYPE event_status AS ENUM (
  'draft',
  'pending_approval',
  'published',
  'hidden'
);

CREATE TABLE events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT NOT NULL UNIQUE,
  title                 TEXT NOT NULL,
  description           TEXT,
  seo_description       TEXT,
  event_type            event_type NOT NULL DEFAULT 'hosted_by_dr_akin',
  brand                 event_brand NOT NULL DEFAULT 'dr_akin',
  starts_at             TIMESTAMPTZ NOT NULL,
  ends_at               TIMESTAMPTZ NOT NULL,
  timezone              TEXT NOT NULL DEFAULT 'Africa/Lagos',
  location              TEXT,
  location_type         TEXT NOT NULL DEFAULT 'in_person',
  cover_image_path      TEXT,
  registration_url      TEXT,
  registration_embed_url TEXT,
  payment_url           TEXT,
  payment_label         TEXT,
  status                event_status NOT NULL DEFAULT 'draft',
  manually_hidden       BOOLEAN NOT NULL DEFAULT false,
  submitted_by          UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_by           UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  approved_at           TIMESTAMPTZ,
  rejection_note        TEXT,
  created_by            UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT events_ends_after_starts CHECK (ends_at >= starts_at),
  CONSTRAINT events_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX events_public_idx
  ON events (status, manually_hidden, starts_at ASC)
  WHERE status = 'published' AND manually_hidden = false;

CREATE INDEX events_pending_idx
  ON events (status, created_at DESC)
  WHERE status = 'pending_approval';

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Public visibility: published, not manually hidden, within 30 days after end
CREATE OR REPLACE FUNCTION is_event_publicly_visible(
  p_status event_status,
  p_manually_hidden BOOLEAN,
  p_ends_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    p_status = 'published'
    AND NOT p_manually_hidden
    AND p_ends_at + INTERVAL '30 days' > now();
$$;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (is_event_publicly_visible(status, manually_hidden, ends_at));

CREATE POLICY "Active admins can read all events"
  ON events FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert events"
  ON events FOR INSERT TO authenticated
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update events"
  ON events FOR UPDATE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  )
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete events"
  ON events FOR DELETE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

-- Cover image storage bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-covers',
  'event-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read event cover images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'event-covers');

CREATE POLICY "Active admins can upload event covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event-covers'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update event covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'event-covers'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete event covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'event-covers'
    AND is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );
