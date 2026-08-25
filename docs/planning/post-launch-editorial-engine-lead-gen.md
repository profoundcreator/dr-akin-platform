# Post-Launch Editorial Engine, Rich Media & Lead-Gen Resource Hub

**Status:** Planning — not in active development  
**Target window:** ~1 month post-launch (after newsletter setup and core ops stabilise)  
**Last updated:** August 2026  
**Audience:** Product owner, content/EA leads, and future Cursor agent runs

---

## Executive summary

Upgrade the Dr. Akin Platform (`Astro 6`, `React 19`, `Supabase`, `Tailwind 4`, `Vercel`) to support **Gates Notes–grade visual journalism** combined with **McKinsey-style gated insights** and **HubSpot-style operational templates**.

All rich media, interactive infographics, operational templates, whitepapers, and dynamic gating rules must be manageable by non-technical staff through the back office **without code changes**, with full operational documentation in `/admin/help`.

This document is the **master planning spec** for a future build. Do not start implementation until newsletter setup is complete and the EA team is stable on current admin flows.

---

## Relationship to the current platform

| Area | Today | After this build |
|------|--------|------------------|
| Insights | Rich-text HTML in Supabase; `sanitizeInsightHtml`; static Astro pages | MDX block registry + interactive editorial components |
| Library / resources | Public books (`/resources`); organizer materials (`/admin/resources` for booking grants) | **New:** lead-gen asset hub (PDF/XLSX/DOCX/ZIP) with gating — distinct from organizer booking materials |
| Audience | `audience_members` + footer/newsletter opt-in (migration 028) | Extended lead capture per asset with source metadata |
| Email | Resend transactional (enquiry/booking notifications) | Add gated-download delivery emails |
| Help Center | Role-aware guides in `/admin/help` | New guides for gating, embedding, lead export |

**Naming clarity:** Today’s `/admin/resources` manages **organizer-approved materials tied to bookings**. This plan introduces a **lead-gen resource catalog** — either extend `/admin/resources` with a new tab/section or add `/admin/lead-assets` to avoid conflating the two workflows. Decide in Phase 1 design review.

---

## 1. Technical architecture & MDX hybrid CMS enhancement

### A. Dynamic MDX & editorial component registry

Extend `/src/content/insights/` and update the Supabase CMS schema to support **block-based editorial rendering**.

#### Interactive infographics component suite (`/src/components/editorial/`)

| Component | Purpose |
|-----------|---------|
| `<DataPointCard />` | Animated statistical counters; scroll-triggered (Framer Motion / `motion`) |
| `<InteractiveTimeline />` | Horizontal/vertical timeline switcher for biographies and frameworks |
| `<ComparisonSlider />` | Before/after visual slider for case studies |
| `<InteractiveChart />` | Lightweight charts (evaluate Recharts vs Chart.js); JSON-driven config from CMS |

#### Editorial layout primitives

| Component | Purpose |
|-----------|---------|
| `<HeroFullBleed />` | Full-screen editorial header; cover art or background video overlay |
| `<PullQuoteCallout />` | Styled pull-quotes; optional inline share + author attribution |
| `<SidebarAnchorNav />` | Sticky scroll-aware table of contents for longform |

#### Integration notes

- Add `@astrojs/mdx` if not already present; align with existing Astro 6 build pipeline.
- Register MDX components in a central **editorial component registry** (`/src/lib/editorial/component-registry.ts`) so admin block picker maps 1:1 to public renderers.
- Existing insight body uses `sanitizeInsightHtml` — migration path: **dual render** (legacy HTML articles vs MDX block JSON) until content is migrated.

---

### B. In-article conversion & lead-gen pipeline

#### Inline engagement blocks

**`<InlineBookingCTA />`**

- Context-aware booking trigger embedded in articles.
- Opens the existing 4-step booking flow (`/book-dr-akin`) with topic/context pre-filled from article metadata (slug, tags, title).

#### Dynamic lead-gen gating engine

**`<GatedResourceCard />`**

Asset types:

- **McKinsey-style:** PDF reports, executive briefings, continental research papers.
- **HubSpot-style:** Excel models, leadership frameworks, slide decks, strategy toolkits (XLSX, DOCX, ZIP).

Lead capture:

- Configurable fields: Name, Email, Phone, Organization/Title, Industry (per-asset toggles in admin).
- **Gated:** High-converting modal form → on submit:
  1. Write lead to `audience_members` and/or new `lead_captures` table with asset + article source metadata.
  2. Trigger transactional email via Resend with secure download link (signed URL).
  3. Unlock inline preview/download in-session.
- **Ungated:** Direct “Download immediately” button; optional soft opt-in checkbox.

Metadata source: Supabase asset row (`is_gated`, `required_fields`, `storage_path`, `file_type`).

#### Post-reading follow-up

**`<PostReadResources />`**

- Footer module on article pages.
- Recommends related whitepapers, templates, or articles by tags/categories/ manual “related asset” links in CMS.

---

## 2. Back-office CMS & lead-gen management

Extend `/admin/insights` and resource management so EAs and content managers control assets and gating without code.

### A. Lead magnet & operational template manager

**Location:** `/admin/resources` (extended) or new `/admin/lead-assets` — TBD Phase 1.

Features:

- Upload PDF, XLSX, DOCX, ZIP to Supabase Storage (max **25 MB** per file).
- **Gating toggle:** Gated vs Ungated (simple switch).
- **Form field configurator:** checkboxes — Require Phone, Require Company Name, Require Role, etc.
- **Asset attachment:** Link asset as “Recommended follow-up” on specific articles or platform pages.
- Categories/tags for hub browsing and `<PostReadResources />`.

### B. Visual block builder in article editor (`/admin/insights`)

- Insert `<GatedResourceCard resourceId="..." />` (or block JSON equivalent) anywhere in article body via visual block selector.
- **Live preview mode** (`/admin/insights/preview`): side-by-side gated form state vs ungated download view.

### C. Lead intelligence & audience dashboard (`/admin/audience`)

Extend existing Audience dashboard:

- Filter leads by whitepaper/template download.
- Export CSV with metadata: Article Source, Company, Phone, Asset Title, Date, Consent source.
- Consider role restriction (Super Admin / Admin Manager only) when implementing — today all admins can export audience.

---

## 3. In-app Help Center & operational documentation

Update `/admin/help` (and source `docs/admin-help-center.md`) with role-aware guides:

1. **Creating & gating McKinsey-style whitepapers and templates**  
   Upload, field requirements, gating on/off, storage limits.

2. **Embedding operational templates in articles**  
   Block picker, preview, post-read recommendations.

3. **Exporting lead data & syncing with EA workflows**  
   Retrieve gated leads, follow-up outreach, Resend delivery troubleshooting.

Guides should reference the **Role lens** toggle and note which roles can upload vs approve vs export.

---

## 4. Execution roadmap

### Phase 1 — Editorial layouts & gated asset engine

**Goal:** Public can encounter gated/ungated assets; data model and storage in place.

- [ ] Integrate `@astrojs/mdx` and editorial layout primitives (`HeroFullBleed`, `PullQuoteCallout`, `SidebarAnchorNav`).
- [ ] Build interactive components (`DataPointCard`, `InteractiveTimeline`, `ComparisonSlider`, `InteractiveChart`) with `client:visible` islands.
- [ ] Supabase migrations:
  - `lead_gen_assets` (or extend resources table with `asset_kind` discriminator)
  - `resource_gating_rules` (required fields JSON, `is_gated`, expiry)
  - `lead_captures` (asset_id, article_id, form payload, consent_at)
  - Extend `audience_members` or link via foreign key for ESP sync
- [ ] Supabase Storage bucket(s): `lead-gen-assets` (private) with RLS + signed URL RPC.
- [ ] Implement `<GatedResourceCard />` with configurable fields and gating toggle.
- [ ] API route: `POST /api/lead-gen-download` — verify submission, mint signed URL, send Resend email.
- [ ] `<InlineBookingCTA />` with article context pre-fill.

**Exit criteria:** One test article with embedded gated PDF; form submission → email → download works; Lighthouse mobile ≥ 92 on test page.

---

### Phase 2 — Back-office resource & lead management UI

**Goal:** Non-technical staff manage assets and gating without deploys.

- [ ] Admin UI: upload, categorize, gating toggle, field requirement checkboxes.
- [ ] Extend `/admin/insights` editor with visual block insertion + asset picker.
- [ ] `/admin/insights/preview` live preview (gated vs ungated states).
- [ ] Wire submissions to Resend + `/admin/audience` lead views and CSV export with new columns.
- [ ] Audit log events: `lead_asset.created`, `lead_capture.submitted`, `lead_asset.gating_changed`.

**Exit criteria:** EA uploads a template, gates it, embeds in article, publishes, captures a test lead end-to-end.

---

### Phase 3 — Post-read follow-ups & Help Center

**Goal:** Discovery loop and documented ops.

- [ ] `<PostReadResources />` recommendation engine (tags + manual overrides).
- [ ] Help Center guides (3 new sections) + update `help-center-guides.ts`.
- [ ] Sync `docs/admin-help-center.md` for Google Docs export if still used.
- [ ] Production smoke script additions for gated download happy path.

**Exit criteria:** Published article shows related assets; Help guides visible per role; smoke test passes.

---

## 5. Constraints & performance rules

| Rule | Requirement |
|------|-------------|
| Page speed | Lighthouse Performance ≥ **92** on mobile for insight pages with components |
| JS budget | Astro Islands — `client:visible` for charts, sliders, gated modals; no full-page React hydration |
| Security | Gated bucket private; signed URLs short-lived (60–300s); same-site POST guards on API routes |
| RLS | Anon cannot read gated objects; lead capture RPC is `SECURITY DEFINER` with validation |
| Brand | Tailwind 4 design tokens; light/dark accessibility; match existing `--ploy-*` system |
| File limits | 25 MB upload cap; virus scan / MIME validation — evaluate Supabase limits vs client-side checks |
| Privacy | Lead forms need consent copy; align with `/privacy` and newsletter consent model |
| ESP | Optional Beehiiv sync for marketing-opt-in on gated forms (reuse `/api/audience-sync` patterns) |

---

## 6. Database sketch (for migration author)

```
lead_gen_assets
  id, title, slug, description, category, tags[],
  storage_path, file_name, mime_type, file_size_bytes,
  is_gated, required_fields jsonb,
  esp_sync_enabled, status (draft|published|archived),
  created_by, created_at, updated_at

lead_captures
  id, asset_id, article_id nullable, page_path,
  email, name, phone, organization, role, industry,
  consent_at, consent_source, metadata jsonb,
  download_token_hash, downloaded_at

article_asset_links
  id, article_id, asset_id, placement (inline|post_read|sidebar), sort_order

resource_gating_rules  (optional if folded into lead_gen_assets)
  asset_id, is_gated, required_fields, thank_you_message, redirect_url
```

Review overlap with existing `organizer_resource_files` — keep schemas separate.

---

## 7. Open decisions (resolve in Phase 1 kickoff)

1. **URL namespace:** `/resources/templates/[slug]` vs `/insights/downloads/[slug]` vs `/library/[slug]`.
2. **Admin location:** extend `/admin/resources` vs new `/admin/lead-assets`.
3. **MDX migration:** big-bang vs new articles only vs per-article conversion tool.
4. **Chart library:** Recharts (React-heavy) vs Chart.js vs static SVG for perf.
5. **Lead table:** extend `audience_members` vs dedicated `lead_captures` with optional audience sync.
6. **Role gates:** who can publish gated assets (mirror content approver roles: Super Admin, Admin Manager, EA)?

---

## 8. Dependencies before starting

- [x] Production domain live (`theakinakinpelu.org`)
- [x] Resend transactional email working (enquiry/booking)
- [ ] Newsletter / Beehiiv setup complete (`docs/newsletter-setup-checklist.md`)
- [ ] EA team onboarded on current admin flows
- [ ] Migration 028 (`audience_members`) confirmed in production

---

## 9. Cursor agent execution prompt (when ready)

When implementing, point the agent at this file and say:

> Implement Phase [N] of `docs/planning/post-launch-editorial-engine-lead-gen.md`. Follow existing codebase conventions. Do not conflate organizer booking resources with lead-gen assets. Maintain Lighthouse ≥ 92. Update `/admin/help` for any new admin surfaces. Commit with tests/smoke updates.

---

## 10. Out of scope (v1 of this initiative)

- Public-facing resource marketplace or paid downloads
- Video hosting (YouTube/Vimeo embed only for v1)
- A/B testing gated form copy
- HubSpot/Salesforce native integrations (CSV export + email is sufficient for v1)
- Multi-language gated forms

---

## Related docs

- `docs/future-work.md` — backlog index
- `docs/newsletter-setup-checklist.md` — do first
- `docs/admin-help-center.md` — help content source
- `docs/platform-build-handoff-for-google-docs.md` — current architecture reference
- `supabase/migrations/028_audience_members.sql` — existing audience schema
