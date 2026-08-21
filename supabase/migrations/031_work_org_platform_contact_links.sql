-- Route work-page partnership CTAs through /contact?platform= for brand email routing.
-- Run after 030_enquiry_future_africa_platform.sql.

UPDATE work_orgs SET
  secondary_cta_href = '/contact?platform=aald',
  updated_at = now()
WHERE slug = 'aald';

UPDATE work_orgs SET
  cta_href = '/contact?platform=performx',
  related_links = '[
    {"label": "Request partnership deck", "href": "/contact?platform=performx"},
    {"label": "PerformX Summit 2026", "href": "/events/performx-summit-2026"},
    {"label": "AALD", "href": "/work/aald"}
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'performx';

UPDATE work_orgs SET
  secondary_cta_label = 'Discuss a partnership',
  secondary_cta_href = '/contact?platform=erudio-hub',
  updated_at = now()
WHERE slug = 'erudio-hub';

UPDATE work_orgs SET
  secondary_cta_label = 'Discuss a partnership',
  secondary_cta_href = '/contact?platform=auctus-africa',
  related_links = '[{"label": "Explore the education pillar", "href": "/work#education"}]'::jsonb,
  updated_at = now()
WHERE slug = 'auctus-africa';

UPDATE work_orgs SET
  cta_href = '/contact?platform=future-africa',
  updated_at = now()
WHERE slug = 'future-africa';
