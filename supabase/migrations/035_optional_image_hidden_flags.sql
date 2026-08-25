-- Temporary hide flags for hero/cover images (keep asset path; hide on public pages)
-- Run after 034_performx_summit_cover_jpeg.sql

ALTER TABLE work_orgs
  ADD COLUMN IF NOT EXISTS hero_image_hidden BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS cover_image_hidden BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE library_books
  ADD COLUMN IF NOT EXISTS cover_image_hidden BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE insights_articles
  ADD COLUMN IF NOT EXISTS hero_image_hidden BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS homepage_banner_hidden BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS homepage_portrait_hidden BOOLEAN NOT NULL DEFAULT false;
