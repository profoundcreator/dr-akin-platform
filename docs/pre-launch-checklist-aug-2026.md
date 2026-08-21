# Pre-launch checklist — Sunday 23 August 2026

**Target go-live:** Sunday, 23 August 2026  
**Primary domain:** `theakinakinpelu.org` (or interim Vercel URL until DNS cutover)  
**Last updated:** 21 August 2026

Use this as the single launch gate list. Items marked **Blocker** must pass before public launch.

---

## Status key

| Symbol | Meaning |
| ------ | ------- |
| ☐ | Not started |
| ◐ | In progress |
| ☑ | Done |
| — | Post-launch (defer) |

---

## Launch summary (at a glance)

| Area | Blockers remaining |
| ---- | ------------------ |
| **Automated form emails** | Resend domain + env vars (Saturday); **brand routing built**; production smoke test |
| **Admin / EA access** | EA sign-in confirmed |
| **Infrastructure** | Migrations, DNS (if custom domain), Auth URLs |
| **Content & assets** | Copy sign-off, book covers, speaking photos |
| **Legal** | Lawyer sign-off on privacy notice |
| **Testing** | Full smoke test on live URL |

---

## 1. Automated form emails (Blocker)

### 1A. What must work at launch

| # | Requirement | Built in code? | Status |
| --- | ----------- | -------------- | ------ |
| 1.1 | **Submitter acknowledgement** — contact form (“We received your enquiry”) | ☑ Yes | ☐ Verify in production |
| 1.2 | **Submitter acknowledgement** — booking form (reference + tracker link) | ☑ Yes | ☐ Verify in production |
| 1.3 | **Team notification** — contact submissions routed to correct brand inbox | ☑ Yes | ☐ Configure env + smoke test |
| 1.4 | **Team notification** — booking submissions to EA / organizer pipeline | ☑ Yes (single `ADMIN_NOTIFICATION_EMAIL`) | ☐ Verify in production |
| 1.5 | Branded HTML templates (site colours, logo) | ☑ Yes | ☐ Logo loads in email (`/brand/akin-logo-mono.png`) |

**Today:** all team alerts go to one address (`ADMIN_NOTIFICATION_EMAIL`, typically `ea@theakinakinpelu.org`). **Before launch:** route (or copy) notifications to brand inboxes below.

### 1B. Brand notification routing (Blocker — engineering)

**Required notification recipients:**

| Brand / platform | Notification email | Typical triggers |
| ---------------- | ------------------ | ---------------- |
| **EA / core operations** | `ea@theakinakinpelu.org` | Booking requests, organizer support, general ops (recommend keep on all booking alerts) |
| **AALD** | `hello@aaldcompany.org` | AALD partnerships, facilitation enquiries, AALD-related contact |
| **PerformX Nexus** | `performx@aaldcompany.org` | PerformX partnerships, summit interest, PerformX contact |
| **Erudio Hub** | `hello@erudiohub.org` | Erudio Hub partnerships, education/governance enquiries |
| **Auctus Africa** | `info@auctusafrica.org` | Auctus Africa programmes, community/education enquiries |
| **Public site (general)** | `hello@theakinakinpelu.org` | Media, general, privacy requests (optional CC to `ea@`) |

**Engineering tasks (before Sunday):**

| # | Task | Owner | Status |
| --- | ---- | ----- | ------ |
| 1.B.1 | Define routing rules: contact topic, referrer page (`/work/aald`, etc.), or new “Platform” field on contact form | Product + dev | ☑ |
| 1.B.2 | Implement multi-recipient or per-brand routing in [`api/notify-submission.ts`](../../api/notify-submission.ts) / [`api/lib/notification-routing.ts`](../../api/lib/notification-routing.ts) | Dev | ☑ |
| 1.B.3 | Env vars or config for each brand inbox (see §1C) | Dev | ◐ `.env.example` updated; Vercel pending |
| 1.B.4 | Submitter acknowledgement unchanged (always to person who filled the form) | Dev | ☑ |
| 1.B.5 | Confirm external domains can **receive** mail (MX on `aaldcompany.org`, `erudiohub.org`, `auctusafrica.org` — no Resend verify needed for *receiving*) | Client / IT | ☐ |
| 1.B.6 | Smoke test: one submission per brand path → correct inbox + submitter ack | EA + dev | ☐ Blocker |

**Suggested routing (starting point — confirm with client):**

| Form / source | Team notification goes to |
| ------------- | --------------------------- |
| Booking (`/book-dr-akin`, modal) | `ea@theakinakinpelu.org` |
| Contact — from `/work/aald` or topic “AALD / partnership” | `hello@aaldcompany.org` (+ optional `ea@`) |
| Contact — from `/work/performx`, summit, PerformX partnership | `performx@aaldcompany.org` (+ optional `ea@`) |
| Contact — from `/work/erudio-hub` | `hello@erudiohub.org` |
| Contact — from `/work/auctus-africa` | `info@auctusafrica.org` |
| Contact — media, privacy, general, organizer | `ea@theakinakinpelu.org` or `hello@theakinakinpelu.org` |

### 1C. Resend & Vercel configuration (Blocker)

| # | Task | Status |
| --- | ---- | ------ |
| 1.C.1 | Apply migration **`022_submission_notifications.sql`** in production Supabase | ☐ |
| 1.C.2 | **Resend:** verify sending domain `theakinakinpelu.org` (SPF/DKIM); **keep MX** for `ea@`, `hello@` | ☐ Blocker |
| 1.C.3 | Vercel env: `RESEND_API_KEY` | ☐ Blocker |
| 1.C.4 | Vercel env: `NOTIFICATION_FROM_EMAIL=notifications@theakinakinpelu.org` | ☐ Blocker |
| 1.C.5 | Vercel env: `ADMIN_NOTIFICATION_EMAIL=ea@theakinakinpelu.org` (bookings + fallback) | ☐ Blocker |
| 1.C.6 | Vercel env: brand routing (after build), e.g. `NOTIFY_AALD=hello@aaldcompany.org`, `NOTIFY_PERFORMX=performx@aaldcompany.org`, `NOTIFY_ERUDIO=hello@erudiohub.org`, `NOTIFY_AUCTUS=info@auctusafrica.org` | ☐ Blocker |
| 1.C.7 | Vercel env: `SEND_SUBMITTER_CONFIRMATION=true` | ☐ |
| 1.C.8 | Vercel env: `SUPABASE_SERVICE_ROLE_KEY` (required for `/api/notify-submission`) | ☐ Blocker |
| 1.C.9 | Redeploy production after env changes | ☐ |
| 1.C.10 | Optional: `/api/notifications-status?key=…` health check | ☐ Recommended |

**Note:** Form data always saves to Supabase even if email fails — verify email separately before launch.

### 1D. Explicitly post-launch (do not block Sunday)

| Item |
| ---- |
| Organizer status-update emails (Under Review → Confirmed) |
| Enquiry → booking conversion notification |
| Marketing ESP (Beehiiv/Kit) + newsletter campaigns |
| Admin email template editor |
| SMS / WhatsApp notifications |

---

## 2. Admin team access (Blocker)

| # | Task | Status |
| --- | ---- | ------ |
| 2.1 | Super Admin can sign in at `/admin/login` | ☐ |
| 2.2 | EA account can sign in (`npm run reset:admin-access` if invite failed) | ☐ Blocker |
| 2.3 | Resend SMTP in Supabase for **team invite** emails (removes 2/hour cap) | ☐ Recommended |
| 2.4 | EA can open **Inbox**, **Requests**, and **Work** | ☐ |
| 2.5 | `PUBLIC_SITE_URL` matches live site (invite links must not point to localhost) | ☐ |

---

## 3. Infrastructure & domain (Blocker for custom domain)

| # | Task | Status |
| --- | ---- | ------ |
| 3.1 | Production Supabase migrations **018–026** applied (`026` adds contact platform context) | ☐ |
| 3.2 | `PUBLIC_SITE_URL` set to production URL in Vercel | ☐ |
| 3.3 | Supabase Auth **Site URL** + **Redirect URLs** updated for live domain | ☐ |
| 3.4 | DNS: `theakinakinpelu.org` → Vercel (A/CNAME); **preserve MX** for email | ☐ |
| 3.5 | SSL active on custom domain | ☐ |
| 3.6 | `VERCEL_DEPLOY_HOOK_URL` set (admin “Rebuild site for SEO”) | ☐ Recommended |

**Interim:** Launch on `dr-akin-platform.vercel.app` is possible if DNS is not ready — update `PUBLIC_SITE_URL` and Auth URLs accordingly.

---

## 4. Content, copy & assets (Blocker for credibility)

| # | Task | Status |
| --- | ---- | ------ |
| 4.1 | AALD + PerformX pages match approved plan (CTAs, copy, summit event) | ☑ Verify live |
| 4.2 | Continental copy deck sign-off | ☐ |
| 4.3 | Approved social URLs in footer (`site-contact.ts`) | ☐ |
| 4.4 | Tier-1 portraits deployed (profile, Meet, Work) | ◐ |
| 4.5 | Speaking page stage photography (or accept interim) | ☐ |
| 4.6 | Seven Star + publisher book covers (no SVG placeholders on library) | ☐ |
| 4.7 | Brand logos in `/brand/` (used in transactional emails) | ☐ Verify |
| 4.8 | PerformX Summit 2026 event page (`/events/performx-summit-2026`) | ☐ |

---

## 5. Legal & privacy (Blocker)

| # | Task | Status |
| --- | ---- | ------ |
| 5.1 | Privacy notice live at `/privacy` | ☑ |
| 5.2 | Lawyer sign-off (address, NDPC registration, DPAs) | ☐ |
| 5.3 | Remove “For legal review” callouts after counsel approval | ☐ |
| 5.4 | Marketing opt-in checkboxes align with privacy §2.3 | ☑ |
| 5.5 | Privacy notice mentions brand/platform processors if routing to external org inboxes | ☐ After routing built |

---

## 6. End-to-end testing (Blocker)

Run [`production-smoke-checklist.md`](production-smoke-checklist.md) on the **live URL** before Sunday.

| # | Area | Status |
| --- | ---- | ------ |
| 6.1 | Automated: `npm run verify:smoke:production` | ☐ |
| 6.2 | Contact form → Admin Inbox | ☐ |
| 6.3 | Booking form → Admin Requests | ☐ |
| 6.4 | **Email:** submitter acknowledgement received (contact + booking) | ☐ Blocker |
| 6.5 | **Email:** brand/EA notification received at correct inbox per route | ☐ Blocker |
| 6.6 | Booking tracker lookup works | ☐ |
| 6.7 | Insights, library, work pages, SEO (`robots.txt`, sitemap, RSS) | ☐ |
| 6.8 | Link preview on one insight URL | ☐ |
| 6.9 | Archive or delete test submissions after sign-off | ☐ |

---

## 7. Countdown to Sunday 23 August 2026

| When | Focus |
| ---- | ----- |
| **Fri 21 Aug (today)** | Brand email routing code + migration `026` + contact `?platform=` links (**no domain/DNS required**) |
| **Sat 22 Aug** | DNS cutover, Resend domain verify on `theakinakinpelu.org`, Vercel env vars, apply migration `026` |
| **Sat 22 Aug (eve)** | Full smoke test on production: every form × every inbox × submitter ack |
| **Sun 23 Aug (am)** | Auth URLs updated if domain changed |
| **Sun 23 Aug** | EA live test submission; client sign-off; announce |

### Launch-day sequence (Sunday 23 August)

1. Final smoke test on production URL (forms + **all email paths**).
2. DNS cutover (if ready) or confirm public URL.
3. Update Auth redirect URLs if domain changed.
4. EA submits one live contact + booking test; confirms **submitter ack + brand/EA notifications**.
5. Client sign-off on [`final-audit-report.md`](final-audit-report.md).
6. Announce / share live URL.

---

## 8. Explicitly post-launch (do not block Sunday)

| Item |
| ---- |
| Marketing ESP (Beehiiv/Kit) + newsletter campaigns |
| Footer newsletter signup + ESP sync + `/admin/audience` |
| Homepage hero portrait swap |
| Admin calendar, travel workspace, PDF exports |
| Full site photography shoot |
| PerformX summit external registration integration |

---

## 9. Email architecture — target at launch

```text
Contact / Booking form
        ↓
   Supabase (always saves)
        ↓
/api/notify-submission (Resend)
        ├──→ Submitter email          (acknowledgement — always)
        └──→ Team notification(s)     (routed by brand / form type)
                 ├── ea@theakinakinpelu.org      (bookings, ops)
                 ├── hello@aaldcompany.org       (AALD)
                 ├── performx@aaldcompany.org    (PerformX)
                 ├── hello@erudiohub.org         (Erudio Hub)
                 └── info@auctusafrica.org       (Auctus Africa)
```

**Sender (all outbound):** `notifications@theakinakinpelu.org` (Resend verified domain)  
**Team invites:** separate path — Supabase Auth + Resend SMTP

---

## Sign-off

| Role | Name | Date | Signature |
| ---- | ---- | ---- | --------- |
| Technical | | | |
| EA / operations | | | |
| Client | | | |
