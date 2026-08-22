-- Point PerformX Summit cover at JPEG OG asset (sharper on social crawlers)
UPDATE public.events
SET
  cover_image_path = '/images/marketing/performx-summit-og.jpg',
  updated_at = now()
WHERE slug = 'performx-summit-2026';
