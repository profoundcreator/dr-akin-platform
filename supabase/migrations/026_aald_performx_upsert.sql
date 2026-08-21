-- Force-sync approved AALD + PerformX Nexus work org content (idempotent upsert)
-- Run after 025_aald_performx_content.sql if pages still show old copy

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
  related_links,
  sort_order,
  status,
  manually_hidden
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
  '[
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
  'Invite Akin Akinpelu to speak',
  '/meet-akin/speaking',
  'Discuss a partnership',
  '/contact',
  '[
    {"label": "PerformX Nexus", "href": "/work/performx"},
    {"label": "PerformX Summit 2026", "href": "/events/performx-summit-2026"}
  ]'::jsonb,
  2,
  'published',
  false
),
(
  'performx',
  'performx',
  'PerformX Nexus — The Catalytic Ecosystem',
  'Enterprise',
  'PERFORMX',
  'PerformX Nexus · Enterprise',
  'Building bold.',
  'Executing smart. Performing beyond.',
  'PerformX Nexus is a catalytic ecosystem where leaders, institutions and sectors converge to turn strategy into disciplined execution and measurable impact.',
  'PerformX Nexus — a catalytic ecosystem convening leaders, institutions and sectors to perform at a higher level.',
  '[
    {
      "title": "Three pillars",
      "body": "PerformX Nexus integrates convening, advisory council work and impact programmes into one ecosystem.",
      "bullets": [
        "PerformX Summit — flagship leadership convening (delegates, speakers, sponsors)",
        "Horizon Council — strategic advisory circle for sector leaders (teaser in v1; details on request)",
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
  'Book an advisory session',
  '/book-dr-akin',
  'Register interest in the summit',
  '/events/performx-summit-2026',
  '[
    {"label": "Request partnership deck", "href": "/contact"},
    {"label": "PerformX Summit 2026", "href": "/events/performx-summit-2026"},
    {"label": "AALD", "href": "/work/aald"}
  ]'::jsonb,
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
  secondary_cta_label = EXCLUDED.secondary_cta_label,
  secondary_cta_href = EXCLUDED.secondary_cta_href,
  related_links = EXCLUDED.related_links,
  sort_order = EXCLUDED.sort_order,
  status = 'published',
  manually_hidden = false,
  updated_at = now();
