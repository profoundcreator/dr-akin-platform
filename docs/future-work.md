# Future work backlog

Items we plan to add to the Dr. Akin platform. Not in active development yet.

---

## Admin help centre

**Status:** Planned  
**Priority:** Medium (after core admin flows are stable)

### Goal

A dedicated help/documentation site for non-technical admins — how to invite team members, publish books and articles, manage enquiries, rebuild SEO, etc. Separate from the in-app `AdminHelpTip` popovers, which stay for quick context on each screen.

### Possible URLs

- `help.dr-akin-platform.vercel.app/admin` (Vercel subdomain while on default domain)
- `help.<custom-domain>/admin` once a custom domain is connected (e.g. `help.drakin.com/admin`)

### Tooling (free-tier options to evaluate)

| Tool | Notes |
|------|--------|
| **GitBook** | Free tier for small teams; clean docs UI; custom subdomain on paid plans |
| **Mintlify** | Free for open-source / small projects; good developer-docs UX |
| **Docusaurus / Astro Starlight** | Self-hosted in this repo or a sibling repo on Vercel — full control, no vendor lock-in |
| **Notion** (public page) | Fastest to write; less polished public URL/branding |

Recommendation when we build this: prefer a tool with a **free custom subdomain or easy Vercel deploy**, markdown-based content, and simple search.

### Integration (when built)

- Link from admin sidebar/footer: **“Help centre”** → opens help site (new tab)
- Optional: deep links from `AdminHelpTip` topics to full articles
- Content themes: Team, Books, Insights, Inbox/enquiries, Events, Homepage, SEO rebuild

### Out of scope for v1

- In-app searchable widget (could come later)
- End-user/public help (this is **admin-only**)

---

## Post-launch editorial engine & lead-gen resource hub

**Status:** Planning (target ~1 month post-launch)  
**Priority:** After newsletter setup and EA team stabilisation  
**Spec:** [`docs/planning/post-launch-editorial-engine-lead-gen.md`](./planning/post-launch-editorial-engine-lead-gen.md)

Gates Notes–grade MDX editorial components, McKinsey-style gated whitepapers, HubSpot-style operational templates, admin-managed gating rules, and extended audience/lead capture — all operable from the back office without code changes.

---

## Related items (also on the roadmap)

- **Newsletter / Beehiiv setup** — see `docs/newsletter-setup-checklist.md` (do before editorial engine)
- **Enquiry modal & pages** — UX and workflow fixes before email notifications
- **Resend (or similar)** — transactional email for enquiry confirmations and admin alerts (separate from Supabase Auth invite emails; auth invites: see `supabase/README.md` § Resend SMTP)
