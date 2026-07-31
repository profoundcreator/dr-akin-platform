-- Pre-loaded content controls — hide static seed books/articles from the public site
-- Run after 012_team_admin.sql

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hidden_preloaded_insight_slugs TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hidden_preloaded_book_slugs TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN site_settings.hidden_preloaded_insight_slugs IS
  'Slugs of seed insight articles hidden from the public site by admins.';
COMMENT ON COLUMN site_settings.hidden_preloaded_book_slugs IS
  'Slugs of seed library books hidden from the public site by admins.';
