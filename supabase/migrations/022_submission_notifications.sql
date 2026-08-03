-- Track outbound admin notification emails (Resend) for enquiries and bookings.
-- Run after 021_restore_performx.sql.

ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS admin_notified_at TIMESTAMPTZ;

ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS admin_notified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS enquiries_admin_notified_at_idx
  ON enquiries (admin_notified_at)
  WHERE admin_notified_at IS NULL;

CREATE INDEX IF NOT EXISTS booking_requests_admin_notified_at_idx
  ON booking_requests (admin_notified_at)
  WHERE admin_notified_at IS NULL;
