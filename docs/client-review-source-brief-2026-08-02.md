# Dr. Akin Platform — Client Review Source Brief

**Document purpose:** Source material for AI slide generation (Google Slides Gemini, Gamma, etc.)  
**Review date:** 2 August 2026  
**Audience:** Client team (Akin Akinpelu) + internal project stakeholders  
**Tone:** Clear, operational, non-technical where possible. Not salesy.

---

## Project summary

The Dr. Akin Platform is the official website and admin back office for **Akin Akinpelu, Ph.D., Amb., FLPi** — leadership scholar, governance practitioner, diplomat and institution builder.


| Layer                        | Service                   | Purpose                                             |
| ---------------------------- | ------------------------- | --------------------------------------------------- |
| Public website + admin UI    | **Vercel**                | Pages, forms, admin screens, API routes             |
| Database, auth, file storage | **Supabase**              | Bookings, enquiries, CMS content, user accounts     |
| Domain name                  | **Registrar** (unchanged) | `theakinakinpelu.org` — DNS only updated at go-live |


**Preview URL (live now):** [https://dr-akin-platform.vercel.app](https://dr-akin-platform.vercel.app)  
**Target production domain:** theakinakinpelu.org

**Short hosting answer:** The website is hosted on Vercel. Application data and the secure back office run on Supabase. The domain stays with the current registrar; we only need DNS updated to point to Vercel when ready to go live.

---



## Strategic identity (continental repositioning)



### Public identity

- **Name:** Akin Akinpelu, Ph.D., Amb., FLPi
- **AU title:** Special Emissary, African Union
- **Descriptors:** Leadership Scholar · Governance Strategist · Diplomat · Institution Builder
- **Three pillars:** Governance · Enterprise · Education



### Six platforms (under the pillars)


| Pillar         | Platforms                                                     |
| -------------- | ------------------------------------------------------------- |
| **Governance** | Future Africa; African Union / Special Emissary role          |
| **Enterprise** | AALD (Akin Akinpelu Learning & Development Company); PERFORMX |
| **Education**  | Erudio Hub; Auctus Africa                                     |




### Retired

- **TC Resource Technology** — removed from public navigation; permanent redirect to Work hub

---



## Major delivery today (2 August 2026)

This was the primary development block (~2+ hours): **continental identity and architecture rollout**.

What changed:

1. Rebuilt site structure around three pillars and six platforms (above)
2. Created canonical content modules so identity and ecosystem stay consistent everywhere (hero, navigation, work pages, footer, SEO)
3. Updated navigation, homepage, work hub, profile, speaking, and footer copy
4. Added new public routes: `/contact`, `/privacy`, RSS feed at `/rss.xml`
5. Added organizer **Resources** feature in admin (upload files; grant downloads to confirmed bookings)
6. Prepared Supabase database migrations for production (resources, contact/geo, ecosystem restructure, PERFORMX restore)
7. Corrected AALD naming to **Akin Akinpelu Learning & Development Company**
8. Added domain and hosting handoff brief for previous web partner
9. Integrated brand logo assets (header, footer, admin login, favicon)

**Known issue (future polish):** Logo does not render well at small sizes on the live site. Needs refinement — ideally replace PNG assets with SVG master files.

---



## Public website — what is live



### Core pages

- **Homepage** — pillar-led hero (“Governance · Enterprise · Education”), identity statement, ecosystem overview, enquiry CTA
- **Work hub** — all six platforms with individual detail pages
- **Meet Akin** — profile, speaking, board governance, continental mandate
- **Resources** — library (books), audio archives
- **Events** — events hub and event detail pages
- **Insights** — articles with public views and RSS feed
- **Book Dr Akin** — booking request form
- **Track booking** — requester can check booking status
- **Contact** — general enquiry form
- **Privacy** — privacy policy page



### Lead capture (public → admin)

- Booking/speaking requests → **Admin: Requests**
- General enquiries (contact form, enquiry modal) → **Admin: Inbox**



### SEO and discoverability

- Structured data (JSON-LD) for person and site identity
- `robots.txt`, sitemap behaviour
- RSS feed for insights

---



## Admin back office — what is live

Access: `/admin/login` (role-based after sign-in)


| Section               | What admins can do                                                          |
| --------------------- | --------------------------------------------------------------------------- |
| **Requests**          | View and manage booking/speaking enquiries; status workflow; request detail |
| **Inbox**             | View and manage general contact enquiries                                   |
| **Homepage**          | Edit homepage content                                                       |
| **Events**            | Create and publish events                                                   |
| **Books**             | Manage library books                                                        |
| **Insights**          | Publish and edit articles                                                   |
| **Work**              | Manage platform/org pages (CMS overrides static content)                    |
| **Resources**         | Upload organizer materials; grant file downloads to confirmed bookings      |
| **Team**              | Invite admin users; role-based access (owner/admin/editor roles)            |
| **Featured Episodes** | Manage audio highlights                                                     |
| **Audit Log**         | Activity history for accountability                                         |
| **In-app help tips**  | Short contextual guidance on key screens                                    |




### Roles (summary)

- Not all admins see all sections (e.g. Team, Audit Log, Resources require elevated permissions)
- Routine content updates do not require a developer

---



## Technical work completed (behind the scenes)

- Supabase migrations prepared (not yet applied in production unless stated otherwise):
  - `018_organizer_resources.sql` — file storage and booking resource grants
  - `019_contact_geo_foundation.sql` — contact enquiry RPC, geo/SEO foundation
  - `020_continental_ecosystem.sql` — ecosystem restructure, TC Resource unpublish
  - `021_restore_performx.sql` — restore PERFORMX visibility in CMS
- Hardened public contact enquiry API (validation, topic restrictions, abuse protection)
- Domain/hosting handoff brief documented (`docs/domain-and-hosting-handoff-brief.md`)
- Vercel redirect for retired TC Resource URL
- Production build verified (54 pages)

---



## Remaining work — CRITICAL for launch

These block go-live or materially affect lead generation and lead management:

1. **Custom domain DNS cutover**
  - Add `theakinakinpelu.org` in Vercel dashboard
  - DNS at registrar:
    - A record `@` → `76.76.21.21`
    - CNAME `www` → `cname.vercel-dns.com`
  - **Preserve existing MX and TXT records** (business email must not break)
  - Vercel may require a TXT verification record after domain is added
2. **Apply Supabase migrations 018–021 in production database**
3. **Production environment configuration**
  - Set `PUBLIC_SITE_URL` to production domain
  - Update Supabase Auth redirect URLs for custom domain
4. **Client content sign-off**
  - Core copy in continental copy deck: identity, hero, platform descriptions
  - Approved social media URLs for footer and profile
5. **End-to-end smoke test before announcing go-live**
  - Submit enquiry on public site → appears in admin Inbox
  - Submit booking request → appears in admin Requests
  - Admin can update status and manage content in CMS

---



## Remaining work — CAN wait until after launch

Does not block usefulness for lead generation or day-to-day admin operation:

- Refine header logo sizing and quality (SVG replacement)
- Upload organizer PDFs/photos into Resources admin
- Final polish on non-critical copy (sections marked “Review” in copy deck)
- Transactional email notifications for enquiry confirmations (enquiries are already captured in admin; email alerts are an enhancement)
- GEO/SEO baseline runbook execution and Google Search Console setup
- Client/legal verification of specific public claims (board positions, AU wording nuances, metric tiles, partner logos)

---



## Future roadmap (not needed for launch)

- **Admin Help Centre** — dedicated documentation site covering how to maximise the platform: team invites, publishing workflow, inbox management, SEO rebuild, resources, booking workflow. Separate from in-app tips. Possible URL: `help.theakinakinpelu.org`
- In-app searchable help widget
- Deeper email automation (e.g. Resend) for enquiry and booking notifications to admin inboxes
- Public-facing help/FAQ for website visitors
- Analytics and conversion tracking dashboard
- Additional platform pages or microsites as the ecosystem grows

---



## Go-live checklist — who does what



### Domain owner / previous web partner

- Provide registrar access OR apply DNS records on instruction
- Confirm business email (MX records) will not be disrupted
- List any old site URLs that must redirect to the new site



### Development team

- Add domain in Vercel; provide any verification TXT record
- Run Supabase migrations in production
- Update auth redirect URLs and environment variables
- Cutover testing before and after DNS propagation



### Client team

- Review and approve copy deck
- Provide final social media URLs
- Smoke-test admin flows (Requests, Inbox, content publishing)
- Agree go-live date

---



## How the team operates after launch

- **Content updates:** Through admin CMS (Events, Books, Insights, Work, Homepage) — no developer needed for routine changes
- **Leads:** Monitor Requests and Inbox daily
- **New staff:** Invited via Team admin with appropriate role
- **SEO:** Use admin “Rebuild SEO” after major content publishes
- **Help Centre (coming):** Step-by-step guides for every admin screen — reduces reliance on developer walkthroughs

---



## Presentation design guidance

Match the live website aesthetic:

- Off-white / cream background
- Charcoal / black text
- Clean sans-serif typography (Inter or similar)
- Generous whitespace
- Optional kicker: **GOVERNANCE · ENTERPRISE · EDUCATION**
- No stock photos, no clip art, no animations, no gradients
- One main idea per slide; max 5 bullets per slide

Suggested slide structure (12–14 slides):

1. Title
2. Platform overview (what it is, where it’s hosted)
3. Today’s major delivery (continental architecture)
4. Public site — live features
5. Admin back office — live features
6. Technical work completed
7. Critical before launch
8. Can wait (post-launch polish)
9. Future roadmap
10. Go-live checklist (shared actions)
11. Day-to-day after launch
12. Summary / asks for this meeting

---



## Meeting asks (close slide)

1. DNS access or confirmation previous partner can apply records
2. Copy deck approval (identity, hero, platform copy)
3. Approved social media URLs
4. Target go-live date

