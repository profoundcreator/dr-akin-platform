# Production smoke checklist

Run before client demo or go-live. Target: **https://dr-akin-platform.vercel.app** (or your custom domain).

## 1. Automated (run locally)

```bash
# HTTP + SEO endpoints
npm run verify:smoke:production

# Booking tracker guard logic (unit check)
npm run verify:booking-tracker

# Optional: Supabase table access (needs .env)
node scripts/smoke-production.mjs --with-supabase
```

## 2. Manual — Admin

| Step | Pass? |
|------|-------|
| Open `/admin/login` — form loads | ☐ |
| Sign in with active admin account | ☐ |
| Land on `/admin/requests` — dashboard loads | ☐ |
| Open **Inbox** — list loads (empty OK) | ☐ |
| Open **Work** — PERFORMX / ecosystem orgs visible | ☐ |
| Sign out works | ☐ |

## 3. Manual — Public forms

| Step | Pass? |
|------|-------|
| `/contact` — submit test enquiry (use your email) | ☐ |
| Enquiry appears in **Admin → Inbox** | ☐ |
| `/book-dr-akin` — complete test booking (or dry-run to final step) | ☐ |
| Booking appears in **Admin → Requests** (if submitted) | ☐ |
| `/track-booking` — lookup with reference + access token | ☐ |

## 4. Manual — Content & SEO

| Step | Pass? |
|------|-------|
| Homepage hero and nav load | ☐ |
| `/work/performx`, `/work/auctus-africa`, `/work/future-africa` | ☐ |
| `/insights` — at least one article opens | ☐ |
| `/library/view` — at least one book opens | ☐ |
| `/robots.txt`, `/sitemap-index.xml`, `/rss.xml` return 200 | ☐ |
| Footer contact email and phone correct | ☐ |

## 5. Sign-off

| Role | Name | Date |
|------|------|------|
| Technical | | |
| Client / EA | | |

---

**Notes**

- Delete or mark test enquiries/bookings as archived after testing.
- If admin shows “workspace error”, hard-refresh or use incognito (cached JS).
- Custom domain: re-run smoke with `BASE_URL=https://your-domain.com npm run verify:smoke:production`.
