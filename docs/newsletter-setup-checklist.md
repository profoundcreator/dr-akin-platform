# Newsletter setup checklist
## Connect theakinakinpelu.org to Beehiiv (or Kit)

**Status:** Platform code is built. This checklist connects your ESP account.

**Prerequisite:** Privacy notice live at `/privacy` (done). Lawyer sign-off recommended before first campaign.

---

## What is already built on the site

| Piece | Status |
|-------|--------|
| Footer newsletter signup | Live — opt-in checkbox (unchecked by default) |
| Contact form marketing opt-in | Live |
| Booking form marketing opt-in | Live |
| Summit interest form | Live |
| `audience_members` database table | Migration `028_audience_members.sql` |
| Admin audience dashboard | `/admin/audience` — list, sources, CSV export |
| ESP sync API | `/api/audience-sync` → Beehiiv or Kit |

**Flow:** Form submit → Supabase `subscribe_audience_member` → background sync to ESP → `esp_provider` stored on record.

**Segmentation (Beehiiv):** Sync sends UTM metadata — `utm_medium` = consent source (newsletter, contact, booking, summit_interest), `utm_campaign` = platform slug or event (e.g. `aald`, `event-performx-summit-2026`). Build Beehiiv segments from these fields.

**Editorial strategy workshop:** [`docs/planning/newsletter-editorial-strategy-conversation-guide.md`](./planning/newsletter-editorial-strategy-conversation-guide.md) — paste into Gemini/Claude for content planning with Dr. Akin.

---

## Step 1 — Choose your ESP

| Tool | Free tier | Recommendation |
|------|-----------|----------------|
| **Beehiiv** | 2,500 subscribers, unlimited sends | **Default choice** — best UX for non-technical senders |
| **Kit (ConvertKit)** | 10,000 subscribers | Use if you expect rapid list growth past 2,500 |

---

## Step 2 — Create Beehiiv account (recommended)

1. Sign up at [beehiiv.com](https://www.beehiiv.com)
2. Create a **publication** (e.g. “Dr. Akinpelu Updates” or “The Akin Brief”)
3. **Settings → Integrations → API** → Create API key
4. Copy **Publication ID** from dashboard URL: `…/publications/{THIS_ID}`

---

## Step 3 — Verify sender domain in Beehiiv (optional but recommended)

1. Beehiiv → **Settings → Domains**
2. Add `theakinakinpelu.org` or a subdomain (e.g. `news.theakinakinpelu.org`)
3. Add DNS records Beehiiv shows in **Cloudflare** (alongside existing MX — do not remove Zoho MX)
4. Wait for green **Verified**

Campaigns send **from Beehiiv**, not from the site. This is separate from Resend (transactional).

---

## Step 4 — Apply Supabase migration (if not done)

In Supabase SQL Editor, run:

```
supabase/migrations/028_audience_members.sql
```

Verify:

```bash
npm run verify:supabase
```

---

## Step 5 — Add Vercel environment variables

**Vercel → dr-akin-platform → Settings → Environment Variables → Production**

### Beehiiv (recommended)

```
BEEHIIV_API_KEY=your_api_key_here
BEEHIIV_PUBLICATION_ID=your_publication_id_here
```

### Or Kit (alternative)

```
KIT_API_KEY=your_api_key_here
KIT_FORM_ID=your_form_id_here
```

If both Beehiiv and Kit vars are set, **Beehiiv takes precedence**.

**Redeploy** production after saving env vars.

---

## Step 6 — Test the integration

1. Open https://theakinakinpelu.org
2. Scroll to footer → **Stay connected** (or newsletter section)
3. Enter test email, **check the marketing opt-in box**, submit
4. Open **Admin → Audience** — new row with your email
5. Check `esp_provider` column — should show `beehiiv` (or `kit`)
6. Confirm subscriber appears in Beehiiv/Kit dashboard

If sync is skipped (no env vars), Audience row still appears but `esp_provider` is empty.

---

## Step 7 — Send your first campaign (in Beehiiv)

1. Beehiiv → **Posts → Create**
2. Choose **Newsletter** type
3. Use drag-and-drop editor
4. Include unsubscribe footer (Beehiiv adds automatically)
5. Send test to internal team first
6. Schedule or publish to full list

**Campaign types to tag mentally:**

| Type | Use for |
|------|---------|
| Newsletter | General periodic update |
| Summit announcement | PerformX Summit |
| Event announcement | Other events |
| Insights digest | New articles |
| Partner update | AALD / PerformX news |

---

## Step 8 — Admin monitoring

| Task | Where |
|------|-------|
| View all opt-ins | Admin → Audience |
| Export for review | Admin → Audience → Export CSV |
| Check sync status | `esp_provider` and `esp_subscriber_id` columns |
| Unsubscribe someone | Mark in Beehiiv; platform webhook v2 planned |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Row in Audience but no ESP sync | Check Vercel env vars; redeploy |
| Beehiiv API error | Verify API key and publication ID |
| Form submits but no row | Run migration 028; check Supabase connection |
| Duplicate subscribers | RPC dedupes by email — safe to resubmit |
| Marketing without opt-in checkbox | By design — checkbox required |

---

## What NOT to do

- Do **not** use Resend for marketing campaigns — transactional only
- Do **not** backfill old enquiries/bookings into marketing list without re-consent
- Do **not** remove Zoho MX records when adding Beehiiv DNS

---

## Next session agenda

When ready to set up together:

1. Confirm Beehiiv account created
2. Paste API key + publication ID (or add to Vercel yourself)
3. Run test signup + verify Audience + Beehiiv
4. Draft first welcome/newsletter template in Beehiiv

---

*See also: `docs/email-marketing-setup.md` for full integration reference.*
