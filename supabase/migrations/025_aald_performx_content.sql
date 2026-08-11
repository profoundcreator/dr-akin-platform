-- Apply approved AALD + PerformX Nexus + Summit 2026 content
-- Run after 024_content_plans.sql

UPDATE work_orgs SET
  page_title = 'AALD — Learning & Development for African Enterprise',
  kicker = 'Enterprise · Consulting · Training · Research',
  headline = 'Building stronger African organisations—',
  headline_secondary = 'through consulting, training and research.',
  description = 'Akin Akinpelu Learning & Development Company partners with corporates across Africa and African institutions in the diaspora to strengthen leadership, sharpen strategy and build cultures that perform at scale.',
  hub_card_description = 'Consulting, training and research for African corporates and diaspora institutions building stronger leadership and performance.',
  sections = '[
    {
      "title": "What we do",
      "body": "AALD delivers innovative consulting, executive training and applied research for organisations building across the continent and beyond.",
      "bullets": [
        "Strategic consulting and organisational diagnostics",
        "Executive training and leadership development",
        "Applied research and capability building",
        "Culture, performance and transformation support"
      ]
    },
    {
      "title": "Who we serve",
      "body": "We work with African corporates, public institutions, NGOs and diaspora organisations that need practical leadership and performance systems—not generic playbooks.",
      "bullets": [
        "Corporate leadership teams and boards",
        "Public-sector and institutional leaders",
        "NGOs and social-impact organisations",
        "African institutions in the global diaspora"
      ]
    },
    {
      "title": "Why AALD",
      "body": "Founded and led by Akin Akinpelu, Ph.D., Amb., FLPi, AALD combines continental perspective with disciplined execution—helping organisations turn ambition into measurable performance.",
      "bullets": [
        "Continental reach across 20+ countries",
        "1,000,000+ people reached through leadership work",
        "26+ years of institutional leadership experience",
        "Research-backed consulting and training methodologies"
      ]
    },
    {
      "title": "Part of a broader ecosystem",
      "body": "AALD sits within the Enterprise pillar alongside PerformX Nexus—connecting organisational development with high-performance leadership convenings.",
      "bullets": [
        "PerformX Nexus catalytic ecosystem",
        "PerformX Summit 2026"
      ]
    }
  ]'::jsonb,
  cta_label = 'Invite Akin Akinpelu to speak',
  cta_href = '/meet-akin/speaking',
  secondary_cta_label = 'Discuss a partnership',
  secondary_cta_href = '/contact',
  related_links = '[
    {"label": "PerformX Nexus", "href": "/work/performx"},
    {"label": "PerformX Summit 2026", "href": "/events/performx-summit-2026"}
  ]'::jsonb,
  status = 'published',
  manually_hidden = false,
  updated_at = now()
WHERE slug = 'aald';

INSERT INTO work_orgs (
  slug, brand_key, page_title, pillar_title, brand_label, kicker, headline,
  headline_secondary, description, hub_card_description, sections,
  cta_label, cta_href, secondary_cta_label, secondary_cta_href, related_links,
  sort_order, status, manually_hidden
) VALUES (
  'aald',
  'aald',
  'AALD — Learning & Development for African Enterprise',
  'Enterprise',
  'AALD',
  'Enterprise · Consulting · Training · Research',
  'Building stronger African organisations—',
  'through consulting, training and research.',
  'Akin Akinpelu Learning & Development Company partners with corporates across Africa and African institutions in the diaspora to strengthen leadership, sharpen strategy and build cultures that perform at scale.',
  'Consulting, training and research for African corporates and diaspora institutions building stronger leadership and performance.',
  '[]'::jsonb,
  'Invite Akin Akinpelu to speak',
  '/meet-akin/speaking',
  'Discuss a partnership',
  '/contact',
  '[]'::jsonb,
  2,
  'published',
  false
)
ON CONFLICT (slug) DO NOTHING;

UPDATE work_orgs SET
  page_title = 'PerformX Nexus — The Catalytic Ecosystem',
  brand_label = 'PERFORMX',
  kicker = 'PerformX Nexus · Enterprise',
  headline = 'Building bold.',
  headline_secondary = 'Executing smart. Performing beyond.',
  description = 'PerformX Nexus is a catalytic ecosystem where leaders, institutions and sectors converge to turn strategy into disciplined execution and measurable impact.',
  hub_card_description = 'PerformX Nexus — a catalytic ecosystem convening leaders, institutions and sectors to perform at a higher level.',
  sections = '[
    {
      "title": "Three pillars",
      "body": "PerformX Nexus integrates convening, advisory council work and impact programmes into one ecosystem.",
      "bullets": [
        "PerformX Summit — flagship leadership convening (delegates, speakers, sponsors)",
        "Horizon Council — strategic advisory circle for sector and institutional leaders",
        "Impact Core — programmes that translate summit insights into sustained organisational performance"
      ]
    },
    {
      "title": "Who it serves",
      "body": "PerformX Nexus is designed for leaders and institutions ready to move from ambition to accountable execution.",
      "bullets": [
        "C-suite and senior operating leaders",
        "Boards and institutional governing bodies",
        "Sector conveners across eight strategic sectors",
        "Partners seeking catalytic sponsorship and collaboration"
      ]
    },
    {
      "title": "PerformX Summit 2026",
      "body": "The next edition convenes 20–21 November 2026 at Landmark Event Centre, Lagos, under the theme Leading Frontiers: Innovate, Integrate, Impact.",
      "bullets": [
        "Eight sectors · Power Room sessions · Nexus Honors",
        "Delegate, speaker and partnership pathways"
      ]
    },
    {
      "title": "Partnerships",
      "body": "Sector ownership and sponsorship packages are available on request. Public pages do not list pricing—start a conversation with the team.",
      "bullets": [
        "Request partnership deck via contact",
        "Parent brand: AALD"
      ]
    }
  ]'::jsonb,
  cta_label = 'Book an advisory session',
  cta_href = '/book-dr-akin',
  secondary_cta_label = 'Register interest in the summit',
  secondary_cta_href = '/events/performx-summit-2026',
  related_links = '[
    {"label": "PerformX Summit 2026", "href": "/events/performx-summit-2026"},
    {"label": "AALD", "href": "/work/aald"}
  ]'::jsonb,
  status = 'published',
  manually_hidden = false,
  updated_at = now()
WHERE slug = 'performx';

INSERT INTO events (
  slug,
  title,
  description,
  seo_description,
  event_type,
  brand,
  starts_at,
  ends_at,
  timezone,
  location,
  location_type,
  status,
  manually_hidden
) VALUES (
  'performx-summit-2026',
  'PerformX Summit 2026',
  'PerformX Summit 2026 brings together delegates, speakers and sponsors across eight strategic sectors for keynotes, Power Room sessions and the Nexus Honors. Theme: Leading Frontiers — Innovate, Integrate, Impact. Part of PerformX Nexus and AALD.',
  'PerformX Summit 2026 — Leading Frontiers: Innovate, Integrate, Impact. 20–21 November at Landmark Event Centre, Lagos.',
  'org_brand',
  'performx',
  '2026-11-20T09:00:00+01:00',
  '2026-11-21T18:00:00+01:00',
  'Africa/Lagos',
  'Landmark Event Centre, Lagos',
  'in_person',
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  seo_description = EXCLUDED.seo_description,
  event_type = EXCLUDED.event_type,
  brand = EXCLUDED.brand,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  timezone = EXCLUDED.timezone,
  location = EXCLUDED.location,
  location_type = EXCLUDED.location_type,
  status = 'published',
  manually_hidden = false,
  updated_at = now();
