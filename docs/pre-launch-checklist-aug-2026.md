# Pre-launch checklist — Sunday 23 August 2026

**Target go-live:** Sunday, 23 August 2026  
**Primary domain:** `theakinakinpelu.org` (or interim Vercel URL until DNS cutover)  
**Last updated:** 20 August 2026

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

## 1. Automated form emails (Blocker)

**Requirement:** Everyone who submits a form gets an acknowledgement; the EA team gets a notification.

| # | Task | Built in code? | Ops / config | Owner |
| --- | ---- | -------------- | ------------ | ----- |
| 1.1 | **Contact form → EA notification** (`[Contact] …` to admin inbox) | ☑ Yes | ☐ Resend + env vars | Dev |
| 1.2 | **Contact form → submitter acknowledgement** (“We received your enquiry”) | ☑ Yes | ☐ `SEND_SUBMITTER_CONFIRMATION=true` (default) | Dev |
| 1.3 | **Booking form → EA notification** (`[Booking DAA-…] …` with admin link) | ☑ Yes | ☐ Same Resend setup | Dev |
| 1.4 | **Booking form → submitter acknowledgement** (reference + tracker link) | ☑ Yes | ☐ Same Resend setup | Dev |
| 1.5 | Apply migration **`022_submission_notifications.sql`** in production Supabase | — | ☐ Required for email send-once logic | Dev |
| 1.6 | **Resend:** verify domain `theakinakinpelu.org` (SPF/DKIM; keep existing MX for `ea@` / `hello@`) | — | ☐ Blocker | Dev + domain |
| 1.7 | **Vercel env vars:** `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` | — | ☐ Blocker | Dev |
| 1.8 | Suggested values: `NOTIFICATION_FROM_EMAIL=notifications@theakinakinpelu.org`, `ADMIN_NOTIFICATION_EMAIL=ea@theakinakinpelu.org` | — | ☐ | Dev |
| 1.9 | Redeploy production after env changes | — | ☐ | Dev |
| 1.10 | **Smoke test:** contact + booking with real inboxes; confirm EA + submitter both receive mail | — | ☐ Blocker | EA + dev |
| 1.11 | Config health check: `/api/notifications-status?key=…` (optional `NOTIFICATIONS_STATUS_KEY`) | — | ☐ Recommended | Dev |

**Note:** Form data always saves to Supabase even if email fails — verify email separately before launch.

**Not required for launch (defer):**

- Organizer status-update emails (Under Review → Confirmed, etc.)
- Enquiry → booking conversion notification
- Marketing/newsletter sends (Beehiiv/Kit — post-launch)
- Admin email template editor

---

## 2. Admin team access (Blocker)

| # | Task | Status |
| --- | ---- | ------ |
| 2.1 | Super Admin can sign in at `/admin/login` | ☐ |
| 2.2 | EA account can sign in (repair with `npm run reset:admin-access` if invite failed) | ☐ |
| 2.3 | Resend SMTP in Supabase for **team invite** emails (removes 2/hour cap) | ☐ Recommended |
| 2.4 | EA can open **Inbox**, **Requests**, and **Work** | ☐ |
| 2.5 | `PUBLIC_SITE_URL` matches live site (invite links must not point to localhost) | ☐ |

---

## 3. Infrastructure & domain (Blocker for custom domain)

| # | Task | Status |
| --- | ---- | ------ |
| 3.1 | Production Supabase migrations **018–028** applied (confirm in SQL Editor) | ☐ |
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
| 4.1 | AALD + PerformX pages match approved plan (CTAs, copy, summit event) | ☑ (verify live) |
| 4.2 | Continental copy deck sign-off | ☐ |
| 4.3 | Approved social URLs in footer (`site-contact.ts`) | ☐ |
| 4.4 | Tier-1 portraits deployed (profile, Meet, Work — homepage can stay on current hero) | ◐ |
| 4.5 | Speaking page stage photography (or accept interim) | ☐ |
| 4.6 | Seven Star + publisher book covers (no SVG placeholders on library) | ☐ |
| 4.7 | Brand logos present (`/brand/akin-logo-mono.png` — used in emails too) | ☐ Verify |
| 4.8 | PerformX Summit 2026 event page loads (`/events/performx-summit-2026`) | ☐ |

---

## 5. Legal & privacy (Blocker)

| # | Task | Status |
| --- | ---- | ------ |
| 5.1 | Privacy notice live at `/privacy` | ☑ |
| 5.2 | Lawyer sign-off (address, NDPC registration, DPAs) | ☐ |
| 5.3 | Remove “For legal review” callouts after counsel approval | ☐ |
| 5.4 | Marketing opt-in checkboxes align with privacy §2.3 | ☑ |

---

## 6. End-to-end testing (Blocker)

Run [`production-smoke-checklist.md`](production-smoke-checklist.md) on the **live URL** before Sunday.

| # | Area | Status |
| --- | ---- | ------ |
| 6.1 | Automated: `npm run verify:smoke:production` | ☐ |
| 6.2 | Contact form → appears in Admin Inbox | ☐ |
| 6.3 | Booking form → appears in Admin Requests | ☐ |
| 6.4 | Booking tracker lookup works | ☐ |
| 6.5 | Insights, library, work pages, SEO (`robots.txt`, sitemap, RSS) | ☐ |
| 6.6 | Facebook/LinkedIn link preview on one insight URL | ☐ |
| 6.7 | Archive or delete test submissions after sign-off | ☐ |

---

## 7. Launch-day sequence (Sunday 23 August)

Suggested order:

1. **Saturday evening:** Final smoke test on production URL (forms + **both email paths**).
2. **Sunday morning:** DNS cutover (if ready) or confirm Vercel URL is the public link.
3. **Sunday:** Update Auth redirect URLs if domain changed.
4. **Sunday:** EA submits one live contact + booking test; confirms inbox + acknowledgements.
5. **Sunday:** Client sign-off on [`final-audit-report.md`](final-audit-report.md) checklist rows.
6. Announce / share live URL.

---

## 8. Explicitly post-launch (do not block Sunday)

| Item |
| ---- |
| Marketing ESP (Beehiiv/Kit) + newsletter campaigns |
| Footer newsletter signup + `/admin/audience` |
| Organizer status-update emails |
| Homepage hero portrait swap |
| Admin calendar, travel workspace, PDF exports |
| Full site photography shoot |
| PerformX summit external registration integration |

---

## Quick reference — email architecture at launch

```text
Contact / Booking form
        ↓
   Supabase (always saves)
        ↓
/api/notify-submission (Resend)
        ├──→ ea@theakinakinpelu.org     (team alert)
        └──→ submitter email             (acknowledgement)
```

Team invites use a **separate** path: Supabase Auth + Resend SMTP (not the form notification API).

---

## Sign-off

| Role | Name | Date | Signature |
| ---- | ---- | ---- | --------- |
| Technical | | | |
| EA / operations | | | |
| Client | | | |
