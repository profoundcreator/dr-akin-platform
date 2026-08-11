# AALD + PerformX Nexus + Summit 2026 — Planning Document

Status key: **Approved direction** means recommended by source review. **Review** means awaiting client approval in Cursor. **Hold** means blocked until a decision is recorded.

**Approval workflow:** Review this document in Cursor. Confirm the five decisions in chat. Implementation follows client sign-off.

## Route map

| Route | Purpose | Primary sources |
| ----- | ------- | --------------- |
| `/work/aald` | Evergreen AALD corporate page | AALD brochure |
| `/work/performx` | Evergreen PerformX Nexus ecosystem (3 pillars) | Nexus brochure extract |
| `/events/performx-summit-2026` | Edition page for delegates, speakers and sponsors | 2026 concept note |

Cross-links: work pages ↔ summit event ↔ AALD parent brand.

## Source hierarchy

1. AALD brochure PDF
2. PerformX Nexus brochure extract
3. PerformX Summit 2026 concept note
4. [continental-copy-deck.md](./continental-copy-deck.md) identity rules

## Variables register

| Variable | Recommended | Alternate / conflict | Source | Status |
| -------- | ----------- | -------------------- | ------ | ------ |
| `summit.dates` | 20–21 November 2026 | Nexus brochure: 21–22 November 2025 | 2026 concept note | Review |
| `summit.theme` | Leading Frontiers: Innovate, Integrate, Impact | Nexus: Building Bold. Executing Smart… | 2026 concept note | Review |
| `summit.venue` | Landmark Event Centre, Lagos | — | 2026 concept note | Review |
| `performx.positioning` | PerformX Nexus — The Catalytic Ecosystem | Current site: Execution Think Tank | Nexus brochure | Review |
| `reach.metric` | 1,000,000+ | Brochure: 700,000+ | continental-copy-deck | Approved direction |
| `experience.years` | 26+ years | Brochure: 5 years | continental-copy-deck | Approved direction |
| `identity.name` | Akin Akinpelu, Ph.D., Amb., FLPi | — | person-identity.ts | Approved direction |
| `sponsor.pricing.public` | Hidden — Request partnership deck | Concept note: ₦50M sector ownership | Editorial policy | Review |
| `horizon.council.depth` | Teaser + CTA (v1) | Full programme in Nexus brochure | Nexus brochure | Review |
| `primary.cta` | /contact and /book-dr-akin | Brand emails in brochures | Site routing policy | Review |

## Decisions matrix

Confirm each decision in Cursor chat (reply with number + choice, or “approve all recommended”).

### 1. Use 2026 concept note theme on the summit event page

- [ ] Yes — use Leading Frontiers: Innovate, Integrate, Impact *(recommended)*
- [ ] No — use Nexus brochure theme instead

### 2. Replace "Execution Think Tank" with PerformX Nexus positioning

- [ ] Yes — adopt PerformX Nexus ecosystem framing *(recommended)*
- [ ] No — keep Execution Think Tank positioning

### 3. Contact routing

- [ ] Site routes primary (/contact, /book-dr-akin); brand email secondary *(recommended)*
- [ ] Brand emails and phones primary on page

### 4. No public sponsor pricing on the web

- [ ] Yes — hide pricing; use Request partnership deck CTA *(recommended)*
- [ ] No — publish sponsor tiers/pricing publicly

### 5. Horizon Council depth on PerformX work page (v1)

- [ ] Teaser only — short summary + contact CTA *(recommended)*
- [ ] Full Horizon Council section on work page

## Page plans

### `/work/aald` — AALD

**Hero**

- Kicker: Enterprise · Consulting · Training · Research
- Headline: Building stronger African organisations—
- Headline secondary: through consulting, training and research.
- Primary CTA: Invite Akin Akinpelu to speak → `/meet-akin/speaking`
- Secondary CTA: Discuss a partnership → `/contact`

**What we do**

AALD delivers innovative consulting, executive training and applied research for organisations building across the continent and beyond.

- Strategic consulting and organisational diagnostics
- Executive training and leadership development
- Applied research and capability building
- Culture, performance and transformation support

**Who we serve**

We work with African corporates, public institutions, NGOs and diaspora organisations that need practical leadership and performance systems—not generic playbooks.

**Why AALD**

Founded and led by Akin Akinpelu, Ph.D., Amb., FLPi, AALD combines continental perspective with disciplined execution.

**Part of a broader ecosystem**

AALD sits within the Enterprise pillar alongside PerformX Nexus.

### `/work/performx` — PerformX Nexus

**Hero**

- Kicker: PerformX Nexus · Enterprise
- Headline: Building bold.
- Headline secondary: Executing smart. Performing beyond.
- Primary CTA: Book an advisory session → `/book-dr-akin`
- Secondary CTA: Register interest in the summit → `/events/performx-summit-2026`

**Three pillars**

PerformX Summit · Horizon Council (teaser in v1) · Impact Core

**Who it serves**

C-suite leaders, boards, sector conveners and catalytic partners.

**PerformX Summit 2026 teaser**

20–21 November 2026 · Landmark Event Centre, Lagos · Leading Frontiers theme.

**Partnerships**

Sector ownership on request — no public pricing.

### `/events/performx-summit-2026` — Summit edition

**Hero**

- Dates: 20–21 November 2026
- Theme: Leading Frontiers: Innovate, Integrate, Impact
- Venue: Landmark Event Centre, Lagos
- Primary CTA: Register interest → `/contact`
- Secondary CTA: Explore PerformX Nexus → `/work/performx`

**About the summit**

Two-day leadership convening across eight sectors — Power Room sessions and Nexus Honors. Part of PerformX Nexus and AALD.

**Delegates, speakers and sponsors**

Each pathway coordinated through the team. Registration URLs added when available. Sponsor packages on request — no public pricing.

**Brand lineage**

PerformX Summit is the flagship convening of PerformX Nexus (Enterprise pillar, alongside AALD).

## Approval checklist

- [ ] All five decisions confirmed in Cursor
- [ ] Variables register reviewed (no unresolved conflicts)
- [ ] `/work/aald` copy map approved
- [ ] `/work/performx` copy map approved
- [ ] `/events/performx-summit-2026` copy map approved
- [ ] Cross-links and CTA destinations approved
- [ ] Claims register aligned (reach, years, identity)

## Implementation status

Content updates are in `site-content.ts`, `ecosystem.ts`, and migration `025_aald_performx_content.sql` (aligned to recommended defaults above). Final sign-off in Cursor closes this planning doc.
