-- Restore PERFORMX as a published work org page.
-- Run after 020_continental_ecosystem.sql.

UPDATE work_orgs
SET
  status = 'published',
  manually_hidden = false,
  updated_at = now()
WHERE slug = 'performx';

INSERT INTO work_orgs (
  slug,
  brand_key,
  page_title,
  pillar_title,
  brand_label,
  kicker,
  headline,
  headline_secondary,
  description,
  hub_card_description,
  sections,
  cta_label,
  cta_href,
  sort_order,
  status,
  manually_hidden
) VALUES (
  'performx',
  'performx',
  'PERFORMX — Execution Think Tank',
  'Enterprise',
  'PERFORMX',
  'PERFORMX · Execution Think Tank',
  'Turning strategy into',
  'disciplined execution.',
  'PERFORMX is a high-performance practice helping leaders and operating teams convert ambitious plans into measurable outcomes.',
  'A leadership event and community helping people and institutions perform at a higher level.',
  '[
    {
      "title": "Capabilities",
      "body": "Execution frameworks, operating rhythm design, and leadership coaching for teams under pressure.",
      "bullets": [
        "Strategy-to-execution diagnostics",
        "OKR and accountability systems",
        "Leadership team alignment",
        "Performance culture design"
      ]
    }
  ]'::jsonb,
  'Book an advisory session',
  '/book-dr-akin',
  3,
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  brand_key = EXCLUDED.brand_key,
  page_title = EXCLUDED.page_title,
  pillar_title = EXCLUDED.pillar_title,
  brand_label = EXCLUDED.brand_label,
  kicker = EXCLUDED.kicker,
  headline = EXCLUDED.headline,
  headline_secondary = EXCLUDED.headline_secondary,
  description = EXCLUDED.description,
  hub_card_description = EXCLUDED.hub_card_description,
  sections = EXCLUDED.sections,
  cta_label = EXCLUDED.cta_label,
  cta_href = EXCLUDED.cta_href,
  sort_order = EXCLUDED.sort_order,
  status = 'published',
  manually_hidden = false,
  updated_at = now();
