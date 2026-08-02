# Website Domain & Hosting Handoff Brief

**Client:** Akin Akinpelu, Ph.D., Amb., FLPi  
**Project:** Official website platform (public site + admin back office)  
**Document date:** 2 August 2026  
**Purpose:** Align the domain owner and the development team on hosting, DNS, and go-live steps.

---

## 1. Summary (plain language)

The new website is **not hosted on the same stack as a typical WordPress or cPanel site**. It is a modern platform split across two cloud services:

| What | Where it lives | Who manages it |
|------|----------------|----------------|
| **Public website & admin screens** | **Vercel** | Development team |
| **Database, login, file storage, bookings** | **Supabase** | Development team |
| **Domain name (e.g. theakinakinpelu.org)** | **Domain registrar** | Domain owner / previous web partner |

**Short answer to “Where are you hosting the website?”**

> The website is hosted on **Vercel**. The application database and secure back-office data are on **Supabase**. The domain stays with the current registrar — we only need DNS updated to point the domain to Vercel when we are ready to go live.

**Current preview URL (before custom domain is connected):**  
https://dr-akin-platform.vercel.app

**Target production domain:** `theakinakinpelu.org`

---

## 2. What we are trying to achieve together

1. Connect the client’s domain to the new Vercel-hosted website  
2. Avoid downtime or email disruption during the switch  
3. Retire or redirect any old site URLs that should not remain public  
4. Confirm who holds registrar login, DNS access, and any business email setup  
5. Complete a clean handoff so the client team can operate the new platform independently

---

## 3. Roles & responsibilities

### Domain owner / previous website partner

Please confirm and provide:

- [ ] Domain registrar name (e.g. GoDaddy, Namecheap, Cloudflare, etc.)
- [ ] Login access **or** ability to apply DNS changes on our instruction
- [ ] Current DNS zone export / screenshot (all A, CNAME, MX, TXT records)
- [ ] Whether **business email** (e.g. hello@theakinakinpelu.org) is tied to this domain
- [ ] Any subdomains in use (www, mail, admin, old site hostnames)
- [ ] SSL / certificate notes if anything unusual is configured
- [ ] List of URLs from the old site that must redirect to the new site

### Development team (platform build)

We will:

- Host and deploy the website on Vercel  
- Operate Supabase (database, auth, storage)  
- Provide exact DNS records required for Vercel  
- Configure redirects from retired pages (e.g. old platform URLs)  
- Support cutover testing before and after DNS changes  
- Update Supabase auth URLs when the custom domain goes live  

---

## 4. Technical architecture (non-technical overview)

```
Visitor
   │
   ▼
Custom domain (registrar DNS)
   │
   ▼
Vercel  ──────────────►  Public pages, admin UI, API routes
   │
   ▼
Supabase  ────────────►  Bookings, enquiries, CMS content,
                         organizer files, team accounts
```

**Important:** Moving DNS to Vercel does **not** move email — unless MX records are changed. We should **preserve existing MX records** if email is already working.

---

## 5. DNS records to apply (send this section to the domain partner)

**Domain:** `theakinakinpelu.org`  
**Website host:** Vercel  
**Project preview (live now):** https://dr-akin-platform.vercel.app

Apply the records below at the domain registrar / DNS panel. **Do not delete existing MX or email-related TXT records** unless email is being migrated separately.

### Required — website

| Type | Host / Name | Value | TTL |
|------|-------------|-------|-----|
| **A** | `@` | `76.76.21.21` | 3600 (or default) |
| **CNAME** | `www` | `cname.vercel-dns.com` | 3600 (or default) |

These are Vercel’s standard records for connecting a custom domain.

### Optional — redirect both versions to one primary URL

Choose one primary URL and configure the other to redirect in Vercel after DNS is live:

- **Option A (recommended):** primary = `https://theakinakinpelu.org` — redirect `www` → non-www in Vercel  
- **Option B:** primary = `https://www.theakinakinpelu.org` — redirect non-www → `www` in Vercel

### Do NOT change (unless email is being migrated on purpose)

| Type | Host / Name | Action |
|------|-------------|--------|
| **MX** | `@` | **Keep existing records** — needed for hello@theakinakinpelu.org and any other mailboxes |
| **TXT** | `@` | **Keep existing records** — often used for SPF, DKIM, Google/Microsoft verification |
| **TXT** | `_dmarc` | **Keep if present** — email authentication |
| **CNAME** | `mail`, `autodiscover`, etc. | **Keep if present** — email services |

### Possible additional record after we add the domain in Vercel

When the development team adds `theakinakinpelu.org` to the Vercel project, Vercel may show a **one-time TXT verification record**. If that appears, we will send the exact name/value to add. Until then, the A and CNAME records above are the correct starting point.

### What we need back from the domain partner

1. Screenshot or export of **current DNS records** before changes  
2. Confirmation once the A and CNAME records above have been saved  
3. Confirmation that **MX records were not removed**  
4. Note when changes were made (for propagation timing — usually minutes to 48 hours)

---

## 6. DNS cutover checklist (reference)

When ready to go live, the domain owner (or DNS admin) will add/update records in the registrar. **Exact values will be supplied from the Vercel project dashboard** when the domain is added there. Typical setup:

### Root domain (example.com)

| Type | Name | Value | Notes |
|------|------|-------|-------|
| **A** | `@` | `76.76.21.21` | Vercel apex record (confirm in Vercel UI) |

### www subdomain

| Type | Name | Value | Notes |
|------|------|-------|-------|
| **CNAME** | `www` | `cname.vercel-dns.com` | Confirm exact target in Vercel UI |

### Do NOT remove unless intentionally migrating email

| Type | Name | Notes |
|------|------|-------|
| **MX** | `@` | Required for email delivery |
| **TXT** | `@` | SPF, DKIM, domain verification for email |
| **TXT** | various | Google Workspace / Microsoft 365 verification, etc. |

### Optional but recommended

| Type | Purpose |
|------|---------|
| **TXT** | Domain ownership verification for Vercel |
| **CAA** | Only if your registrar enforces certificate authority rules |

**DNS propagation:** usually minutes to 48 hours. We will test on preview before announcing go-live.

---

## 6. Go-live sequence (recommended)

| Step | Action | Owner |
|------|--------|-------|
| 1 | Confirm target domain and www preference (www vs non-www) | Client + domain partner |
| 2 | Export current DNS records | Domain partner |
| 3 | Add domain in Vercel project | Dev team |
| 4 | Apply DNS records at registrar | Domain partner |
| 5 | Wait for Vercel to verify domain & issue SSL | Automatic |
| 6 | Dev team sets `PUBLIC_SITE_URL` to production domain in Vercel | Dev team |
| 7 | Dev team updates Supabase Auth Site URL + redirect URLs | Dev team |
| 8 | Smoke-test: homepage, contact form, booking, admin login | All |
| 9 | Configure redirects from old URLs | Dev team |
| 10 | Announce go-live | Client |

---

## 7. URLs & access reference

| Item | URL / location |
|------|----------------|
| **Preview site** | https://dr-akin-platform.vercel.app |
| **Admin login** | https://dr-akin-platform.vercel.app/admin/login |
| **Contact page** | /contact |
| **Privacy notice** | /privacy |
| **Booking invitation** | /book-dr-akin |
| **Organizer resources** | /organizer-resources |
| **Vercel dashboard** | vercel.com (dev team) |
| **Supabase dashboard** | supabase.com (dev team) |
| **GitHub repository** | github.com/profoundcreator/dr-akin-platform (dev team) |

After custom domain is live, the same paths apply on the production domain.

---

## 8. Email considerations

The site displays: **hello@theakinakinpelu.org**

Please confirm:

- [ ] Is this email already live on the domain?
- [ ] Who hosts email today? (Google Workspace, Microsoft 365, Zoho, cPanel, etc.)
- [ ] Should DNS cutover **preserve all MX/TXT email records**? (Recommended: **Yes**)
- [ ] Does the contact form need to send to this address? (Dev team can configure transactional email separately via Resend if required)

**We do not need registrar access for email** unless email is being migrated at the same time.

---

## 9. Old site & redirects

Please list any old URLs that must continue working, for example:

| Old URL | Should redirect to |
|---------|-------------------|
| | |
| | |
| | |

Already configured on the new platform:

- `/work/tc-resource-technology` → `/work` (permanent redirect)

---

## 10. Security & access boundaries

**Please do not share** Supabase service-role keys or Vercel team owner access with the domain partner unless there is a specific operational need.

**Appropriate to share with domain partner:**

- Public website URL  
- DNS records only  
- List of required redirects  

**Held by development team:**

- Vercel project  
- Supabase project  
- Environment variables & API keys  
- Admin user provisioning  

---

## 11. Outstanding items after DNS go-live

These are platform tasks separate from DNS but relevant for a complete launch:

| Item | Status | Owner |
|------|--------|-------|
| Apply Supabase migration 021 (PERFORMX restore) if not yet run | Pending confirm | Dev team |
| Connect approved social media links in footer | Awaiting client URLs | Client |
| Upload organizer PDFs / photo packs to admin resources | Pending | Client / EA team |
| Final copy sign-off (`docs/content-strategy/continental-copy-deck.md`) | In review | Client |
| Custom domain connected & SSL active | Pending DNS | Domain partner + dev |
| Update `PUBLIC_SITE_URL` to production domain | Pending DNS | Dev team |
| Update Supabase Auth redirect URLs for production domain | Pending DNS | Dev team |

---

## 12. Information we need from you (domain partner)

Please reply with:

1. **Registrar / DNS provider name**  
2. **Can you apply DNS changes, or should we join a call and do it together?**  
3. **Screenshot or export of current DNS records**  
4. **Is email on this domain? If yes, which provider?**  
5. **Preferred primary URL:** `www.domain.com` or `domain.com`  
6. **Any old URLs that must redirect**  
7. **Best contact for cutover:** name, email, phone, timezone  

---

## 13. Suggested reply (copy/paste)

> Hi [Name],  
>  
> The website is hosted on **Vercel**. Please apply these DNS records for **theakinakinpelu.org**:
>  
> | Type | Host | Value |
> |------|------|-------|
> | A | @ | 76.76.21.21 |
> | CNAME | www | cname.vercel-dns.com |
>  
> **Important:** Please do **not** remove any existing **MX** or **TXT** records — they are needed for email (e.g. hello@theakinakinpelu.org).  
>  
> Before making changes, please send a screenshot or export of the current DNS records.  
> After updating, let us know so we can connect the domain on Vercel and confirm SSL.  
>  
> Preview of the new site: https://dr-akin-platform.vercel.app  
>  
> Best regards,  
> [Your name]

---

## 14. Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Client representative | | | |
| Domain / previous web partner | | | |
| Development team lead | | | |

---

*This document is intended for collaboration planning only. DNS values marked as examples must be confirmed in the Vercel dashboard at cutover time.*
