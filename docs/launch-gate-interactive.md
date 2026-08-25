# Launch gate — interactive checklist

**Target domain:** `theakinakinpelu.org`  
**Interim URL:** `https://dr-akin-platform.vercel.app`  
**Last updated:** 22 August 2026

Use this as the single go-live gate. Click checkboxes in Cursor/VS Code preview (or edit `- [ ]` → `- [x]`).

**Status key:** ✅ = confirmed done · ☐ = still open

---

## Already confirmed — no action needed

- ✅ Automated HTTP smoke passes on Vercel preview URL
- ✅ Transactional email routing live (EA + brand-mapped inboxes verified)
- ✅ Header wordmark + favicon deployed
- ✅ Social / PerformX OG assets on production
- ✅ Real book covers + speaking / marketing images live
- ✅ PerformX Summit 2026 page live with correct OG image

---

## 1. Infrastructure & domain

| Agent? | Task |
| ------ | ---- |
| **You** | DNS cutover — point `theakinakinpelu.org` (+ `www`) to Vercel; **preserve MX** for `ea@`, `hello@`, etc. |

- [ ] DNS cutover complete
- [ ] SSL certificate active on custom domain (Vercel → Domains)

| Agent? | Task |
| ------ | ---- |
| **You** | Paste env vars in Vercel Production (agent can verify after deploy) |

- [ ] `PUBLIC_SITE_URL=https://theakinakinpelu.org`
- [ ] `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`
- [ ] Brand inboxes: `NOTIFY_AALD`, `NOTIFY_PERFORMX`, `NOTIFY_ERUDIO`, `NOTIFY_AUCTUS`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`, `SEND_SUBMITTER_CONFIRMATION=true`
- [ ] Production redeploy after env changes

| Agent? | Task |
| ------ | ---- |
| **You** | Supabase Dashboard → Authentication → URL configuration |

- [ ] Site URL = `https://theakinakinpelu.org`
- [ ] Redirect URLs include `https://theakinakinpelu.org/admin/**`

| Agent? | Task |
| ------ | ---- |
| **You** | Resend Dashboard → Domains → verify `theakinakinpelu.org` (SPF/DKIM) |

- [ ] Resend sending domain verified (green)

| Agent? | Task |
| ------ | ---- |
| **You + Agent** | Apply SQL in Supabase SQL editor (agent can prep/verify scripts) |

- [ ] Migrations through **031** applied (contact platform routing)
- [ ] Migration **032** applied if contact form ever hit RPC overload errors
- [ ] Migrations **033–034** applied (PerformX summit cover in DB)

**Agent can run after you confirm DB access:** `npm run verify:supabase` (with `.env` pointing at production)

---

## 2. Admin & EA operations

| Agent? | Task |
| ------ | ---- |
| **You (EA)** | Live sign-in test on production URL |

- [ ] EA signs in at `/admin/login` (magic link opens production, not localhost)
- [ ] EA opens **Inbox**, **Requests**, and **Work**
- [ ] Super Admin sign-in still works (backup)

| Agent? | Task |
| ------ | ---- |
| **You + Agent** | One end-to-end booking test |

- [ ] Test booking appears in **Admin → Requests**
- [ ] `/track-booking` lookup works (reference + access token)
- [ ] Test enquiries/bookings archived or deleted after sign-off

**Agent can:** walk through booking + tracker in browser; draft SQL/RPC to archive test rows if you want zero manual admin cleanup.

---

## 3. Legal & privacy

| Agent? | Task |
| ------ | ---- |
| **You (lawyer)** | Review `/privacy` |

- [ ] Lawyer sign-off (address, NDPC registration, processor DPAs)
- [ ] Remove two **“For legal review”** callouts on `/privacy` after approval

**Agent can:** apply counsel’s exact copy and remove callouts in one commit once you paste approved text.

---

## 4. Content & client sign-off

| Agent? | Task |
| ------ | ---- |
| **You (client)** | Approve remaining copy + links |

- [ ] Continental copy deck signed off (`docs/content-strategy/continental-copy-deck.md` — “Review” items)
- [ ] Approved social URLs provided (agent wires into `src/data/site-contact.ts`)
- [ ] PerformX Summit 2026 copy / date / CTA approved on live page
- [ ] Client sign-off on `docs/final-audit-report.md`

**Agent can:** implement approved social links, copy edits, and summit tweaks immediately after you send URLs or marked-up copy.

---

## 5. Launch day verification

| Agent? | Task |
| ------ | ---- |
| **Agent** | Re-run automated smoke on custom domain |

- [ ] `BASE_URL=https://theakinakinpelu.org npm run verify:smoke:production` passes

| Agent? | Task |
| ------ | ---- |
| **You** | Social scrapers (cache bust) |

- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — homepage + one insight URL
- [ ] LinkedIn Post Inspector — same URLs (after DNS cutover)

| Agent? | Task |
| ------ | ---- |
| **You** | Visual spot-check |

- [ ] Mobile hard refresh — header logo + favicon correct
- [ ] Announce / share live URL

---

## 6. Recommended soon (won’t block launch)

- [ ] `NOTIFICATIONS_STATUS_KEY` set in Vercel; probe returns all checks `true`  
  `curl "https://theakinakinpelu.org/api/notifications-status?key=YOUR_KEY"`
- [ ] Resend SMTP in Supabase for team invite emails (avoids 2/hour cap)
- [ ] `VERCEL_DEPLOY_HOOK_URL` set (admin “Rebuild site for SEO”)
- [ ] Cloudflare Turnstile on contact + booking (needs Turnstile site/secret keys from you)

**Agent can:** wire Turnstile, deploy hook env docs, and fix probe endpoint if misconfigured.

---

## 7. Explicitly post-launch

Do **not** hold go-live for these:

- Newsletter ESP (Beehiiv/Kit) + footer signup sync
- Organizer status-update emails
- Announcements / press section
- Full site photography shoot
- Admin calendar, travel workspace, PDF exports

---

## What Agent mode can do to move faster

Use **Agent mode** with a short instruction per row. Examples:

| You say | Agent does |
| ------- | ---------- |
| “Social links: LinkedIn …, X …” | Updates `site-contact.ts`, footer, commit, push |
| “Lawyer approved privacy — here’s the text” | Replaces `/privacy` content, removes callouts, deploys |
| “Run launch smoke on custom domain” | `BASE_URL=… npm run verify:smoke:production` + report |
| “Verify migrations 029–034” | Runs verify scripts, lists missing RPCs/tables |
| “Archive test submissions from last week” | SQL or admin steps with your approval |
| “Add Turnstile — here are keys” | Form + API integration, smoke test |
| “PerformX summit copy change: …” | CMS/static update + OG check |
| “Prep migration paste file for Supabase” | Single SQL file ready to run in dashboard |
| “Check all pages after DNS” | Full smoke + spot-check key routes in browser |

**Agent cannot do without you:** DNS registrar changes, Vercel/Supabase/Resend dashboard login, lawyer approval, client copy sign-off, or reading your private inboxes.

**Fastest handoff pattern:** tick boxes here → paste unchecked items into Agent chat in one message, e.g.  
*“Do agent rows for §4 social links + §5 smoke; I’ll handle DNS today.”*

---

## Sign-off

| Role | Name | Date |
| ---- | ---- | ---- |
| Technical | | |
| EA / operations | | |
| Client | | |
