-- Correct PerformX Summit 2026 dates: 30 November – 1 December 2026 (was 20–21 November 2026)
-- Run after 031_work_org_platform_contact_links.sql
-- Updates both the /work/performx page copy and the /events/performx-summit-2026 record.

UPDATE work_orgs SET
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
      "body": "The next edition convenes 30 November – 1 December 2026 at Landmark Event Centre, Lagos, under the theme Leading Frontiers: Innovate, Integrate, Impact.",
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

UPDATE events SET
  seo_description = 'PerformX Summit 2026 — Leading Frontiers: Innovate, Integrate, Impact. 30 November – 1 December at Landmark Event Centre, Lagos.',
  starts_at = '2026-11-30T09:00:00+01:00',
  ends_at = '2026-12-01T18:00:00+01:00',
  updated_at = now()
WHERE slug = 'performx-summit-2026';
