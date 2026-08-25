# Domain cutover — execute now

**Target:** `https://theakinakinpelu.org` (primary, no www)  
**Preview (current):** `https://dr-akin-platform.vercel.app`  
**Date:** August 2026

Use this checklist in order. Do **not** skip the “preserve email DNS” warnings.

---

## Before you start

Confirm you have access to:

| System | What you need |
|--------|----------------|
| **Domain registrar / DNS** | Ability to add A + CNAME records (and read current MX/TXT) |
| **Vercel** | Project `dr-akin-platform` → Settings → Domains & Environment Variables |
| **Supabase** | Project → Authentication → URL Configuration |
| **Resend** | Domains → `theakinakinpelu.org` verified for sending |

**Primary URL decision (locked in):** `https://theakinakinpelu.org` — `www` redirects to non-www (configured in `vercel.json`).

**DNS provider:** Cloudflare (confirmed August 2026)

---

## Step 1 — Export current DNS (5 min)

At your registrar, screenshot or export **all** records before changing anything.

**Must capture:** any **MX**, **TXT** (SPF, DKIM, Google/Microsoft verification), **CNAME** for mail/autodiscover.

> If you remove MX records, **hello@** and **ea@theakinakinpelu.org** stop receiving mail.

---

## Step 2 — Add domain in Vercel (5 min)

1. Open [Vercel → profound-creators/dr-akin-platform → Settings → Domains](https://vercel.com/profound-creators/dr-akin-platform/settings/domains)
2. Add **`theakinakinpelu.org`**
3. Add **`www.theakinakinpelu.org`**
4. If Vercel shows a **TXT verification** record, add it at the registrar (one-time)
5. Note any domain-specific values Vercel displays (A record IP should match below)

---

## Step 3 — Apply DNS in Cloudflare (5 min)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select zone **`theakinakinpelu.org`**
3. Go to **DNS → Records**
4. Screenshot all existing records first (especially **MX** and **TXT**)

### Website records (add or edit)

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|--------------|-----|
| **A** | `@` | `76.76.21.21` | **DNS only** (grey cloud ☁️) | Auto |
| **CNAME** | `www` | `cname.vercel-dns.com` | **DNS only** (grey cloud ☁️) | Auto |

**Important — Cloudflare proxy:**

- Set both records to **DNS only** (grey cloud), not **Proxied** (orange cloud).
- Orange cloud in front of Vercel often causes SSL errors or redirect loops until Cloudflare SSL is tuned.
- Email records (**MX**, mail **TXT**) are never proxied — leave them as they are.

### If old website records exist

- Edit or remove any old **A** / **CNAME** on `@` or `www` that pointed to a previous host (WordPress, cPanel, etc.).
- Replace with the Vercel values above.

### Do not delete or change

- **MX** records (email delivery)
- **TXT** records for SPF, DKIM, `_dmarc`, Google/Microsoft verification
- **CNAME** for `mail`, `autodiscover`, etc. if present

**Resend sending DNS:** If Resend shows additional TXT/CNAME for `theakinakinpelu.org`, add those **alongside** MX — they are for outbound mail only.

Propagation on Cloudflare is usually fast (minutes). Vercel may take a few more minutes to issue SSL.

---

## Step 3 (other registrars) — Apply DNS (5 min)

*Skip this section if you use Cloudflare — use Step 3 above.*

Add or update **website** records only:

| Type | Host / Name | Value | Notes |
|------|-------------|-------|-------|
| **A** | `@` | `76.76.21.21` | Root domain → Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | www → Vercel |

**Do not delete or change:**

- **MX** records (email delivery)
- **TXT** records for SPF, DKIM, `_dmarc`, domain verification
- **CNAME** for `mail`, `autodiscover`, etc. if present

**Resend sending DNS:** If Resend shows additional TXT/CNAME for `theakinakinpelu.org`, add those **alongside** MX — they are for outbound mail only.

Propagation: usually 5–30 minutes; can take up to 48 hours.

---

## Step 4 — Wait for Vercel SSL (automatic)

In Vercel → Domains, both entries should show **Valid Configuration** and SSL issued.

Test when ready:

```bash
curl -I https://theakinakinpelu.org
curl -I https://www.theakinakinpelu.org   # should redirect to non-www
```

---

## Step 5 — Update Vercel environment variables (5 min)

Vercel → Project → Settings → Environment Variables → **Production**:

| Variable | Value |
|----------|-------|
| `PUBLIC_SITE_URL` | `https://theakinakinpelu.org` |

Confirm these are already set (from launch prep):

| Variable | Example |
|----------|---------|
| `RESEND_API_KEY` | `re_…` |
| `NOTIFICATION_FROM_EMAIL` | `notifications@theakinakinpelu.org` |
| `ADMIN_NOTIFICATION_EMAIL` | `ea@theakinakinpelu.org` |
| `NOTIFICATION_REPLY_TO` | `ea@theakinakinpelu.org` |
| `SUPABASE_SERVICE_ROLE_KEY` | (secret) |
| `PUBLIC_SUPABASE_URL` | `https://….supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | (public) |
| `SEND_SUBMITTER_CONFIRMATION` | `true` |

**Redeploy** after changing `PUBLIC_SITE_URL` (Deployments → … → Redeploy, or push to `main`).

---

## Step 6 — Update Supabase Auth URLs (5 min)

Supabase Dashboard → **Authentication → URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://theakinakinpelu.org` |

**Redirect URLs** — add (keep localhost lines for dev):

```
https://theakinakinpelu.org/admin/login
https://theakinakinpelu.org/admin/**
https://dr-akin-platform.vercel.app/admin/login
http://localhost:4321/admin/login
http://localhost:4322/admin/login
```

Save. **Resend any pending team invites** so links use the production domain.

---

## Step 7 — Resend sending domain (if not already green)

Resend → Domains → `theakinakinpelu.org`:

- Status must be **Verified** (SPF + DKIM)
- `NOTIFICATION_FROM_EMAIL` must use this domain (e.g. `notifications@theakinakinpelu.org`)

Receiving at `ea@` / `hello@` uses **MX at registrar** — separate from Resend verification.

Health check after deploy:

```bash
curl "https://theakinakinpelu.org/api/notifications-status?key=YOUR_NOTIFICATIONS_STATUS_KEY"
```

---

## Step 8 — Smoke test on custom domain (15 min)

```bash
BASE_URL=https://theakinakinpelu.org npm run verify:smoke:production
```

Manual checks:

| Check | URL |
|-------|-----|
| Homepage | https://theakinakinpelu.org |
| Admin login | https://theakinakinpelu.org/admin/login |
| Contact form | https://theakinakinpelu.org/contact |
| Book Dr. Akin | https://theakinakinpelu.org/book-dr-akin |
| Help Center | https://theakinakinpelu.org/admin/help |
| www redirect | https://www.theakinakinpelu.org → non-www |

**Admin:** sign in, open Requests + Inbox, confirm invite links no longer point to localhost.

**Email:** submit test contact form → `ea@theakinakinpelu.org` receives notification.

---

## Step 9 — Announce go-live

- Update bookmarks from `dr-akin-platform.vercel.app` to `theakinakinpelu.org`
- Share new admin URL with EA team: `https://theakinakinpelu.org/admin/login`
- Optional: keep Vercel URL working (Vercel serves both until removed)

---

## Copy-paste for domain partner

> Please apply these DNS records for **theakinakinpelu.org**:
>
> | Type | Host | Value |
> |------|------|-------|
> | A | @ | 76.76.21.21 |
> | CNAME | www | cname.vercel-dns.com |
>
> **Important:** Do **not** remove any existing **MX** or **TXT** records — they are required for email (hello@, ea@, etc.).
>
> Before changes, please send a screenshot of current DNS records.
> After updating, confirm so we can verify SSL on Vercel.
>
> Preview site: https://dr-akin-platform.vercel.app

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Domain not resolving | Wait for DNS propagation; confirm A/CNAME at registrar |
| SSL pending in Vercel | DNS must point to Vercel first; check TXT verification if requested |
| Admin invite opens localhost | Update Supabase Site URL + Redirect URLs; resend invite |
| Contact form emails not arriving | Resend domain not verified; check `/api/notifications-status` |
| Email stopped working | MX records were changed — restore from Step 1 export |
| www shows wrong site | Confirm CNAME `www` → `cname.vercel-dns.com`; redeploy |
| Cloudflare SSL error / too many redirects | Set A and www CNAME to **DNS only** (grey cloud); or SSL/TLS → Full (strict) if you must proxy |
| Vercel “Invalid configuration” | Confirm grey cloud; wait 5 min; check Vercel’s exact A IP hasn’t changed |

---

## Related docs

- [`domain-and-hosting-handoff-brief.md`](./domain-and-hosting-handoff-brief.md) — full handoff for registrar partner
- [`phase1-ops-runbook.md`](./phase1-ops-runbook.md) — launch ops
- [`launch-gate-interactive.md`](./launch-gate-interactive.md) — full go-live gate
- [`../supabase/README.md`](../supabase/README.md) — Auth URL details
