-- HOTFIX: contact form "Could not choose the best candidate function" error
-- Paste into Supabase SQL Editor → Run (production project isxzrhviqbqmtuhubcsp)
-- Safe to run even if 032 migration is applied later.

DROP FUNCTION IF EXISTS public.submit_general_enquiry(
  TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT
);

-- Verify only one overload remains (should return 1 row):
-- SELECT proname, pg_get_function_identity_arguments(oid)
-- FROM pg_proc
-- WHERE proname = 'submit_general_enquiry';
