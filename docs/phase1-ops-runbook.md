# Phase 1 — Launch ops runbook

Operational checklist for going live on `theakinakinpelu.org`. Code and docs live in this repo; DNS, Resend domain verification, and Supabase dashboard changes require human access.

## Prerequisites

- Vercel project linked to this repository
- Supabase project: `isxzrhviqbqmtuhubcsp` (or your production ref)
- Resend account with API key
- Domain DNS access for `theakinakinpelu.org`

## 1. DNS and public URL

| Step | Action | Owner |
|------|--------|-------|
| 1.1 | Point `theakinakinpelu.org` (and `www`) to Vercel | Domain partner + dev |
| 1.2 | **Preserve MX records** for `ea@` and other mailboxes | Domain partner |
| 1.3 | Set `PUBLIC_SITE_URL=https://theakinakinpelu.org` in Vercel Production | Dev |

## 2. Supabase Auth URLs

In Supabase → Authentication → URL configuration:

- **Site URL:** `https://theakinakinpelu.org`
- **Redirect URLs:** add production admin URLs, e.g. `https://theakinakinpelu.org/admin/**`

See [`supabase/README.md`](../supabase/README.md) § Auth URL.

## 3. Database migrations

Apply in order through **031** (minimum for launch email routing: **022** notifications, **028** audience, **029–031** contact platform routing).

Combined paste helper for 029–031: [`supabase/scripts/apply-migrations-029-031.sql`](../supabase/scripts/apply-migrations-029-031.sql).

Verify with:

```bash
npm run verify:supabase
```

## 4. Resend (transactional)

| Variable | Example |
|----------|---------|
| `RESEND_API_KEY` | `re_…` |
| `NOTIFICATION_FROM_EMAIL` | `notifications@theakinakinpelu.org` |
| `NOTIFICATION_REPLY_TO` | `ea@theakinakinpelu.org` |
| `ADMIN_NOTIFICATION_EMAIL` | `ea@theakinakinpelu.org` |
| Brand inboxes | See [`.env.example`](../.env.example) |

**Domain verification:** Resend → Domains → add `theakinakinpelu.org` (SPF/DKIM). Sending requires verification; receiving at `ea@` uses existing MX (separate from Resend DNS).

**Supabase team invites:** Configure Resend SMTP in Supabase dashboard if built-in mailer rate limits block invites.

Health probe (after deploy):

```bash
curl "https://theakinakinpelu.org/api/notifications-status?key=YOUR_NOTIFICATIONS_STATUS_KEY"
```

## 5. Vercel environment variables

Set in Production (and Preview if testing email):

- All Resend vars above
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
- `NOTIFICATIONS_STATUS_KEY` (optional probe)
- `SEND_SUBMITTER_CONFIRMATION=true`

Full list: [`.env.example`](../.env.example).

## 6. Production smoke test

Run automated checks:

```bash
npm run verify:smoke:production
# alias: npm run smoke:production
```

Manual checklist: [`production-smoke-checklist.md`](production-smoke-checklist.md).

**Minimum pass before launch:**

- [ ] Contact form → admin inbox email at `ea@` (or brand inbox when platform selected)
- [ ] Submitter confirmation received (if enabled)
- [ ] Booking form → admin alert + organizer confirmation + tracker link
- [ ] Admin login (magic link points to production URL, not localhost)
- [ ] `/privacy` loads; marketing opt-in copy matches forms

## 7. Agent vs user responsibilities

| Task | Who |
|------|-----|
| Code, migrations in repo, email templates, audience UI | Agent / dev |
| DNS cutover, Resend domain verify, Vercel env paste | User / dev with access |
| Copy deck + social URL sign-off | Client |
| Privacy notice legal approval | Lawyer → then publish updated `/privacy` |
| EA smoke test on real inbox | EA |

## Related docs

- [`pre-launch-checklist-aug-2026.md`](pre-launch-checklist-aug-2026.md)
- [`production-smoke-checklist.md`](production-smoke-checklist.md)
- [`content-strategy/launch-email-privacy-plan.md`](content-strategy/launch-email-privacy-plan.md)
