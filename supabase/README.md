# Supabase Setup — Dr. Akin Platform

Configure authentication, persistent storage, and Row Level Security per `operations-scope.md`.

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Copy your **Project URL** and **anon public key** from **Settings → API**.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.

## 3. Run database migrations

In the Supabase **SQL Editor**, run in order:

1. `migrations/001_initial_schema.sql`
2. `migrations/002_rls_policies.sql` (or `002a`, `002b`, `002c` if split)
3. `migrations/005_featured_podcast_episodes.sql`
4. `migrations/006_events.sql`
5. `migrations/007_site_settings.sql`
6. `migrations/008_site_settings_insert_policy.sql`
7. `migrations/009_library_books.sql`
8. `migrations/010_insights_articles.sql`
9. `migrations/011_work_orgs.sql`
10. `migrations/012_team_admin.sql`
11. `migrations/013_preloaded_content_controls.sql`
12. `migrations/014_insight_hero_images.sql`
13. `migrations/015_admin_reliability.sql` — invited self-activation + auditor read-only on bookings/inbox
14. `migrations/016_phase_e_security.sql` — audit log access, publish/delete RLS, `/admin/audit-log` RPC
15. `migrations/017_enquiry_conversion.sql` — admin RPC to convert inbox enquiries into booking requests
16. `migrations/018_organizer_resources.sql` — private organizer materials, booking grants, roles and audited access
17. `migrations/019_contact_geo_foundation.sql` — rate-limited contact enquiries and insight SEO metadata
18. `migrations/020_continental_ecosystem.sql` — retires TC Resource, keeps PERFORMX destination-free, and publishes Future Africa/Auctus Africa CMS entries
19. `migrations/021_restore_performx.sql` — republishes the PERFORMX work org page
20. `migrations/022_submission_notifications.sql` — Resend notification tracking on enquiries and bookings
21. `migrations/023_admin_session_reliability.sql` — clears session revoke on admin re-activation
22. `migrations/024_content_plans.sql` — optional content-planning admin tables (skip if unused)
23. `migrations/025_aald_performx_content.sql` — AALD, PerformX, and PerformX Summit 2026 event seed
24. `migrations/026_aald_performx_upsert.sql` — content upsert pass for AALD/PerformX
25. `migrations/027_aald_performx_cta_copy.sql` — CTA copy alignment
26. `migrations/028_audience_members.sql` — marketing opt-in audience list (`subscribe_audience_member` RPC)
27. `migrations/029_enquiry_notification_context.sql` — platform/referrer on contact submissions (brand routing)
28. `migrations/030_enquiry_future_africa_platform.sql` — allows `future-africa` platform value
29. `migrations/031_work_org_platform_contact_links.sql` — work page CTAs → `/contact?platform=…`

**Quick paste:** `scripts/apply-migrations-029-031.sql` combines steps 27–29 for contact routing only (run after 022 and 028).

Verify migration 015 after running:

```bash
npm run verify:migration:015
```

## 4. Configure Auth

In **Authentication → Providers → Email**:

- Disable **Enable sign ups**
- Enable **Confirm email**

### Auth URL configuration (required for team invites)

In **Authentication → URL Configuration**, set:

| Field | Value |
|--------|--------|
| **Site URL** | `https://dr-akin-platform.vercel.app` (or your custom domain) |
| **Redirect URLs** | Add each of these (one per line): |

```
https://dr-akin-platform.vercel.app/admin/login
http://localhost:4321/admin/login
http://localhost:4322/admin/login
```

If Site URL is still `http://localhost:3000`, invite emails will send people to localhost and fail. Update Site URL and redirect URLs **before** sending invites.

When you connect a custom domain later, add `https://your-domain.com/admin/login` to Redirect URLs and update Site URL.

### Email rate limits

Supabase’s **built-in email** caps at **2 auth emails per hour** and cannot be raised. For team invites at scale, use **custom SMTP** (see [§ Resend SMTP for auth emails](#resend-smtp-for-auth-emails-sprint-2) below).

If you still see **email rate limit exceeded**, wait ~1 hour or finish Resend setup, then raise **Authentication → Rate Limits → Email sent** after custom SMTP is enabled.

### Resend SMTP for auth emails (Sprint 2)

Removes the 2/hour invite cap. Team invite emails go through Resend instead of Supabase’s shared mailer.

**Prerequisites:** A [Resend](https://resend.com) account and a **verified sending domain** (e.g. `drakinakinpelu.com`). Without a verified domain, Resend only sends to your own address for testing.

#### A — Resend

1. Sign up at [resend.com](https://resend.com)
2. **Domains → Add domain** → enter your domain (e.g. `drakinakinpelu.com`)
3. Add the DNS records Resend shows (TXT/MX) at your domain registrar; wait until Resend shows **Verified**
4. **API Keys → Create API Key** → name `supabase-auth` → copy the key (starts with `re_`)

#### B — Supabase SMTP

1. [Supabase project](https://supabase.com/dashboard/project/isxzrhviqbqmtuhubcsp) → **Authentication** → **Emails** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Enter:

| Field | Value |
|--------|--------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key (`re_…`) |
| Sender email | `no-reply@yourdomain.com` (must be on the verified domain) |
| Sender name | `Dr. Akin Platform` |

4. **Save**

#### C — Raise Supabase email rate limit

After custom SMTP is saved:

1. **Authentication → Rate Limits**
2. Increase **Rate limit for sending emails** (e.g. **30** or **100** per hour for testing)
3. Save

#### D — Smoke test

1. Admin → **Team** → invite a test address (or resend to someone still `invited`)
2. Check inbox (and spam) for an email from your sender address
3. Link should land on `https://dr-akin-platform.vercel.app/admin/login`

**Fallback if rate-limited again:** `node scripts/generate-invite-link.mjs "email@example.com" "Full Name" role_name` — sends no email; copy the link manually.

**EA cannot sign in (repair without email):** with `SUPABASE_SERVICE_ROLE_KEY` in `.env`, run:

```bash
npm run reset:admin-access -- ea@theakinakinpelu.org "Executive Assistant"
```

This confirms the auth user, sets a **temporary password**, marks email confirmed, and sets `admin_profiles.account_state` to `active`. Share the printed password securely.

Official guide: [Resend — Send with Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp)

### Resend notifications (enquiry & booking → EA inbox)

When someone submits the **contact form** or **booking form**, the site sends a team notification via the [Resend API](https://resend.com/docs/api-reference/emails/send-email) (separate from Supabase auth SMTP). Replies go to the submitter's email; the EA team reads notifications at **`ea@theakinakinpelu.org`**.

#### A — Apply migration

Run **`022_submission_notifications.sql`** in the Supabase SQL Editor (tracks `admin_notified_at` so each submission emails once).

#### B — Resend dashboard (required for API sends)

Transactional notifications use the **Resend API**, not Supabase SMTP. You must complete this in [resend.com](https://resend.com):

1. **Domains → Add domain** → `theakinakinpelu.org`
2. Add the **sending** DNS records Resend shows (SPF/DKIM — usually TXT/CNAME). These are **in addition to** your existing MX records for `ea@` / `hello@`; do not remove MX.
3. Wait until Resend shows the domain as **Verified**
4. **API Keys → Create API Key** → copy the `re_…` key

Without a verified domain, Resend only delivers to the Resend account owner's email (test mode) — **`ea@` will not receive anything**.

#### C — Vercel environment variables

Add in **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variable | Example | Purpose |
|----------|---------|---------|
| `RESEND_API_KEY` | `re_…` | Resend API key from step B |
| `NOTIFICATION_FROM_EMAIL` | `notifications@theakinakinpelu.org` | Must be on the **verified** Resend domain |
| `ADMIN_NOTIFICATION_EMAIL` | `ea@theakinakinpelu.org` | EA shared inbox (bookings + ops contact) |
| `NOTIFY_AALD` | `hello@aaldcompany.org` | AALD partnership enquiries |
| `NOTIFY_PERFORMX` | `performx@aaldcompany.org` | PerformX partnership enquiries |
| `NOTIFY_ERUDIO` | `hello@erudiohub.org` | Erudio Hub + Future Africa (labelled) enquiries |
| `NOTIFY_AUCTUS` | `info@auctusafrica.org` | Auctus Africa partnership enquiries |
| `NOTIFICATION_REPLY_TO` | `ea@theakinakinpelu.org` | Submitter auto-reply address (optional; defaults to admin inbox) |
| `SEND_SUBMITTER_CONFIRMATION` | `true` | Optional — send “we received your request” to the submitter (default `true`) |

`SUPABASE_SERVICE_ROLE_KEY` must already be set (used to load the submission server-side).

Redeploy after saving variables.

**Config check:** call `/api/notifications-status?key=YOUR_NOTIFICATIONS_STATUS_KEY` (set `NOTIFICATIONS_STATUS_KEY` in Vercel first) — all checks should be `true` before testing. Without the key, the endpoint returns 404.

#### D — Smoke test

1. Submit a test enquiry at `/contact` (use a real inbox you control for the submitter address).
2. Check **`ea@theakinakinpelu.org`** — subject `[Contact] …`, **Reply-To** should be the submitter.
3. Submit a booking at `/book-dr-akin` — subject `[Booking DAA-…] …` with admin link.
4. Confirm optional auto-reply arrives at the submitter address.
5. If nothing arrives, open browser DevTools → Console for `[notifications]` warnings, and Vercel → Functions → `/api/notify-submission` logs.

If notifications fail, the form still saves to Supabase.

## 5. Create the Super Admin

1. Add user in **Authentication → Users**
2. Run:

```sql
INSERT INTO admin_profiles (id, email, full_name, role, account_state, invited_at)
VALUES (
  '<auth-user-uuid>',
  'admin@yourdomain.com',
  'Dr. Akin Akinpelu',
  'super_admin',
  'active',
  now()
);
```

Optionally set `is_founder = true` on the primary Super Admin (see `seed-admin.sql`).

## 6. Team invites (optional)

1. Add `SUPABASE_SERVICE_ROLE_KEY` and `PUBLIC_SITE_URL` in Vercel environment variables
2. Validate keys before redeploying:

```bash
npm run verify:supabase:keys          # local .env
npm run verify:vercel:keys            # pull + check Vercel production env
npm run setup:service-role            # paste service_role; syncs to .env + Vercel
```

3. Redeploy on Vercel after changing env vars
4. Open **Admin → Team** to invite colleagues by email

## 7. Verify

```bash
npm run verify:supabase   # checks .env vars are set
npm run dev
```

- Submit booking at `/book-dr-akin`
- Sign in at `/admin/login`
- Admin dashboard loads at `/admin/login` (demo mode if `.env` is missing)
- **Team** appears in the sidebar for Super Admin, Technical Admin, and Admin Manager

## 8. Deploy to Vercel

1. Connect this repo to [Vercel](https://vercel.com)
2. Set environment variables in **Vercel → Project → Settings → Environment Variables**:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `PUBLIC_SITE_URL` (your public site URL, e.g. `https://dr-akin-platform.vercel.app`)
   - `SUPABASE_SERVICE_ROLE_KEY` (for Team invites and submission notifications)
   - `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL` (see [§ Resend notifications](#resend-notifications-enquiry--booking--gmail))
   - `VERCEL_DEPLOY_HOOK_URL` (recommended — see below)
3. Deploy — `vercel.json` includes CMS slug rewrites and the booking tracker

### Automatic SEO rebuild (recommended)

When admins publish or hide content, the site can trigger a fresh Vercel deploy so search engines and link previews pick up new pages.

1. In Vercel, open **Project → Settings → Git → Deploy Hooks**
2. Create a hook for the **Production** branch (name it e.g. `cms-publish`)
3. Copy the hook URL
4. Add it as `VERCEL_DEPLOY_HOOK_URL` in Environment Variables (Production)
5. Redeploy once so the API route sees the new variable

Without the hook, content still goes live immediately on article/book/event pages (they read from Supabase), but **Rebuild site for SEO** in admin will show a setup message until the hook is added.

Also run migrations **013** (`013_preloaded_content_controls.sql`) and **014** (`014_insight_hero_images.sql`) and **015** (`015_admin_reliability.sql`) if not already applied.
