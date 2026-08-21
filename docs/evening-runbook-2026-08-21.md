# Friday evening runbook — 21 August 2026

**Goal:** Push as far as possible tonight without DNS, Resend domain verification, or custom domain cutover.

**Live site (interim):** https://dr-akin-platform.vercel.app

---

## What we can finish tonight

| Track | Task | Who | ~Time |
| ----- | ---- | --- | ----- |
| **You** | Run Supabase migrations (see below) | You | 15 min |
| **You** | EA admin sign-in repair (`reset:admin-access`) | You | 5 min |
| **You** | Quick click-through: contact + booking forms → Admin Inbox/Requests | You | 10 min |
| **Agent** | Fix insights redirect smoke failure | Agent | Done in PR |
| **Agent** | Brand PNG assets for emails | Agent | Done in PR |
| **Agent** | Docs + migration helper SQL | Agent | Done in PR |
| **Saturday** | DNS, Resend verify, Vercel env vars, email smoke | You + agent | — |

---

## Your checklist (do these in order)

### Step 1 — Supabase migrations (15 min)

Open **Supabase → SQL Editor**. Run **only migrations you have not already applied**.

**If unsure what's applied:** run migration files in numeric order; already-applied ones are usually safe (`CREATE OR REPLACE`, `UPDATE`).

| Order | File | What it does |
| ----- | ---- | ------------ |
| 1 | `022_submission_notifications.sql` | Email notification tracking on forms |
| 2 | `023_admin_session_reliability.sql` | Admin session fixes |
| 3 | `025_aald_performx_content.sql` | AALD + PerformX + summit event content |
| 4 | `026_aald_performx_upsert.sql` | Content upsert pass |
| 5 | `027_aald_performx_cta_copy.sql` | CTA copy tweaks |
| 6 | `028_audience_members.sql` | Marketing opt-in list |
| 7 | Run migrations **029 → 031** (three files or one combined paste) | Contact platform routing + work CTAs |

**Option A — three files (safest if anything errors):** open each on GitHub → copy all → paste into Supabase SQL Editor → Run, in order:

1. [029_enquiry_notification_context.sql](https://github.com/profoundcreator/dr-akin-platform/blob/main/supabase/migrations/029_enquiry_notification_context.sql)
2. [030_enquiry_future_africa_platform.sql](https://github.com/profoundcreator/dr-akin-platform/blob/main/supabase/migrations/030_enquiry_future_africa_platform.sql)
3. [031_work_org_platform_contact_links.sql](https://github.com/profoundcreator/dr-akin-platform/blob/main/supabase/migrations/031_work_org_platform_contact_links.sql)

**Option B — one combined paste:** [apply-migrations-029-031.sql](https://github.com/profoundcreator/dr-akin-platform/blob/main/supabase/scripts/apply-migrations-029-031.sql) (same three migrations in one script; run after 022 and 028).

**Skip** `024_content_plans.sql` unless you use the content-planning admin feature — it is optional.

After migrations, confirm:

- `/events/performx-summit-2026` loads on the live site
- Work pages show **Discuss a partnership** / contact CTAs with `?platform=` in the URL when you hover the link

### Step 2 — EA can sign in (5 min)

On your machine (with `SUPABASE_SERVICE_ROLE_KEY` in `.env`):

```bash
npm run reset:admin-access -- ea@theakinakinpelu.org "Executive Assistant"
```

Share the temporary password securely. EA signs in at `/admin/login`.

### Step 3 — Forms save to admin (10 min)

No email required for this step.

1. Submit a test contact at `/contact` (use your own email).
2. Sign in as EA → **Inbox** → confirm the enquiry appears.
3. Submit a test booking at `/book-dr-akin`.
4. **Requests** → confirm it appears (or use the tracker link).

Delete test rows after sign-off if you prefer a clean inbox.

### Step 4 — Merge agent PR + redeploy

When the evening PR is green:

1. Merge to `main`.
2. Vercel auto-deploys (~2 min).
3. Run: `npm run smoke:production` locally — expect **21/21** automated checks.

---

## What waits until Saturday (needs domain / Resend)

These **cannot** work fully until `theakinakinpelu.org` is verified in Resend and env vars are set in Vercel:

| Item | Why deferred |
| ---- | ------------ |
| Submitter acknowledgement emails | Needs `RESEND_API_KEY` + verified domain |
| Brand inbox notifications | Needs brand env vars + Resend |
| `ea@` booking notifications | Same |
| DNS cutover | Saturday task |
| Full §3B email routing smoke | Needs live Resend |

**Vercel env vars for Saturday** (Production + Preview):

```
RESEND_API_KEY
NOTIFICATION_FROM_EMAIL=notifications@theakinakinpelu.org
ADMIN_NOTIFICATION_EMAIL=ea@theakinakinpelu.org
NOTIFY_AALD=hello@aaldcompany.org
NOTIFY_PERFORMX=performx@aaldcompany.org
NOTIFY_ERUDIO=hello@erudiohub.org
NOTIFY_AUCTUS=info@auctusafrica.org
SUPABASE_SERVICE_ROLE_KEY
SEND_SUBMITTER_CONFIRMATION=true
PUBLIC_SITE_URL=https://dr-akin-platform.vercel.app
```

Future Africa uses `NOTIFY_ERUDIO` only (emails are labelled **Future Africa**).

---

## Email routing reminder

| Goes to **ea@** | Goes to **brand inbox** |
| --------------- | ----------------------- |
| Bookings | AALD → hello@aaldcompany.org |
| Media, general, privacy, organizer | PerformX → performx@aaldcompany.org |
| Contact with no platform | Erudio → hello@erudiohub.org |
| | Auctus → info@auctusafrica.org |
| | Future Africa → hello@erudiohub.org (labelled Future Africa) |

Submitter always gets their own acknowledgement (once Resend is live).

---

## If something breaks

| Symptom | Likely fix |
| ------- | ---------- |
| Contact form error on submit | Migration 029–030 not applied |
| Summit page 404 | Migration 025 not applied |
| EA cannot sign in | Run `reset:admin-access` |
| Form saves but no email | Expected until Saturday Resend setup |
| Logo missing in email | Merge PR (brand PNGs in `/brand/`) |

---

## Sunday launch gate

Full list: [`pre-launch-checklist-aug-2026.md`](pre-launch-checklist-aug-2026.md)  
Production smoke: [`production-smoke-checklist.md`](production-smoke-checklist.md)
