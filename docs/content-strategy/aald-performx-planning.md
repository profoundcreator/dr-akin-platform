# AALD + PerformX Nexus + Summit 2026 — Planning Document

Status key: **Approved direction** means recommended by source review. **Review** means awaiting interactive approval in the admin planning workspace. **Hold** means blocked until a decision is recorded.

Interactive review: `/admin/planning/aald-performx` (shortcut: `/planning/aald-performx` redirects there)

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

### 1. Use 2026 concept note theme on the summit event page

- [x] Yes — use Leading Frontiers: Innovate, Integrate, Impact *(recommended)*
- [ ] No — use Nexus brochure theme instead

### 2. Replace "Execution Think Tank" with PerformX Nexus positioning

- [x] Yes — adopt PerformX Nexus ecosystem framing *(recommended)*
- [ ] No — keep Execution Think Tank positioning

### 3. Contact routing

- [x] Site routes primary (/contact, /book-dr-akin); brand email secondary *(recommended)*
- [ ] Brand emails and phones primary on page

### 4. No public sponsor pricing on the web

- [x] Yes — hide pricing; use Request partnership deck CTA *(recommended)*
- [ ] No — publish sponsor tiers/pricing publicly

### 5. Horizon Council depth on PerformX work page (v1)

- [x] Teaser only — short summary + contact CTA *(recommended)*
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

**About · Audiences · Sectors · Brand lineage**

See admin planning workspace for full section copy maps.

## Approval checklist

- [ ] All five decisions recorded with a selected option
- [ ] Variables register reviewed (no unresolved conflicts marked "hold")
- [ ] `/work/aald` copy map approved
- [ ] `/work/performx` copy map approved
- [ ] `/events/performx-summit-2026` copy map approved
- [ ] Cross-links and CTA destinations approved
- [ ] Claims register aligned (reach, years, identity — no brochure conflicts published)
- [ ] Approver sign-off (super_admin / executive_assistant / admin_manager)

## Implementation sequence

1. Complete interactive review at `/admin/planning/aald-performx`.
2. Mark plan approved when all gates pass.
3. Update `work_orgs` and `site-content.ts` for AALD and PerformX.
4. Update PERFORMX summary in `ecosystem.ts`.
5. Seed and publish `performx-summit-2026` event.
6. Smoke test all routes, cross-links and OG metadata.

No production CMS copy implementation should proceed until this checklist is complete.
