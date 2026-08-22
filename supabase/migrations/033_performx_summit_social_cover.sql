-- PerformX Summit 2026 — self-hosted OG / event cover (1200×630 stage photo)
UPDATE public.events
SET
  cover_image_path = '/images/marketing/performx-summit-og.webp',
  updated_at = now()
WHERE slug = 'performx-summit-2026';
