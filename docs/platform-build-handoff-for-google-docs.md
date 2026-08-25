# Dr. Akin Platform — What Was Built
## Client handoff document · August 2026

**Production site:** https://theakinakinpelu.org  
**Admin login:** https://theakinakinpelu.org/admin/login  
**Repository:** github.com/profoundcreator/dr-akin-platform  

---

### How to open this in Google Docs

1. Go to [Google Drive](https://drive.google.com) → **New** → **File upload**
2. Upload this file: `docs/platform-build-handoff-for-google-docs.md`
3. Right-click the uploaded file → **Open with** → **Google Docs**
4. Optional: **File** → **Save as Google Docs** to edit in your own Drive

You can also copy-paste sections directly from GitHub into a blank Google Doc.

---

## 1. Executive summary

The Dr. Akin Platform is a unified **public website** and **private back office** for Dr. Akin Akinpelu’s continental ecosystem — governance, enterprise, and education — with a secure **booking and enquiry pipeline**, **content management** for events, books, articles, and platform pages, **role-based team access**, **transactional email**, and **SEO foundations**.

The site is live on **theakinakinpelu.org**. The back office is used daily by the Executive Assistant team for bookings, inbox, and content. An in-app **Help Center** guides every admin role.

**Hosting:** Vercel (website) + Supabase (database, auth, storage) + Resend (transactional email) + Cloudflare (DNS).

---

## 2. What was built — from start to finish

### Phase A — Public brand website (foundation)

| Delivered | Detail |
|-----------|--------|
| Homepage | Hero (portrait / banner / minimal modes), corporate transformation, AALD highlight, featured event strip, featured library |
| Work hub | Six platform pages under Governance · Enterprise · Education |
| Meet Akin | Profile, speaking, AU mandate, education governance |
| Resources | Book library (9 titles), insights articles (4), audio page with Spotify + curated episodes |
| Contact | Platform-aware enquiry form with brand routing |
| Privacy | NDPA-oriented privacy notice |
| Navigation & footer | Responsive header, footer columns, Stay Connected modal, newsletter opt-in |
| SEO | Sitemap, robots.txt, RSS, Open Graph, JSON-LD structured data, canonical URLs |
| Brand assets | Wordmark, favicon, portrait pipeline, social OG images |

**Work platforms live:** Future Africa, AALD, PERFORMX, Erudio Hub, Auctus Africa.  
**Retired:** TC Resource Technology (redirects to `/work`).

---

### Phase B — Booking & organizer operations

| Delivered | Detail |
|-----------|--------|
| Book Dr. Akin form | 4-step structured invitation (contact, engagement, schedule, requirements) |
| Global booking modal | Same form from header/footer CTAs with accessibility (keyboard trap, dirty-state warning) |
| Booking reference | Unique ID (e.g. DAA-8492) + secure access token |
| Organizer tracker | Token-gated status page; EA messages visible to organizer |
| Status workflow | Organizer-facing statuses + 14 internal EA stages; full history timeline |
| Admin Requests | Dashboard, search, filters, quick review modal, detail workflow |
| Admin Inbox | Unified enquiries; convert suitable messages to booking requests |
| Organizer materials | Private PDF/ZIP catalog; grant per booking with optional expiry |

---

### Phase C — Content management (back office CMS)

| Area | Admin path | Public URL |
|------|------------|------------|
| Homepage | `/admin/homepage` | `/` |
| Events | `/admin/events` | `/events/{slug}` |
| Books | `/admin/books` | `/library/{slug}` |
| Insights | `/admin/insights` | `/insights/{slug}` |
| Work platforms | `/admin/work` | `/work/{slug}` |
| Featured episodes | `/admin/audio` | `/resources/audio` |

**Publishing workflow:** Draft → Submit for approval → Publish (approvers: Super Admin, Admin Manager, Executive Assistant).

**Pre-loaded content:** Books and insights shipped with the site can be hidden, restored, or “started managing” for full admin edit without losing the original seed.

**Image controls:** Upload, Hide image (temporary), Remove image (permanent) on all optional hero/cover assets.

---

### Phase D — Team, security & compliance

| Delivered | Detail |
|-----------|--------|
| 8 admin roles | Super Admin through Read-only Auditor — see Section 5 |
| Team invites | Email invite → set password → sign in; founder protection on primary account |
| Audit log | Append-only history of sign-ins and admin actions |
| Row Level Security | All database tables protected by role-checked policies |
| Security headers | HSTS, frame denial, nosniff, referrer policy (Vercel) |
| Privacy foundation | Rate-limited contact RPC, consent tracking, GEO metadata |

---

### Phase E — Email & notifications

| Type | Tool | Purpose |
|------|------|---------|
| Transactional | Resend | Contact alerts, booking alerts, confirmations, status updates |
| Brand routing | Env-configured inboxes | AALD, PERFORMX, Erudio, Auctus, EA default |
| Team invites | Supabase Auth (+ optional Resend SMTP) | Back-office access |
| Marketing (ready, not yet live) | Beehiiv or Kit | Newsletter opt-ins sync from site forms |

**Receiving email:** hello@ and ea@ on theakinakinpelu.org (Zoho MX — preserved during DNS cutover).  
**Sending email:** notifications@theakinakinpelu.org via Resend (requires domain verification).

---

### Phase F — Help Center & go-live (August 2026)

| Delivered | Detail |
|-----------|--------|
| In-app Help Center | `/admin/help` — searchable, role-aware guides, side panel navigation |
| Custom domain | theakinakinpelu.org on Cloudflare DNS → Vercel |
| OG image fix | Restored stage audience photo for link previews (WhatsApp, LinkedIn) |
| Tablet hero crop | Left-weighted crops for platform illustrations |
| Admin hide/remove images | Temporary hide and permanent remove on all optional images |

---

## 3. Technical architecture

```
Visitor / Organizer / Admin
         │
         ▼
theakinakinpelu.org (Cloudflare DNS → Vercel)
         │
         ├── Astro 6 static pages + React 19 interactive islands
         ├── 17 serverless API routes (/api/*)
         │
         ▼
Supabase
         ├── PostgreSQL (38 migrations)
         ├── Auth (admin email/password)
         ├── Storage (7 buckets: public assets + private organizer files)
         └── Row Level Security on all tables
         │
         ▼
Resend — transactional email (forms, booking status)
Beehiiv/Kit — marketing newsletters (optional, env-gated)
```

| Layer | Technology |
|-------|------------|
| Frontend | Astro 6, React 19, Tailwind CSS 4 |
| Database | Supabase PostgreSQL |
| Hosting | Vercel |
| DNS | Cloudflare |
| Forms validation | Zod |
| Email (transactional) | Resend |

**Content merge pattern:** Static seed content in code merges with Supabase-published rows. Database wins on slug collision. Admins can hide pre-loaded items without deleting them.

**New page URLs:** Publishing a new slug (event, book, article, work org) triggers a Vercel rebuild so Astro generates the static path. Existing slugs read fresh content from the database on each visit.

---

## 4. Public website — full route map

### Main navigation

| Section | URL | Purpose |
|---------|-----|---------|
| Home | `/` | Hero, transformation, AALD, featured event, featured books |
| Work | `/work` | Ecosystem hub — six platforms |
| Meet Akin | `/meet-akin` | Personal brand hub |
| Resources | `/resources` | Library hub |
| Events | `/events` | Public events |
| Connect | `/contact` | Enquiry form |

### Work platform pages

| URL | Platform |
|-----|----------|
| `/work/future-africa` | Future Africa |
| `/work/aald` | AALD |
| `/work/performx` | PERFORMX |
| `/work/erudio-hub` | Erudio Hub |
| `/work/auctus-africa` | Auctus Africa |

### Meet Akin

| URL | Purpose |
|-----|---------|
| `/meet-akin/profile` | Biography & credentials |
| `/meet-akin/speaking` | Keynote speaking |
| `/meet-akin/au-ambassador` | African Union mandate |
| `/meet-akin/edu-governance` | Board governance |

### Resources & media

| URL | Purpose |
|-----|---------|
| `/library/{slug}` | Individual book pages (9 pre-loaded) |
| `/insights` | Articles hub |
| `/insights/{slug}` | Individual articles (4 pre-loaded) |
| `/resources/audio` | Spotify embed + admin-curated episodes |

### Booking & organizer (not indexed by search engines)

| URL | Purpose |
|-----|---------|
| `/book-dr-akin` | Full booking form |
| `/track-booking` | Reference lookup |
| `/booking/{ref}?token=…` | Private organizer tracker |
| `/organizer-resources` | Explains gated file delivery |

### Other

| URL | Purpose |
|-----|---------|
| `/privacy` | Privacy notice |
| `/rss.xml` | Insights RSS feed |
| `/robots.txt` | Crawl rules |

---

## 5. Back office — admin modules

**Login:** https://theakinakinpelu.org/admin/login

| Module | What you can do |
|--------|-----------------|
| **Requests** | Booking pipeline — statuses, organizer messages, resource grants |
| **Inbox** | All enquiries — contact, newsletter, summit; convert to booking |
| **Homepage** | Hero layout, images, events section toggle (saves live immediately) |
| **Events** | Create/edit events, covers, registration links, homepage featured |
| **Books** | Library CMS, purchase links, featured book, pre-loaded management |
| **Insights** | Article editor, hero images, SEO, homepage featured (max 3) |
| **Work** | Platform pages — sections, CTAs, hero images |
| **Resources** | Organizer file catalog (upload, version, retire) |
| **Audience** | Marketing opt-in list, CSV export, ESP sync status |
| **Email preview** | Read-only preview of all transactional templates |
| **Team** | Invite colleagues, assign roles, suspend/reactivate |
| **Audit Log** | Sign-in and action history |
| **Featured Episodes** | Curated podcast list |
| **Help** | Searchable guides with role-specific instructions |

### Admin roles

| Role | Typical user | Key permissions |
|------|--------------|-----------------|
| Super Admin | Dr. Akin / owner | Everything including team management and permanent deletes |
| Technical Admin | Developer | Technical access, team invites, audit export |
| Admin Manager | Operations lead | Content approval, inbox, resources, operational team |
| Executive Assistant | EA team | Bookings, inbox, content approval, resource grants |
| Executive Reviewer | Senior reviewer | Booking review — no content publishing |
| Inbox Manager | Enquiry handler | Inbox only |
| Resource Manager | File librarian | Organizer resource uploads |
| Read-only Auditor | Oversight | View only — no saves |

---

## 6. How extensible the platform is

This section answers: *“If we need to grow, what is easy vs what needs a developer?”*

### Easy — no code deploy (admin only)

| Task | How |
|------|-----|
| Add or edit an event | Admin → Events → Publish |
| Add or edit a book or article | Admin → Books / Insights |
| Update a platform page (AALD, PERFORMX, etc.) | Admin → Work |
| Change homepage hero | Admin → Homepage |
| Invite a team member | Admin → Team |
| Upload organizer PDFs | Admin → Resources → Grant on booking |
| Hide/show content | Hide toggle in admin lists |
| Export audience CSV | Admin → Audience |

### Moderate — admin + one redeploy

| Task | How |
|------|-----|
| New event/book/article **URL (slug)** | Publish in admin → **Rebuild site for SEO** (or automatic deploy hook) |
| New platform page with new slug | Admin → Work → Publish → SEO rebuild |
| Change featured event / books on homepage | Admin → Events / Books + Homepage toggle |

### Developer required — codebase change + deploy

| Task | Where to change |
|------|-----------------|
| New marketing page (About, new landing page) | New file in `src/pages/` + navigation in `src/lib/navigation.ts` |
| New work platform in navigation taxonomy | `src/data/ecosystem.ts` + static fallback copy + Admin → Work |
| Privacy / legal copy updates | `src/pages/privacy.astro` or lawyer-approved content |
| Footer social links | `src/data/site-contact.ts` |
| Email template wording | `api/_notifications.ts`, `api/_email-layout.ts` |
| New brand inbox for contact routing | `.env` vars + `api/_notification-routing.ts` |
| New admin module | New dashboard component + Supabase migration + route |
| Booking form fields | `src/lib/booking/` + migration |

### Integration extension points (already wired)

| Integration | Extension point | Status |
|-------------|-----------------|--------|
| Transactional email | Resend API + env vars | Live |
| Marketing newsletter | Beehiiv or Kit via `/api/audience-sync` | Built — needs ESP account + env vars |
| SEO rebuild | Vercel deploy hook | Live |
| Calendar sync | Specified in operations-scope.md | Phase 3 — not built |
| CRM | Out of scope v1 | — |

### Scalability characteristics

| Aspect | Extensibility |
|--------|---------------|
| **Content volume** | Unlimited events, books, articles, work pages in database; rebuild scales with Vercel |
| **Team size** | Unlimited admin accounts via role-based invites |
| **Organizer files** | Versioned resource keys; 25 MB per file; private signed URLs |
| **Audience / newsletter** | `audience_members` table + ESP sync; Beehiiv free to 2,500 subscribers |
| **Multi-brand email** | Brand inboxes already routed for AALD, PERFORMX, Erudio, Auctus |
| **New languages/regions** | Would require i18n layer — not in v1 |
| **Mobile app** | Public site is responsive; no native app |

### Architecture strengths for future growth

1. **Static + database hybrid** — Fast public pages with fresh CMS content without rebuilding for every edit.
2. **Role-based admin** — New team members get least-privilege access without custom code.
3. **Migration-based database** — 38 ordered SQL migrations; new features add new migrations without breaking existing data.
4. **API route layer** — Serverless functions for email, sync, file download, team invite — easy to add new endpoints.
5. **Pre-loaded + managed content** — Ship seed content in code; hand off to admin without re-entering everything.
6. **Help Center in code** — Admin documentation updates via markdown + structured guides without a separate docs site.

---

## 7. What is admin-managed vs in the codebase

### Admin-managed (day-to-day, no developer)

- Homepage hero and images  
- All events, books, insights, work platform pages  
- Booking requests and inbox  
- Organizer resource grants  
- Team accounts  
- Featured podcast episodes  
- Audience opt-in list  

### In the codebase (developer deploy)

- Meet Akin marketing copy (profile, speaking pages)  
- Navigation and footer structure  
- Privacy policy text  
- Default portraits and brand assets  
- Booking form structure  
- Email HTML templates  
- Pre-loaded book/article seed text (until “Start managing” in admin)  
- Security headers and redirects  

---

## 8. Roadmap — planned but not yet built

From the product specification (`operations-scope.md`):

| Feature | Phase | Status |
|---------|-------|--------|
| Private executive calendar | 3 | Not built |
| Engagement records (separate from bookings) | 2 | Not built |
| Pre-engagement checklist system | 2 | Not built |
| Travel & logistics workspace | 2 | Not built |
| Event brief PDF generation | 2 | Not built |
| Reporting dashboards | 3 | Not built |
| Google Calendar / Outlook sync | 3 | Specified, deferred |
| Two-factor authentication | — | Decision pending |
| External help site (GitBook etc.) | — | In-app Help built instead |

**Explicitly out of scope for v1:** Full CRM, public live calendar, automated booking confirmation without EA review.

---

## 9. Operational checklist (post go-live)

| Item | Status |
|------|--------|
| Custom domain live | Done — theakinakinpelu.org |
| Cloudflare DNS | Done |
| Vercel Valid Configuration | Done |
| `PUBLIC_SITE_URL` in Vercel | Confirm set to production domain |
| Supabase Auth URLs | Confirm production admin URLs |
| Resend domain verified | Confirm for outbound notifications@ |
| Migration 028 (audience) | Confirm applied in Supabase |
| Newsletter ESP (Beehiiv/Kit) | Next step — see newsletter setup doc |
| Footer social links | Awaiting client URLs |
| Legal privacy sign-off | Awaiting lawyer |
| EA production smoke test | Recommended |

---

## 10. Key URLs & contacts

| Item | Value |
|------|-------|
| Public site | https://theakinakinpelu.org |
| Admin login | https://theakinakinpelu.org/admin/login |
| Admin help | https://theakinakinpelu.org/admin/help |
| Public contact | hello@theakinakinpelu.org |
| EA operations | ea@theakinakinpelu.org |
| GitHub | github.com/profoundcreator/dr-akin-platform |
| Vercel dashboard | vercel.com → dr-akin-platform |
| Supabase dashboard | supabase.com → project dashboard |
| Resend dashboard | resend.com → Domains & API keys |

---

## 11. Related documents in the repository

| Document | Purpose |
|----------|---------|
| `docs/platform-build-handoff-for-google-docs.md` | This document |
| `docs/newsletter-setup-checklist.md` | Beehiiv/Kit newsletter setup |
| `docs/admin-help-center.md` | Admin user guide (also in-app) |
| `docs/email-marketing-setup.md` | ESP integration details |
| `docs/domain-cutover-now.md` | DNS cutover steps |
| `docs/phase1-ops-runbook.md` | Launch operations |
| `operations-scope.md` | Full product specification |
| `supabase/README.md` | Database & auth setup |

---

## 12. Summary statement

The Dr. Akin Platform delivers a production-ready public presence for a continental leadership ecosystem and a private operations layer for bookings, enquiries, content, and team governance. Phase 1 — public site, booking pipeline, CMS, email notifications, admin roles, Help Center, and custom domain — is **built and live**. The platform is designed to grow: new content through admin, new pages through standard development patterns, and marketing newsletters through a one-time ESP connection. Calendar integration, engagement preparation workflows, and advanced reporting remain on the documented Phase 2/3 roadmap.

---

*Document version: August 2026 · Prepared for client handoff and Google Docs import*
