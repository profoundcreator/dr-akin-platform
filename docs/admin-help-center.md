# Back Office Help Center

> **Status:** Draft for review — content source for the in-app Help Center (not yet built in the UI).
>
> **Audience:** Everyone who uses the private back office (Executive Assistants, content editors, approvers, and admins).
>
> **Last updated:** August 2026

---

## How to use this document

This guide explains the **Dr. Akin Platform back office** in plain language. Each section maps to a page in the left sidebar.

| If you want to… | Go to section |
|-----------------|---------------|
| Sign in or understand your role | [1. Getting started](#1-getting-started) |
| Handle booking invitations | [2. Requests](#2-requests-booking-pipeline) |
| Reply to contact forms and enquiries | [3. Inbox](#3-inbox-enquiries) |
| Change the homepage | [4. Homepage](#4-homepage) |
| Add or edit events, books, articles, platform pages | [5–8. Content areas](#5-events) |
| Upload or hide images | [9. Working with images](#9-working-with-images) |
| Share private files with organizers | [10. Organizer resources](#10-organizer-resources) |
| Export newsletter subscribers | [11. Audience](#11-audience) |
| Invite a colleague | [12. Team](#12-team) |
| Fix a “run migration” warning | [14. Troubleshooting](#14-troubleshooting) |

---

## 1. Getting started

### What is the back office?

The back office is the **private admin workspace** for running day-to-day operations on [theakinakinpelu.org](https://theakinakinpelu.org) (production URL may still show the Vercel address until DNS is cut over).

It is **not** the public website. Visitors never see it. You sign in at:

**`/admin/login`**

After sign-in, most users land on **Requests** — the booking pipeline.

### Sidebar navigation

| Menu item | What it is for |
|-----------|----------------|
| **Requests** | Speaking and booking invitations from organizers |
| **Inbox** | General enquiries (contact form, newsletter, summit interest, etc.) |
| **Homepage** | Hero layout, banner/portrait images, events section toggle |
| **Events** | Public events at `/events` |
| **Books** | Library at `/resources` and `/library/{slug}` |
| **Insights** | Articles at `/insights` |
| **Work** | Platform pages (AALD, Erudio Hub, PERFORMX, etc.) at `/work/{slug}` |
| **Resources** | Private organizer files (PDFs, ZIPs) — visible to some roles only |
| **Audience** | Marketing opt-in list and CSV export |
| **Email preview** | Read-only preview of transactional emails |
| **Team** | Invite colleagues and manage roles — admins only |
| **Audit Log** | History of sign-ins and admin actions — oversight roles only |
| **Featured Episodes** | Curated podcast list on `/resources/audio` |

Some menu items are **hidden** if your role does not include access. Your name and role appear under the page title in the header.

### Your role — what you can do

Every active team member has a **role**. Roles control what you can change, not just what you can see.

| Role | In plain English |
|------|------------------|
| **Super Admin** | Full control, including team management and permanent deletes |
| **Technical Admin** | Full technical access for developers and platform support |
| **Admin Manager** | Approves content, manages inbox/resources, can manage operational team roles |
| **Executive Assistant** | Manages booking requests, inbox, events, and content approvals |
| **Executive Reviewer** | Reviews booking requests — cannot change published site content |
| **Inbox Manager** | Handles enquiries and inbox messages |
| **Resource Manager** | Manages organizer resource library |
| **Read-only Auditor** | View-only access for oversight and audits |

**Quick rules of thumb:**

- **Read-only Auditor** — can look, cannot save changes to bookings or content.
- **Executive Assistant, Admin Manager, Super Admin** — can **approve and publish** content (events, books, insights, work pages).
- **Everyone else who can write** — can create drafts and **submit for approval**.
- **Super Admin / Admin Manager** — can permanently delete managed content.
- **Team** and **Audit Log** — only visible to certain admin roles.

If an action button is missing, it is usually because your role does not include that permission — not because something is broken.

### First-time sign-in (invited users)

1. You receive an **email invite** from the Team admin.
2. Click the link and **set your password** on the admin login page.
3. Sign in at **`/admin/login`** with your email and new password.
4. You land on **Requests** (or the page you were sent to).

**Invite link opens localhost?** A Super Admin or Technical Admin needs to fix **Supabase → Authentication → URL Configuration** (see `supabase/README.md`), then use **Resend invite** on the Team page.

---

## 2. Requests (booking pipeline)

**Path:** `/admin/requests`

This is the **Executive Assistant workflow** for invitations to speak or appear at events — submissions from the public **Book Dr. Akin** form.

### What you see on the list

- **Stats** at the top: New, Under review, Confirmed, Pending info
- **Search** by reference number, organizer name, organisation, or event name
- **Filters** for status and scheduling conflicts
- Each row shows reference, organizer, event, date, status, assigned EA, and actions

### Quick review vs full detail

- **Quick review** — opens a screening modal without leaving the list. Use this for a fast first look.
- **Open detail** — full workflow page at `/admin/requests/detail?id=…`

### On the detail page

You can:

- Read all organizer and event details (engagement type, format, audience, logistics, VIP protocol)
- Set **Organizer status** — what the organizer sees on their public tracker
- Set **Internal EA status** — private workflow status for the team
- Add an optional **message to organizer** (shown on the public tracker)
- Add an optional **internal note** (team only)
- **Grant organizer materials** — attach private downloadable files to this booking (see [Organizer resources](#10-organizer-resources))
- Review the **status history** timeline

**Read-only Auditor:** you can view everything but cannot save status changes.

---

## 3. Inbox (enquiries)

**Path:** `/admin/inbox`

The Inbox collects messages from sitewide forms — contact, newsletter signup, summit interest, and similar sources — in one place.

### List view

- **Search** across subjects and contact details
- **Filter** by status: All, New, Open, Awaiting Reply, Resolved
- Each item shows source badge, priority, subject, contact, and message preview
- Change status inline: New → Open → Awaiting Reply → Resolved (or Spam / Archived)

### Detail page

**Path:** `/admin/inbox/detail?id=…`

- Read the full message and metadata
- Update status
- **Convert to booking request** — turns a suitable enquiry into a structured booking request (missing fields are marked pending) and sends you to the Requests detail page

---

## 4. Homepage

**Path:** `/admin/homepage`

Controls the public homepage at `/`.

### Important: no draft workflow

Homepage changes **save immediately** to the live site. There is no “Save draft” step. Double-check before saving.

### Fields

| Field | What it does |
|-------|--------------|
| **Show Events section** | Toggle the events strip on the homepage. The *which* event is chosen in **Events** admin (homepage featured). |
| **Hero layout** | **Portrait** (default), **Full-width banner**, or **Minimal** (headline only) |
| **Banner image** | Optional wide image for banner layout |
| **Portrait image** | Optional override of the default portrait |

### Hero layout options

| Mode | Result |
|------|--------|
| **Portrait** | Headline with Dr. Akinpelu’s portrait on the right (site default) |
| **Full-width banner** | Wide image across the top, headline below |
| **Minimal** | Headline only — no hero image |

**Who can edit:** Super Admin, Admin Manager, Executive Assistant.

---

## 5. Events

**Path:** `/admin/events`

Manage public events at `/events` and individual pages at `/events/{slug}`.

### Main fields

| Field | Notes |
|-------|-------|
| Title | Event name |
| Slug | URL path — e.g. `performx-summit-2026` → `/events/performx-summit-2026` |
| Event type | Hosted by Akin / Featured appearance / Organisation brand |
| Brand | Akin, AALD, Erudio Hub, PERFORMX, Other |
| Description | Main event copy |
| SEO description | Short text for search and link previews |
| Starts / Ends | Date and time |
| Timezone | Default: Africa/Lagos |
| Location + location type | In person / Virtual / Hybrid |
| Cover image | Optional — see [Images](#9-working-with-images) |
| Registration URL | Link to sign-up page |
| Registration embed URL | Optional embedded form |
| Payment URL + button label | Optional paid registration |
| **Feature on homepage** | One event can be featured (requires Events section enabled on Homepage) |

### List actions

- **Edit** — load into the form
- **Hide / Show** — hide a published event from the public site without deleting it
- **Set homepage featured** — pick the one event for the homepage strip
- **Delete** — remove permanently (approvers / admins)
- **Export CSV** — download event list

### Publishing workflow

See [Section 13: Publishing workflow](#13-publishing-workflow-draft-approve-publish).

**Approval queue:** If you are an approver, pending items show **Approve & publish**, **Review**, or **Send back** (returns to draft with an optional note).

---

## 6. Books

**Path:** `/admin/books`

Manage the public library at `/resources` and individual book pages at `/library/{slug}`.

### Four sections on the page

| Section | Meaning |
|---------|---------|
| **Live on website** | What visitors see today |
| **Pre-loaded books** | Titles that shipped with the original site setup |
| **Books you manage** | Drafts, pending approval, and published books you created or took over |
| **Removed pre-loaded books** | Pre-loaded titles hidden from the public site |

### Pre-loaded vs managed

- **Pre-loaded books** were built into the site before the admin existed. They are already live.
- **Start managing** — copies a pre-loaded title into the admin so you can edit description, cover, purchase links, and featured status yourself. Other pre-loaded titles stay visible until you publish managed versions.
- **Remove from site** — hides a pre-loaded title without deleting it. **Restore to site** brings it back.

### Main form fields

| Field | Notes |
|-------|-------|
| Title, slug, subtitle, year | Basic book info |
| Category | Marketplace Ministry / High Performance / Academic Excellence |
| Description | Book summary |
| Purchase links | Label + URL pairs (e.g. Amazon, publisher) |
| Cover image | Optional — see [Images](#9-working-with-images) |
| Featured book | One book can be featured site-wide |
| Sort order | Controls display order |

### Actions

- **Save draft** / **Submit for approval** / **Publish**
- **Hide / Show** published books
- **Permanent delete** — Super Admin / Admin Manager only
- **Rebuild site for SEO** — approvers only (see [Section 13](#13-publishing-workflow-draft-approve-publish))

---

## 7. Insights (articles)

**Paths:** `/admin/insights` (list) · `/admin/insights/edit` (editor)

Manage articles at `/insights` and `/insights/{slug}`.

### List page — same pattern as Books

- **Live on website**, **Pre-loaded articles**, **Articles you manage**, **Removed pre-loaded articles**
- **Start managing** / **Remove from site** / **Restore to site** for pre-loaded content
- **Homepage featured** — up to **3 articles** can appear on the homepage
- **Preview** — see how the article will look before publishing
- **New article** — opens the editor

### Editor page

| Area | Fields |
|------|--------|
| **Main editor** | Title, summary/subtitle, rich-text body |
| **Settings** | Slug, category, publish date, sort order |
| | SEO description (max 320 characters) |
| | Original source label + URL (optional credit when republishing) |
| | Homepage featured checkbox (approvers, max 3) |
| | Header/hero image (optional) |

### Actions

- **Preview** — requires title and body
- **Save draft** / **Submit for approval** / **Publish**

---

## 8. Work (platform pages)

**Path:** `/admin/work`

Manage ecosystem platform pages at `/work/{slug}` — e.g. AALD, Erudio Hub, PERFORMX, Auctus Africa.

### Main fields

| Field | Notes |
|-------|-------|
| Slug | URL — e.g. `aald` → `/work/aald` |
| Brand key | AALD, Erudio Hub, PERFORMX, Akin Akinpelu, Other |
| Page title, pillar title, brand label, kicker | Page structure and labels |
| Headline, secondary headline | Hero text |
| Description, hub card description | Body and card teaser on `/work` hub |
| **Sections** (repeatable) | Title, body, bullet list (one bullet per line) |
| Primary CTA label + link | Main call-to-action button |
| Secondary CTA label + link | Optional second button |
| External website | Optional link shown on the page |
| Sort order | Order on the `/work` hub |
| Hero image | Optional illustration — see [Images](#9-working-with-images) |

Use **Add section** / **Remove section** for repeatable content blocks.

### Publishing workflow

Same draft / submit / approve pattern as Events and Books.

---

## 9. Working with images

Most content areas use the same **image control panel**: Upload, preview thumbnail, **Hide image**, **Show image**, and **Remove image**.

### Hide vs Remove — know the difference

| Action | What happens | When to use |
|--------|--------------|-------------|
| **Hide image** | Image stays stored; public page shows **no image**. You can **Show image** again and save. | Temporary — testing layout, seasonal swap, quick A/B |
| **Remove image** | Clears the image path permanently. You must **re-upload** to restore. | Permanent — wrong file, starting fresh |

After either action, click **Save draft** or **Publish changes** to apply.

### Recommended sizes and formats

| Where | Best size | Max file size | Formats |
|-------|-----------|---------------|---------|
| Event cover | 1600×900 px (16:9) | 5 MB | JPG, PNG, WebP |
| Book cover | 1200×1800 px (2:3) | 6 MB | JPG, PNG, WebP |
| Insight hero | 1600×900 px (16:9) | 6 MB | JPG, PNG, WebP |
| Work org hero | 1600×1200 px (4:3) | 6 MB | JPG, PNG, WebP |
| Homepage banner | 2400×1000 px (wide) | 6 MB | JPG, PNG, WebP |
| Homepage portrait | 1200×1500 px (4:5) | 6 MB | JPG, PNG, WebP |

**Tips:**

- Export as **JPG or WebP** for photos; **WebP** is smaller.
- Left-weight important content in wide heroes (tablet crops from the sides).
- Portrait illustrations (e.g. Auctus Africa) work well at **1200×1600** on a **1200×1600** canvas.

All images are **optional** — remove or hide to use text-only layouts.

---

## 10. Organizer resources

**Path:** `/admin/resources` (catalog) · Request detail (grants)

Private, versioned files (PDFs, ZIPs, DOCX, images) shared with **individual booking organizers** — not public downloads.

### Uploading a resource

| Field | Notes |
|-------|-------|
| Title | Required |
| Category | Required grouping |
| Audience | Professional / Christian / Universal |
| Resource key | Logical name for versioning — reusing a key creates a **new version** |
| File | PDF, ZIP, DOCX, JPEG, PNG, WebP — **25 MB max** |

### Granting files to an organizer

1. Open **Requests → detail** for the booking.
2. Find **Organizer materials**.
3. Assign a resource with optional expiry date.
4. The organizer accesses files through their **private tracker link**.

**Revoke** removes access. Role rules apply — Executive Assistants can revoke their own grants; Super Admin / Admin Manager can override any grant.

### Who sees the Resources menu

Super Admin, Admin Manager, Resource Manager, Executive Assistant (with different upload/grant permissions).

---

## 11. Audience

**Path:** `/admin/audience`

View marketing opt-ins collected from:

- Contact form
- Booking form
- Footer newsletter
- Summit interest forms

### What you see

- Active subscribers, ESP-synced count, total records
- Breakdown by source
- Full table: email, name, source, status, ESP provider, consent date
- **Export CSV** for mailings or review

This page is **read/export** — you do not edit subscriber records here.

---

## 12. Team

**Path:** `/admin/team` *(Super Admin, Technical Admin, Admin Manager only)*

### Invite a colleague

1. Enter **email**, **full name**, and **role**.
2. Click invite — they receive an email to set a password.
3. They sign in at `/admin/login`.

Use **Resend invite** if the email did not arrive.

### Manage members

- **Change role** — constrained by your own role
- **Suspend / Reactivate / Remove access**
- **Mark as founder** — Super Admin only, once — protects the primary account from demotion or removal by others

### Account states

| State | Meaning |
|-------|---------|
| Invite sent | Waiting for them to set a password |
| Active | Can sign in and work |
| Suspended | Temporarily blocked |
| Access removed | Permanently revoked |

---

## 13. Publishing workflow (draft, approve, publish)

Applies to **Events, Books, Insights, and Work** pages.

### Status flow

```
Draft  →  Pending approval  →  Published
  ↑            ↓ (Send back)
  └────────────┘
```

| Button | Who can use it | Result |
|--------|----------------|--------|
| **Save draft** | Anyone who can write | Saved as draft — **not** on public site |
| **Submit for approval** | Non-approvers | Moves to **Pending approval** queue |
| **Publish** / **Publish changes** | Super Admin, Admin Manager, Executive Assistant | Live on public site immediately |

### Hide vs permanent delete (published content)

| Action | Effect |
|--------|--------|
| **Hide** | Stays in admin; **hidden from public site**. Show again anytime. |
| **Remove from site** (pre-loaded only) | Hides seed content without managing it in CMS |
| **Permanent delete** | Gone from admin and site — Super Admin / Admin Manager only |

### Homepage and Featured Episodes

- **Homepage** — saves go live immediately (no draft).
- **Featured Episodes** — use the **Published** checkbox; toggle in the list.

### SEO rebuild

After publishing or hiding content, link previews (WhatsApp, LinkedIn) and search engines may lag behind.

- **Automatic:** Publishing/hiding often triggers a background redeploy.
- **Manual:** Approvers can click **Rebuild site for SEO** on Events, Books, Insights, and Work pages.

> Article and book pages already read fresh content from the database on each visit. Use SEO rebuild mainly after URL/slug changes or for social link previews.

---

## 14. Email preview

**Path:** `/admin/settings/email-preview`

Read-only previews of transactional emails sent via Resend:

- Contact form (admin + confirmation)
- Booking form (admin + confirmation)
- Enquiry-to-booking conversion
- Booking status updates

Use this to QA wording before go-live — you cannot edit templates here.

---

## 15. Featured Episodes (audio)

**Path:** `/admin/audio`

Curated podcast episodes shown on `/resources/audio` below the Spotify embed.

| Field | Notes |
|-------|-------|
| Title | Episode name |
| Spotify episode URL | Must contain `/episode/` |
| Description | Short blurb |
| Date label, duration label | Display text |
| Sort order | List order |
| Published | Checkbox — live immediately |

**No approval workflow** — toggle published/hidden directly in the list.

---

## 16. Audit Log

**Path:** `/admin/audit-log` *(Super Admin, Technical Admin, Read-only Auditor)*

Append-only history of:

- Sign-ins
- Content changes
- Team actions
- Other admin events

**Search**, filter by event type, view actor/role/target/summary.

**Export CSV** — Super Admin and Technical Admin only.

---

## 17. Troubleshooting

### Yellow “run migration” banner

If a page shows a setup notice like *“Run migration 00X…”*:

1. A Super Admin or Technical Admin runs the named SQL file in **Supabase → SQL Editor**.
2. Refresh the admin page.

Common migrations:

| Migration | Unlocks |
|-----------|---------|
| `007_site_settings.sql` | Homepage admin |
| `009_library_books.sql` | Books admin |
| `010_insights_articles.sql` | Insights admin |
| `011_work_orgs.sql` | Work admin |
| `012_team_admin.sql` | Team invites |
| `013_preloaded_content_controls.sql` | Hide/restore pre-loaded books & insights |
| `035_optional_image_hidden_flags.sql` | Hide/show image buttons |

Full ordered list: `supabase/README.md`.

### “Demo mode · Mock data”

The back office is not connected to Supabase (missing environment variables). Public site may still work; admin shows sample data. Contact a Technical Admin.

### Changes not showing on the public site

| Cause | Fix |
|-------|-----|
| Saved as **draft** only | Publish or get an approver to publish |
| Content is **hidden** | Show it again in the list |
| Image is **hidden** | Click **Show image** and save |
| Homepage | Saves are immediate — hard-refresh the public page |
| Link preview stale | Wait for deploy or click **Rebuild site for SEO** |
| Old browser cache | Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) |

### Invite link problems

- Link goes to **localhost** → fix Supabase Auth URL Configuration, resend invite.
- **Invite sent** but they cannot sign in → check account is **Active**, not Suspended.

### I don’t see a button my colleague has

Check your **role** in the header. Approvers see Publish; Read-only Auditors see no save buttons; Team and Audit Log are role-gated.

---

## 18. Quick reference cards

### EA daily checklist

1. Check **Requests** → New and Under review
2. Scan **Inbox** → New and Awaiting Reply
3. Update statuses and organizer messages
4. Grant materials on confirmed bookings if needed

### Content editor checklist

1. **Save draft** while working
2. **Submit for approval** when ready
3. Approver **Publish changes**
4. Spot-check on the public site
5. Optional: **Rebuild site for SEO** if sharing links on social

### Image checklist

1. Export at recommended size (table in [Section 9](#9-working-with-images))
2. Upload → preview thumbnail
3. Use **Hide** for temporary; **Remove** for permanent
4. **Save** or **Publish**

### Who approves content?

**Super Admin**, **Admin Manager**, **Executive Assistant**

---

## 19. Glossary

| Term | Meaning |
|------|---------|
| **Back office** | Private admin workspace (`/admin/*`) |
| **Pre-loaded content** | Books/articles that shipped with the original site build |
| **Managed content** | Items you create or take over in the admin |
| **Slug** | URL-friendly name in the address bar |
| **Approver** | Role that can publish without waiting |
| **Grant** | Permission for one organizer to download one resource |
| **ESP** | Email service provider (marketing sync) |
| **SEO rebuild** | Full site redeploy so link previews and search pick up changes |

---

## Appendix: Pages not in the admin

These public pages are edited in the **codebase**, not the back office (as of August 2026):

- About, Speaking marketing copy, Privacy policy text
- Navigation and footer wording
- Default brand assets baked into the site

If you need changes there, flag them for a developer or Super Admin.

---

*End of draft. Edit this file freely — the in-app Help Center will be built from this content in a later step.*
