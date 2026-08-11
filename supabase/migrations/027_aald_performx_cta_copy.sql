-- CTA and copy refinements for AALD + PerformX work org pages
-- Run after 026_aald_performx_upsert.sql

UPDATE work_orgs SET
  cta_label = 'Book a facilitation session',
  cta_href = '/book-dr-akin',
  updated_at = now()
WHERE slug = 'aald';

UPDATE work_orgs SET
  cta_label = 'Explore partnerships',
  cta_href = '/contact',
  sections = '[
    {
      "title": "Three pillars",
      "body": "PerformX Nexus integrates convening, advisory council work and impact programmes into one ecosystem.",
      "bullets": [
        "PerformX Summit — flagship leadership convening (delegates, speakers, sponsors)",
        "Horizon Council — strategic advisory circle for sector leaders",
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
  updated_at = now()
WHERE slug = 'performx';
