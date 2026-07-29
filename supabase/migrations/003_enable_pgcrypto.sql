-- Enables random token generation used by booking_requests and create_booking_request().
-- Safe to run even if 001_initial_schema.sql already ran this line.

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
