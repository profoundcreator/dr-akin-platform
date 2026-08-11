# Dr. Akin Platform — Presentation & Demo Notes

**Prepared for:** live demo / stakeholder presentation  
**Preview URL:** https://dr-akin-platform.vercel.app  
**Target production domain:** `theakinakinpelu.org` (DNS cutover pending)  
**Suggested total runtime:** 25–35 minutes + Q&A

---

## 1. How to open (30 seconds)

> “This is the new digital platform for Dr. Akin Akinpelu — one public website for his brand, work, and resources, and one private backoffice for the EA team to manage bookings, enquiries, and published content. It replaces scattered email threads and ad‑hoc updates with a single, governed workflow.”

**Three things to land early:**

1. **Public face** — credible, editorial, institution-grade (not a template brochure site).
2. **Operational backbone** — booking requests, inbox, status tracking, resource sharing.
3. **Governance** — role-based admin access, approval workflows, audit trail.

---

## 2. Before you present — checklist

### Must work (do these 30–60 min before)

- [ ] Open https://dr-akin-platform.vercel.app — homepage loads
- [ ] Sign in at `/admin/login` with a demo account (Super Admin or Executive Assistant)
- [ ] Confirm `/admin/requests` loads (no “Admin workspace error”)
- [ ] Confirm at least one insight, event, and book page opens from the public site
- [ ] Have a booking reference ready (e.g. from a prior test submission) for tracker demo
- [ ] Browser: use Chrome, one window, zoom 100%, hide unrelated tabs/bookmarks bar if presenting on screen share

### Good to verify (optional)

- [ ] `/api/notifications-status` — all `checks: true` (email pipeline configured)
- [ ] `/api/health` — `{ ok: true }`
- [ ] `/sitemap-index.xml` and `/rss.xml` load
- [ ] Resend domain verified if you plan to demo live email delivery

### If email demo is part of the presentation

Email requires **both**:

1. Vercel env vars: `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`
2. Resend dashboard: `theakinakinpelu.org` domain **Verified** (API sends do not work to `ea@` without this)

**Safe fallback line if email fails live:**  
> “The form always saves to the database immediately; email is a parallel notification layer. If Resend isn’t fully verified yet, the EA team still sees everything in Admin → Inbox.”

### Accounts to prepare

| Role | Use in demo for |
|------|-----------------|
| `super_admin` | Full tour, team, audit log, publish without approval |
| `executive_assistant` | Day-to-day EA workflow (requests, inbox, approvals) |
| `read_only_auditor` | Optional — show read-only oversight (if account exists) |

---

## 3. Architecture slide (if you show one slide)

```
┌─────────────────────────────────────────────────────────┐
│  PUBLIC SITE (Astro + React)                            │
│  Events · Work · Meet Akin · Library · Insights · Book  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  VERCEL — hosting + serverless API routes               │
│  notify-submission · team-invite · resource-download    │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  SUPABASE — Postgres + Auth + Storage + Row Security    │
│  Single source of truth for bookings, content, team     │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  RESEND — transactional email (alerts + confirmations)  │
│  ea@theakinakinpelu.org receives alerts; reply in Gmail  │
└─────────────────────────────────────────────────────────┘
```

**One-liner:** Static-fast public pages, live data from Supabase, secure admin behind auth, email as notification only (replies happen in the EA’s normal inbox).

---

## 4. Demo walkthrough — detailed script

### ACT 1 — Public brand & credibility (7–8 min)

**Goal:** Show this is a serious institutional platform, not a holding page.

---

#### Stop 1 — Homepage  
**URL:** `/`

**Show:**
- Hero: AU Special Emissary positioning, portrait/banner (CMS-controlled)
- Three pillars: Governance · Enterprise · Education
- Featured events and library sections

**Say:**
> “The homepage is editable from the backoffice — hero mode, portrait, banner, and which sections appear. Content editors don’t need a developer to refresh the front door.”

**Optional admin tie-in (don’t switch yet):** mention `/admin/homepage` controls hero mode (`portrait` / `banner` / `minimal`).

---

#### Stop 2 — Work ecosystem  
**URLs:** `/work` → `/work/performx` → `/work/future-africa`

**Show:**
- Work hub grouped by pillar (Governance, Enterprise, Education)
- Individual platform pages (PERFORMX, Future Africa, AALD, Erudio Hub, Auctus Africa)

**Say:**
> “Each platform in Dr. Akin’s ecosystem has its own page — managed in the CMS, not hard-coded. When a platform updates its story, the EA team publishes from admin without a redeploy for content changes.”

**Note:** TC Resource Technology was retired; old URL redirects to `/work`.

---

#### Stop 3 — Meet Akin  
**URLs:** `/meet-akin/profile` → `/meet-akin/speaking`

**Show:**
- Profile: credentials, biography, structured identity
- Speaking page: keynote positioning + path to booking

**Say:**
> “Meet Akin is the credibility layer — profile for institutions researching Dr. Akin, speaking for organizers ready to invite him. View page source if technical audience: Person schema (JSON-LD) for search engines.”

---

#### Stop 4 — Resources depth  
**URLs:** `/insights` → open one article → `/resources` → one book → `/resources/audio`

**Show:**
- Insights index and a full article (hero image, rich body)
- Library hub with nine titles and category anchors
- Audio archives / featured episodes

**Say:**
> “Insights, books, and audio are all CMS-managed with an approval workflow — draft, submit for approval, publish. Only approvers can push live.”

---

### ACT 2 — Organizer & public enquiry journey (6–7 min)

**Goal:** Show the path from interest → structured submission → tracking.

---

#### Stop 5 — Global “Inquire” button  
**Any public page** — click header **Inquire**

**Show:**
- 4-step booking modal: Contact → Engagement → Schedule → Requirements
- Format-aware fields (virtual vs in-person logistics)
- Success state with reference number and tracker link

**Say:**
> “Organizers can start an invitation from any page — no need to hunt for the booking URL. The same form also lives at `/book-dr-akin` for direct links in emails or proposals.”

**Steps in the form (for reference if asked):**
1. Contact — name, org, email, phone, timezone  
2. Engagement — type, event title, audience, format  
3. Schedule — dates, city/country, travel notes  
4. Requirements — budget range, recording, VIP protocol, terms  

---

#### Stop 6 — Contact page (general enquiries)  
**URL:** `/contact`

**Show:**
- Shorter form: partnerships, media, privacy requests
- Topic dropdown, privacy checkbox, honeypot spam protection

**Say:**
> “Not every message is a booking. Contact handles partnerships, media, and general enquiries separately. These land in the same admin Inbox but are tagged as Contact, not Booking.”

**If demoing live submit:** use your own email; check Admin → Inbox afterward.

---

#### Stop 7 — Booking tracker  
**URLs:** `/track-booking` → `/booking/{DAA-####}?token=…`

**Show:**
- Reference lookup
- Organizer-facing status timeline (Received → Under Review → …)
- Token-secured access in production

**Say:**
> “Organizers get a reference number and a private link. They see only what the EA team chooses to expose — not internal notes or commercial discussions. Booking URLs are noindex and blocked in robots.txt.”

**Security talking point:**
> “Without the access token, production lookup fails closed. Tokens are issued at submission and stored in the organizer’s browser.”

---

#### Stop 8 — Organizer resources (public)  
**URL:** `/organizer-resources`

**Show:**
- Public-approved bios, photos, AV requirements (if uploaded)

**Say:**
> “Approved materials can be published here. EAs can also grant specific files per booking from the request detail page — audited downloads.”

---

### ACT 3 — EA backoffice (10–12 min)

**Goal:** Show this replaces inbox chaos with a managed workflow.

**Start:** `/admin/login` → lands on `/admin/requests`

---

#### Stop 9 — Requests dashboard  
**URL:** `/admin/requests`

**Show:**
- Filter chips: All, New, Under Review, Confirmed, Pending Info, Conflicts
- Search by reference, name, org, event
- EA Review Modal (quick preview without opening full detail)
- Row link to full detail

**Say:**
> “Every booking submission appears here immediately — reference, organizer, event, status, priority. The EA team works from one queue instead of scattered email.”

**Organizer statuses (public-facing):**  
Received · Under Review · Information Required · Tentatively Available · Confirmed · Declined · Cancelled · Completed

**Internal statuses (team-only, 15 stages):**  
New/Unassigned → Screening → Awaiting Executive Review → … → Archived

---

#### Stop 10 — Request detail  
**URL:** `/admin/requests/detail?id={uuid}`

**Show:**
- Full form data from submission
- Update organizer status + optional message to organizer
- Internal status and internal notes (separate from organizer message)
- Priority: Normal / High / VIP
- Resource grants section (assign organizer files to this booking)

**Say:**
> “Internal reasoning stays internal. Organizer messages appear on their tracker. Resource grants let us share briefing packs securely per engagement.”

---

#### Stop 11 — Inbox  
**URLs:** `/admin/inbox` → `/admin/inbox/detail?id={uuid}`

**Show:**
- Unified list: Contact, Booking, Speaking, Follow-up sources
- Status workflow: New → Open → Awaiting Reply → Resolved → Spam → Archived
- **Convert to booking** on a contact enquiry

**Say:**
> “The inbox is the front door for all non-booking messages. When a general enquiry becomes a formal invitation, one click converts it to a structured booking request — no retyping.”

**Demo tip:** If you submitted a contact form in Act 2, open that enquiry here.

---

#### Stop 12 — CMS publish workflow  
**URL:** `/admin/insights` or `/admin/events` (pick one with a draft)

**Show:**
- Create or edit content
- Save draft vs Submit for approval vs Publish (role-dependent)
- SEO fields on insights (summary, description, hero image)
- **Rebuild site for SEO** button (if deploy hook configured)

**Say:**
> “Content creators draft; approvers publish. That mirrors how a professional office governs public statements. Rebuild triggers a fresh deploy so sitemap and static paths stay current.”

**Modules with same pattern:**
- Events → `/admin/events`
- Books → `/admin/books`
- Work orgs → `/admin/work`
- Featured audio → `/admin/audio`

---

### ACT 4 — Governance & operations (4–5 min)

**Goal:** Show enterprise-grade access control.

---

#### Stop 13 — Team management  
**URL:** `/admin/team`

**Show:**
- Role assignment (8 roles)
- Invite flow (email via Supabase + Resend SMTP)
- Account states: invited → active → suspended → revoked

**Say:**
> “Not everyone gets the same admin view. Executive Assistants manage bookings; Resource Managers handle library files; Read-only Auditors can observe without changing anything.”

**8 roles (quick reference):**

| Role | Typical user |
|------|----------------|
| Super Admin | Dr. Akin / platform owner |
| Technical Admin | Developer / IT |
| Admin Manager | Office manager |
| Executive Assistant | Day-to-day EA |
| Executive Reviewer | Senior review, read-heavy |
| Inbox Manager | Enquiries only |
| Resource Manager | Library & organizer files |
| Read-only Auditor | Oversight / compliance |

---

#### Stop 14 — Organizer resource vault  
**URL:** `/admin/resources`

**Show:**
- Upload files (bio PDFs, photos, AV specs)
- Visibility: public / organizer-only / internal
- Versioning

**Say:**
> “One canonical place for organizer materials — no more ‘which attachment was the latest bio?’”

---

#### Stop 15 — Audit log  
**URL:** `/admin/audit-log`

**Show:**
- Immutable event history: status changes, publishes, team actions

**Say:**
> “Every significant action is logged with actor, target, and timestamp. Visible to Super Admin, Technical Admin, and Read-only Auditor.”

---

### ACT 5 — Technical confidence (2–3 min)

**For technical stakeholders or “how does this scale?” questions.**

| URL | What to show |
|-----|----------------|
| `/robots.txt` | Allows public site; blocks `/admin`, booking paths |
| `/sitemap-index.xml` | Auto-generated sitemap |
| `/rss.xml` | Published insights feed |
| `/api/notifications-status` | Email config health (all checks true) |
| View source on `/insights/{slug}` | JSON-LD `Article` schema |

**Say:**
> “SEO is built in — structured data, sitemap, RSS, canonical URLs, Open Graph. Booking and admin paths are excluded from search indexing by design.”

---

## 5. Email & notifications — explain clearly

**Strategy (important for EA team buy-in):**

- The backoffice does **not** replace Gmail/Outlook.
- Supabase is the **system of record** (Inbox + Requests).
- Resend sends **notifications only**:
  - New contact enquiry → `ea@theakinakinpelu.org`
  - New booking → `ea@theakinakinpelu.org`
  - Optional auto-reply to submitter
- **Reply-To** on team alerts = submitter’s email → EA replies in normal mail client.

**Resend setup (if asked “why didn’t email arrive?”):**

1. Domain `theakinakinpelu.org` verified in Resend (sending DNS — separate from MX for receiving)
2. `NOTIFICATION_FROM_EMAIL` on verified domain (e.g. `notifications@theakinakinpelu.org`)
3. `ADMIN_NOTIFICATION_EMAIL=ea@theakinakinpelu.org`
4. Migration `022` applied (dedup tracking)

---

## 6. What is live today vs what is next

### Live now (demo with confidence)

| Area | Status |
|------|--------|
| Full public website | ✅ Preview on Vercel |
| Admin backoffice (8 roles) | ✅ Production-tested |
| Booking submission + tracker | ✅ |
| Unified inbox + convert to booking | ✅ |
| CMS: events, books, insights, work, homepage, audio | ✅ |
| Organizer resource vault + per-booking grants | ✅ |
| Team invites | ✅ (with Resend SMTP in Supabase) |
| Audit log | ✅ |
| SEO: sitemap, RSS, JSON-LD, robots | ✅ |
| Branded email templates | ✅ (deploy latest commit) |

### Pending / say honestly if asked

| Item | Notes |
|------|-------|
| Custom domain `theakinakinpelu.org` | DNS cutover — preview URL is temporary |
| Resend domain verification | Required for production email to `ea@` |
| Footer social links | Awaiting client-approved URLs |
| Copy final sign-off | Continental mandate deck in review |
| Calendar / engagements module | Phase 2 — not built |
| Pre-event checklists, travel workspace | Phase 2–3 |
| Two-factor auth for admins | Under consideration |

**Honest roadmap line:**
> “Phase 1 is the public platform plus booking and content operations. Phase 2 adds calendar, engagements, and logistics workspaces — the foundation is in place.”

---

## 7. Likely questions & suggested answers

**Q: Can we edit the website ourselves?**  
A: Yes — homepage, events, books, insights, work pages, and audio from admin. Structural changes still go through development.

**Q: What happens if Supabase is down?**  
A: Public pages with static fallbacks still render; booking and admin need the database. Production is on managed Supabase with backups.

**Q: Is organizer data secure?**  
A: Row Level Security on all tables; booking lookup requires access token; admin requires authenticated role; downloads are audited.

**Q: Why Vercel preview URL and not the custom domain yet?**  
A: Platform is ready; DNS cutover is a registrar task. MX records for `ea@` and `hello@` must be preserved during cutover.

**Q: Can two EAs both receive notifications?**  
A: Yes — point `ADMIN_NOTIFICATION_EMAIL` at the shared `ea@` inbox (or a distribution list).

**Q: What about the old site?**  
A: Redirects can be configured at DNS/Vercel cutover; one legacy work URL already redirects (`/work/tc-resource-technology` → `/work`).

---

## 8. Demo failure — backup plans

| Problem | Backup |
|---------|--------|
| Admin login fails | Use pre-opened session; or show demo mode banner (mock data without Supabase) |
| `/admin/requests` error | Hard refresh; confirm latest deploy; fall back to Inbox demo |
| Live form submit slow | Use pre-seeded request in dashboard |
| Email doesn’t send | Show enquiry in Admin → Inbox; explain Resend verification pending |
| CMS publish doesn’t show | Insight/event pages read live from Supabase — refresh; mention deploy hook for sitemap |
| Screen share lag | Pre-open tabs in order; use separate speaker notes device |

---

## 9. Short demo (15 min version)

If time is tight, cut to this order:

1. `/` — homepage (1 min)  
2. `/work/performx` — CMS ecosystem (1 min)  
3. Header **Inquire** — booking modal (2 min)  
4. `/admin/requests` — EA dashboard (3 min)  
5. `/admin/inbox` — enquiries (2 min)  
6. `/admin/insights` — publish workflow (2 min)  
7. `/admin/team` — roles (1 min)  
8. Wrap: domain cutover + email + Phase 2 roadmap (3 min)

---

## 10. Closing statement (30 seconds)

> “What you’ve seen is a unified public platform and a private operations layer — bookings, enquiries, content, and team access in one place. The preview is live today; custom domain and email verification are the remaining go-live steps. The EA team can run day-to-day operations from this backoffice while Dr. Akin’s public presence stays consistent, current, and governable.”

---

## Appendix A — Full public route map

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/events`, `/events/{slug}` | Events |
| `/work`, `/work/{slug}` | Ecosystem / platforms |
| `/meet-akin/*` | Profile, AU mandate, governance, speaking |
| `/resources`, `/library/{slug}` | Book library |
| `/insights`, `/insights/{slug}` | Articles |
| `/resources/audio` | Podcast / audio |
| `/book-dr-akin` | Booking form (noindex) |
| `/track-booking`, `/booking/{ref}` | Tracker (noindex) |
| `/contact` | General enquiries |
| `/organizer-resources` | Public organizer files |
| `/privacy` | Privacy notice |

## Appendix B — Admin route map

| Route | Module |
|-------|--------|
| `/admin/login` | Sign in |
| `/admin/requests` | Booking dashboard |
| `/admin/requests/detail?id=` | Booking detail |
| `/admin/inbox` | Enquiries |
| `/admin/inbox/detail?id=` | Enquiry detail |
| `/admin/homepage` | Homepage CMS |
| `/admin/events` | Events CMS |
| `/admin/books` | Library CMS |
| `/admin/insights` | Articles CMS |
| `/admin/work` | Work org CMS |
| `/admin/resources` | Organizer files |
| `/admin/audio` | Featured episodes |
| `/admin/team` | Team & invites |
| `/admin/audit-log` | Audit history |

## Appendix C — Key contacts & addresses

| Item | Value |
|------|-------|
| Public contact (site) | hello@theakinakinpelu.org |
| EA operational inbox | ea@theakinakinpelu.org |
| Preview URL | https://dr-akin-platform.vercel.app |
| GitHub | github.com/profoundcreator/dr-akin-platform |

---

*Last updated: August 2026 — align with latest deploy before presenting.*
