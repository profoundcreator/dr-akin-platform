-- Dr. Akin Platform — Initial Schema
-- Run via Supabase SQL Editor or: supabase db push

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'technical_admin',
  'executive_assistant',
  'executive_reviewer',
  'inbox_manager',
  'resource_manager',
  'read_only_auditor'
);

CREATE TYPE admin_account_state AS ENUM (
  'invited',
  'active',
  'suspended',
  'revoked'
);

CREATE TYPE organizer_status AS ENUM (
  'Received',
  'Under Review',
  'Information Required',
  'Tentatively Available',
  'Confirmed',
  'Declined',
  'Cancelled',
  'Completed'
);

CREATE TYPE internal_status AS ENUM (
  'New / Unassigned',
  'Screening',
  'Awaiting Executive Review',
  'Awaiting Organizer Information',
  'Tentative Hold',
  'Commercial / Terms Review',
  'Approved in Principle',
  'Confirmed',
  'Logistics in Progress',
  'Brief in Preparation',
  'Ready',
  'Completed',
  'Declined',
  'Cancelled',
  'Archived'
);

CREATE TYPE enquiry_source AS ENUM (
  'Contact',
  'Speaking',
  'Booking',
  'Follow-up'
);

CREATE TYPE enquiry_status AS ENUM (
  'New',
  'Open',
  'Awaiting Reply',
  'Resolved',
  'Spam',
  'Archived'
);

-- ── Admin Profiles ──────────────────────────────────────────────────────────
CREATE TABLE admin_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  role          admin_role NOT NULL,
  account_state admin_account_state NOT NULL DEFAULT 'invited',
  invited_by    UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  invited_at    TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  session_revoked_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX admin_profiles_role_idx ON admin_profiles(role);
CREATE INDEX admin_profiles_state_idx ON admin_profiles(account_state);

-- ── Booking Requests ──────────────────────────────────────────────────────────
CREATE TABLE booking_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference         TEXT NOT NULL UNIQUE,
  access_token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  organizer_email   TEXT NOT NULL,
  status            organizer_status NOT NULL DEFAULT 'Received',
  internal_status   internal_status NOT NULL DEFAULT 'New / Unassigned',
  priority          TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'VIP')),
  assigned_ea_id    UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  conflict_detected BOOLEAN NOT NULL DEFAULT false,
  submission_source TEXT NOT NULL DEFAULT 'web',
  form_data         JSONB NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX booking_requests_reference_idx ON booking_requests(reference);
CREATE INDEX booking_requests_status_idx ON booking_requests(status);
CREATE INDEX booking_requests_internal_status_idx ON booking_requests(internal_status);
CREATE INDEX booking_requests_organizer_email_idx ON booking_requests(organizer_email);
CREATE INDEX booking_requests_created_at_idx ON booking_requests(created_at DESC);

-- ── Booking Status Events ───────────────────────────────────────────────────
CREATE TABLE booking_status_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id  UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  previous_status     organizer_status,
  new_status          organizer_status NOT NULL,
  actor               TEXT NOT NULL,
  internal_reason     TEXT,
  organizer_message   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX booking_status_events_request_idx ON booking_status_events(booking_request_id);

-- ── Booking Documents ─────────────────────────────────────────────────────────
CREATE TABLE booking_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id  UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  category            TEXT NOT NULL,
  storage_path        TEXT,
  uploaded_by         UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX booking_documents_request_idx ON booking_documents(booking_request_id);

-- ── Enquiries (Unified Inbox) ─────────────────────────────────────────────────
CREATE TABLE enquiries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source              enquiry_source NOT NULL,
  contact_name        TEXT NOT NULL,
  contact_email       TEXT NOT NULL,
  contact_phone       TEXT,
  organization        TEXT,
  subject             TEXT,
  message             TEXT,
  status              enquiry_status NOT NULL DEFAULT 'New',
  priority            TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Urgent')),
  assigned_admin_id   UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  booking_request_id  UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  payload             JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX enquiries_status_idx ON enquiries(status);
CREATE INDEX enquiries_source_idx ON enquiries(source);
CREATE INDEX enquiries_assigned_idx ON enquiries(assigned_admin_id);

-- ── Audit Events (Append-Only) ────────────────────────────────────────────────
CREATE TABLE audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  actor_role  admin_role,
  event_type  TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  summary     JSONB,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_actor_idx ON audit_events(actor_id);
CREATE INDEX audit_events_target_idx ON audit_events(target_type, target_id);
CREATE INDEX audit_events_created_at_idx ON audit_events(created_at DESC);

-- ── Updated-at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Reference generator ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  suffix INT;
  ref TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    suffix := floor(random() * 9000 + 1000)::INT;
    ref := 'DAA-' || suffix::TEXT;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM booking_requests WHERE reference = ref);
    attempts := attempts + 1;
    IF attempts > 20 THEN
      RAISE EXCEPTION 'Could not generate unique booking reference';
    END IF;
  END LOOP;
  RETURN ref;
END;
$$ LANGUAGE plpgsql;
