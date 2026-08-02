-- Reconcile the Work CMS with the Governance / Enterprise / Education ecosystem.
-- Run after 019_contact_geo_foundation.sql.

UPDATE work_orgs
SET
  status = 'hidden',
  manually_hidden = true,
  updated_at = now()
WHERE slug = 'tc-resource-technology';

UPDATE work_orgs
SET
  status = 'hidden',
  manually_hidden = true,
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
  secondary_cta_label,
  secondary_cta_href,
  external_url,
  sort_order,
  status,
  manually_hidden
) VALUES
(
  'future-africa',
  'other',
  'Future Africa — Governance and Continental Collaboration',
  'Governance',
  'Future Africa',
  'Governance · Continental collaboration',
  'Reimagining Africa’s future—',
  'one institution, economy and life at a time.',
  'Future Africa is a continental platform designed to accelerate the aspirations of Agenda 2063 through collaboration, leadership and strategic action.',
  'A continental platform mobilising institutions and citizens around practical action for Agenda 2063.',
  '[
    {
      "title": "From aspiration to coordinated action",
      "body": "Future Africa exists to strengthen and connect existing efforts by cultivating ethical leadership, investing in human capital and building partnerships across sectors and borders."
    },
    {
      "title": "Flagship initiatives",
      "body": "Planned initiatives connect public leadership, institutional collaboration and citizen participation around practical implementation.",
      "bullets": [
        "Government Partnerships & Institutional Collaboration",
        "Future Africa School of Governance",
        "Future Africa Ambassadors Network",
        "Future Africa Festival",
        "Youth Leadership & Human Capital Development"
      ]
    }
  ]'::jsonb,
  'Discuss a partnership',
  '/contact',
  NULL,
  NULL,
  NULL,
  1,
  'published',
  false
),
(
  'auctus-africa',
  'other',
  'Auctus Africa — Education and Social Transformation',
  'Education',
  'Auctus Africa',
  'Education · Social transformation',
  'Turning potential into opportunity',
  'across African communities.',
  'Auctus Social Transformation Initiative bridges the gap between potential and opportunity through education, empowerment, environmental responsibility and pathways to economic participation.',
  'Social transformation connecting education, youth empowerment and economic opportunity.',
  '[
    {
      "title": "Human capital for community transformation",
      "body": "Auctus Africa works with learners, educators, institutions and communities to strengthen capacity and widen access to knowledge, skills and opportunity."
    },
    {
      "title": "Programme highlights",
      "body": "Its programmes connect educator development, youth opportunity and practical pathways into education, enterprise and skilled work.",
      "bullets": [
        "The 7 Star Programme for teacher and educator development",
        "Youth empowerment and 21st-century skills",
        "Graduate pathways into education",
        "Technical, vocational and entrepreneurship initiatives"
      ]
    }
  ]'::jsonb,
  'Visit Auctus Africa',
  'https://auctusafrica.org/',
  'Explore the education pillar',
  '/work#education',
  'https://auctusafrica.org/',
  5,
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
  secondary_cta_label = EXCLUDED.secondary_cta_label,
  secondary_cta_href = EXCLUDED.secondary_cta_href,
  external_url = EXCLUDED.external_url,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  manually_hidden = false,
  updated_at = now();
