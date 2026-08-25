# Dr. Akin Platform — What Was Built (Abridged)
## Client summary · August 2026

**Live site:** https://theakinakinpelu.org  
**Admin sign-in:** https://theakinakinpelu.org/admin/login  
**Full technical handoff:** `docs/platform-build-handoff-for-google-docs.md`

---

## For the client — in plain language

You now have **one integrated platform** for Dr. Akin’s public presence and your team’s day-to-day work.

**Visitors and organisers** can explore the continental ecosystem (Governance, Enterprise, Education), read books and articles, submit contact enquiries, and request speaking engagements through a structured booking form. Organisers receive a reference number and a private link to track their invitation.

**Your Executive Assistant team** works in a secure back office: review booking requests, manage the unified inbox, publish events and content, grant approved materials to confirmed bookings, invite colleagues with different permission levels, and follow step-by-step guides in the built-in Help Center.

**Email is operational:** when someone submits a contact form or booking, the right inbox is notified and the submitter receives a confirmation. This runs on your live domain.

**The site is live** on `theakinakinpelu.org`, with search-engine foundations (sitemap, structured data, link previews) and your stage-audience photo restored for WhatsApp and social sharing.

---

## What was delivered

### Public website
- Homepage with portrait/banner options, featured event, and featured books
- Work hub and six platform pages (Future Africa, AALD, PERFORMX, Erudio Hub, Auctus Africa)
- Meet Akin (profile, speaking, AU mandate, education governance)
- Book library (9 titles) and insights articles (4 essays)
- Events hub, contact form with brand-aware routing, privacy notice
- Audio page with Spotify and admin-curated featured episodes
- Footer newsletter signup (ready; ESP connection is next step — see pipeline)

### Booking & organiser experience
- Four-step “Book Dr Akin” invitation form (also available as a site-wide modal)
- Unique booking reference (e.g. DAA-8492) and secure tracker link
- Status page for organisers with EA messages and approved download materials

### Back office (admin)
- **Requests** — booking pipeline with search, filters, and full detail workflow
- **Inbox** — all contact enquiries; convert suitable messages into bookings
- **Content** — homepage, events, books, insights, work platforms, featured episodes
- **Resources** — private materials granted per booking (PDFs, etc.)
- **Audience** — marketing opt-ins from forms (list + CSV export)
- **Team** — invite staff, assign roles, suspend access
- **Audit log** — history of admin actions (restricted roles)
- **Email preview** — view transactional email templates before they go out
- **Help Center** — searchable, role-aware guides with side-panel navigation

### Security & infrastructure
- Eight admin roles (Super Admin through Read-only Auditor)
- Database protected by row-level security; security headers on every page
- Custom domain on Cloudflare DNS → Vercel hosting → Supabase database and auth
- Transactional email via Resend; receiving mail preserved on Zoho (hello@, ea@)

### Go-live work (August 2026)
- Custom domain cutover to `theakinakinpelu.org`
- In-app Help Center with role lens
- Admin controls to hide or remove optional images (including tablet crop for platform art)
- Post-launch fixes: notification emails, email preview access, www→apex redirect

---

## Verified working (August 2026)

These flows were tested on the live site:

- Contact enquiry → Inbox + EA notification email
- Booking submission → Requests + confirmation + tracker link
- Admin sign-in, inbox detail, email preview templates
- `www.theakinakinpelu.org` redirects to `theakinakinpelu.org`

---

## Technical snapshot (for your dev team)

| Layer | Stack |
|-------|--------|
| Frontend | Astro 6, React 19, Tailwind CSS 4 |
| Hosting | Vercel |
| Database & auth | Supabase (PostgreSQL, 38 migrations, RLS) |
| DNS | Cloudflare |
| Transactional email | Resend |
| Marketing email (ready, not connected) | Beehiiv or Kit via `/api/audience-sync` |

**Architecture in one line:** Static Astro pages + React interactive areas on Vercel; forms and admin write to Supabase; serverless API routes handle notifications, downloads, team invites, and audience sync.

**API surface:** 10 serverless functions under `/api/` (Hobby-plan limit: 12).

**Content model:** Seed content in code merges with Supabase-published rows; database wins on conflicts. New slugs trigger a site rebuild for SEO-friendly URLs.

For route maps, role permissions, env var lists, and migration references, see the full handoff document.

---

## Features in the pipeline

Work **not yet live** but planned or partially built. Ordered by recommended priority.

### 1. Newsletter connection — **next up**
**Status:** Code built; Beehiiv account + editorial strategy workshop pending  
**Guides:**  
- Setup: `docs/newsletter-setup-checklist.md`  
- Editorial planning (Gemini/Claude): `docs/planning/newsletter-editorial-strategy-conversation-guide.md`

What it adds: personal-letter-style segmented email, lead gen per org (AALD, PerformX, etc.), site as influence hub. Share buttons live on insights + events.

---

### 2. Admin roles reference sheet — **this week (non-critical)**
**Status:** Discussed; Google Sheet for team onboarding

What it adds: a visual matrix of who can do what (EA vs Inbox Manager vs Resource Manager, etc.). Help Center already covers this in-app; the sheet is for offline planning.

---

### 3. Post-launch editorial engine & lead-gen hub — **~next month**
**Status:** Planning spec only  
**Guide:** `docs/planning/post-launch-editorial-engine-lead-gen.md`

What it adds for visitors:
- Richer longform articles (interactive charts, timelines, full-bleed heroes)
- Downloadable whitepapers and operational templates (Excel, slide decks, PDFs)
- Optional “gate” — visitors leave name/email to download premium resources
- Booking prompts inside articles; related resources after reading

What it adds for staff:
- Upload and categorise lead magnets in admin
- Toggle gated vs free download per asset
- Choose which form fields to require
- Embed download cards inside articles without code changes
- Export leads by asset with source article metadata

**Dependencies:** Newsletter setup complete; EA team stable on current admin.

---

### 4. Standalone admin help website — **backlog**
**Status:** Planned  
**Guide:** `docs/future-work.md`

What it adds: a separate help site (e.g. `help.theakinakinpelu.org`) for longer documentation. The in-app Help Center at `/admin/help` remains the primary guide today.

---

### 5. UX and governance polish — **backlog (nice-to-have)**
Not blocking public use; improve when capacity allows.

| Item | Benefit |
|------|---------|
| Admin mobile navigation | Sidebar works on desktop only today; add menu for phones/tablets |
| Audience export by role | Restrict subscriber CSV export to senior roles |
| Social preview cache refresh | Force WhatsApp/LinkedIn to pick up latest OG image if previews look stale |
| Enquiry modal UX refinements | Smoother contact flow on mobile |

---

### 6. Out of scope for near term
- HubSpot/Salesforce native CRM integrations (CSV + email sufficient for now)
- Paid downloads or public resource marketplace
- Multi-language forms
- Video hosting beyond embeds (YouTube/Spotify)

---

## Recommended sequence

```
Now          → Newsletter setup (Beehiiv + Vercel env)
This week    → Team invites + Help Center walkthrough (roles sheet optional)
Next month   → Editorial engine Phase 1 (gated assets + rich article components)
When ready   → Standalone help site, mobile admin nav, audience role gates
```

---

## Document map

| Document | Purpose |
|----------|---------|
| **This file** | Short client summary + pipeline |
| `docs/platform-build-handoff-for-google-docs.md` | Full build reference (upload to Google Docs) |
| `docs/newsletter-setup-checklist.md` | Connect Beehiiv/Kit |
| `docs/planning/post-launch-editorial-engine-lead-gen.md` | Future rich media & lead-gen spec |
| `docs/future-work.md` | Engineering backlog index |
| `docs/pre-launch-checklist-aug-2026.md` | Launch gate checklist (historical reference) |
| `docs/admin-help-center.md` | Help Center source content |

---

*Last updated: August 2026 · Production URL: theakinakinpelu.org*
