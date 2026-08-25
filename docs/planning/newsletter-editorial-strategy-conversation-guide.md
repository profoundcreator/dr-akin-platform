# Newsletter & Editorial Strategy — Conversation Guide
## For Gemini, Claude, or workshop prep with Dr. Akin and team

**Status:** Planning + platform prep in progress  
**Site:** https://theakinakinpelu.org  
**Technical setup:** `docs/newsletter-setup-checklist.md`  
**Future rich media / gated assets:** `docs/planning/post-launch-editorial-engine-lead-gen.md`

---

## How to use this document

Copy the entire **Master prompt for AI** section at the bottom into Gemini or Claude. Attach or paste this file as context. Use the output to run a 60–90 minute working session with Dr. Akin, the EA team, and brand leads for AALD, PERFORMX, Erudio Hub, Auctus Africa, and Future Africa.

The goal is not a generic content calendar. The goal is a **lead-generation and influence engine** tied to the live platform — so the website is the centre of gravity, not an appendage.

---

## Part 1 — What we are building (plain language for Dr. Akin)

### The problem we are solving

Dr. Akin already has depth: Forbes articles, Forbes Coaches Council pieces, personal drafts, books, events, and six ecosystem platforms. Much of that value is scattered across the web. The platform gives one home — but without a deliberate newsletter and content rhythm, traffic does not compound into relationships, leads, or organisational momentum.

### The solution in three layers

**Layer 1 — Capture (live now, Beehiiv connection next)**  
When someone opts in on the site (footer, contact form, booking, summit interest), their email is stored securely and can sync to Beehiiv with **segment hints** (which platform they care about, which event, how they found you).

**Layer 2 — Nurture (Beehiiv, starting soon)**  
Regular communication that feels like **Dr. Akin writing directly** — not a corporate blast. Short, thoughtful, first-person notes with one clear idea and one clear next step (read an article, register for PerformX, explore AALD, book a keynote).

**Layer 3 — Convert (site + future gated assets)**  
Articles and events drive action: share buttons (live on insights and events), booking CTAs, summit registration, and — next month — downloadable whitepapers and templates behind optional email gates.

### What makes this different from a typical newsletter

| Typical newsletter | Dr. Akin approach |
|--------------------|------------------|
| HTML template, logo header, 5 sections | **Personal letter** — plain tone, one subject, one voice |
| Same message to everyone always | **Segmented sends** — AALD audience, PerformX audience, general continental audience |
| Repurposed link dump | **Curated insight** — one idea from existing writing, rewritten for the moment |
| Disconnected from website | **Every send links back** to theakinakinpelu.org — articles, events, booking |

---

## Part 2 — Audience segments (for Beehiiv)

When Beehiiv is connected, subscribers arrive with metadata from the site. Use these segments for targeted sends.

### Primary segments

**Everyone (master list)**  
Footer signups, general contact opt-ins, broad interest. Use for continental thought leadership, new insights, AU mandate updates, book announcements.

**Speaking & advisory**  
Booking form opt-ins where request area is Dr. Akin speaking office. Use for keynote availability, leadership essays, governance themes — not AALD product pitches.

**AALD**  
Contact or booking from `/work/aald`, or platform tagged `aald`. Enterprise development, leadership programmes, AALD news.

**PERFORMX**  
PerformX pages, summit interest form, event `performx-summit-2026`. Summit updates, founder programmes, PerformX Nexus announcements.

**Erudio Hub**  
Erudio platform interest. Education innovation, hub programmes.

**Auctus Africa**  
Auctus platform interest. Investment and enterprise themes for that brand.

**Future Africa**  
Future Africa platform interest. Agenda 2063, continental policy, Future Africa initiatives (often routed via Erudio inbox operationally — segment still distinct for comms).

**Event-specific**  
Summit interest captures include event slug — e.g. PerformX Summit 2026 list for pre-event nurture.

### How segments are captured on the site today

| Source | Segment signal stored |
|--------|------------------------|
| Footer newsletter | Page path + inferred platform (e.g. on `/work/aald`) |
| Contact form opt-in | Platform query param or referrer page |
| Booking form opt-in | Request area (speaking-office vs AALD vs PerformX, etc.) |
| Summit interest form | Event slug + title |

Beehiiv receives UTM-style tags: source `dr-akin-platform`, medium = consent type, campaign = platform or event. Build Beehiiv **segments or tags** from these fields after account setup.

---

## Part 3 — Voice and format — “personally drafted email”

Dr. Akin’s newsletter should read like he sat down and wrote to one thoughtful peer — not like a marketing department.

### Voice principles

- First person: “I have been thinking about…” not “Dr. Akin is pleased to announce…”
- One idea per email — resist the urge to cover five topics
- Short paragraphs — mobile-first; many readers on WhatsApp-linked phones
- African continental confidence — governance, enterprise, education; not generic motivational fluff
- Warm but authoritative — Special Emissary gravitas without stiffness
- Always one **soft CTA** — read, register, reply, book — never three competing buttons

### Recommended email types (rotate)

**The Note** (fortnightly)  
300–500 words. One insight from recent thinking. Link to one site article or event. Signature: “— Akin”

**The Dispatch** (monthly, segmented)  
Platform-specific: “For those building through AALD…” with one programme update + one resource link.

**The Event Pulse** (as needed)  
PerformX Summit, hosted events — countdown, speaker news, registration link.

**The Republish** (monthly)  
Take one Forbes / external piece or old draft; 2-paragraph fresh intro + link to full insight on site (SEO and list growth).

**The Personal Ask** (quarterly, small segment)  
Invitation to reply — “What leadership question should I address next?” Feeds future content.

### Beehiiv formatting tips for “personal email” feel

- Plain or minimal template — no heavy hero banner
- From name: `Akin Akinpelu` or `Dr. Akin Akinpelu`
- Subject lines: sentence case, specific — not “Newsletter Issue 12”
- Preview text: first line of the note, not marketing copy
- Optional: disable heavy CSS blocks; write like Gmail

---

## Part 4 — Content inventory (conversation prep)

Before the workshop, gather what exists. Ask Dr. Akin and team to list:

### External published work
- Forbes articles (titles + URLs)
- Forbes Coaches Council contributions
- LinkedIn long posts worth expanding
- Podcast appearances (Spotify episodes already on site)
- Conference keynotes with transcripts or slides

### Personal drafts
- Unpublished essays in Google Docs / Word
- Speech manuscripts with reusable paragraphs
- Book chapters not yet on site
- WhatsApp / voice-note themes he repeats (EA team input valuable)

### Already on theakinakinpelu.org
- 4 insights articles (expand or cross-link)
- 9 library books (excerpt campaigns)
- Events (PerformX Summit primary)
- Six work platform pages (each a segment landing page)

### Organisation-specific content buckets
- AALD: programmes, case studies, client wins (anonymised if needed)
- PERFORMX: summit, founder stories, ecosystem partners
- Erudio Hub: education innovation stories
- Auctus Africa: investment thesis snippets
- Future Africa: policy commentary (careful, dignified tone)
- Speaking office: keynote topics, governance frameworks

---

## Part 5 — Lead generation by organisation

Each segment should occasionally drive **organisation outcomes**, not only personal brand.

| Organisation | Lead goal | Typical CTA |
|--------------|-----------|-------------|
| Speaking office | Keynote / advisory booking | `/book-dr-akin` |
| AALD | Programme enquiry | `/contact?platform=aald` |
| PERFORMX | Summit registration / founder interest | Event page + summit form |
| Erudio Hub | Partnership / programme | `/contact?platform=erudio-hub` |
| Auctus Africa | Investment conversation | `/contact?platform=auctus-africa` |
| Future Africa | Policy / partnership | `/contact?platform=future-africa` |
| General | Newsletter + insights depth | New article on site |

**Rule:** No segment receives another brand’s hard sell more than once per quarter. Cross-pollinate softly (“Also building in enterprise? See AALD”) — don’t spam.

---

## Part 6 — Editorial rhythm (starter calendar)

Adjust after workshop. Suggested starting point:

**Weekly (internal only)**  
EA reviews: new enquiries, booking pipeline, one content idea from Dr. Akin voice notes.

**Fortnight**  
One “Note” to master list — personal letter + one site link.

**Monthly**  
One segmented dispatch (rotate: AALD → PerformX → Erudio → general).  
One republish or insight push with share buttons on social.

**Quarterly**  
One longer piece on site (new insight article).  
One event or summit push if relevant.

**As needed**  
Event pulses, breaking continental moment, book launch.

---

## Part 7 — Workshop agenda (90 minutes with Dr. Akin)

1. **Vision (10 min)** — What should this newsletter achieve in 12 months? Influence, leads, or both — rank priorities.

2. **Voice (15 min)** — Read two sample “Notes” aloud (AI can draft from this doc). Dr. Akin marks up: too formal? too casual?

3. **Segments (15 min)** — Confirm six org segments + master list. Who owns each dispatch?

4. **Inventory (20 min)** — List 20 existing pieces to repurpose in first 90 days.

5. **Rhythm (10 min)** — Agree fortnightly vs monthly; who drafts first pass (EA vs comms)?

6. **Lead paths (10 min)** — One CTA per segment; confirm URLs.

7. **Next steps (10 min)** — Beehiiv setup, first three subject lines, date of first send.

---

## Part 8 — Platform capabilities (technical reference)

### Live today
- Footer, contact, booking, summit opt-in → `audience_members` table
- Admin Audience dashboard + CSV export
- ESP sync API → Beehiiv or Kit (env vars required)
- Segment metadata on sync: platform, event, request area via UTM fields
- Share bar on **insight articles** and **event pages** (LinkedIn, X, WhatsApp, Facebook, email, copy link, native share on mobile)

### Recommended next pages for share buttons (Phase 2)
- Work platform pages (`/work/aald`, `/work/performx`, etc.) — high referral value for org leads
- Book detail pages (`/library/{slug}`) — authority sharing
- Meet Akin speaking page — keynote inbound
- Homepage — use sparingly (broad but less contextual)
- PerformX summit section when promoted

### Coming next month (separate spec)
- Gated whitepapers and operational templates
- Interactive editorial components in articles
- In-article booking CTAs with pre-filled context

---

## Part 9 — Beehiiv setup checklist (summary)

Full steps: `docs/newsletter-setup-checklist.md`

1. Create Beehiiv publication (e.g. “Notes from Akin” or “The Akin Brief”)
2. Add API key + publication ID to Vercel Production
3. Confirm migration 028 in Supabase
4. Test footer signup → Admin Audience → Beehiiv subscriber
5. Create Beehiiv segments from UTM campaign: `aald`, `performx`, `event-performx-summit-2026`, etc.
6. Design plain “personal letter” template
7. Send test to internal team → schedule first public Note

---

## Part 10 — Success metrics (first 90 days)

| Metric | Target direction |
|--------|------------------|
| List growth | Steady opt-ins from footer + forms + shares |
| Open rate | Above 40% (personal emails often perform higher) |
| Click to site | Every send should drive traffic to one URL |
| Booking / contact from email UTM | Track in Admin Inbox source notes |
| Segment health | Each org segment has at least one dedicated send |

---

## Master prompt for AI (copy everything below this line)

You are a strategic content advisor for Dr. Akin Akinpelu, Ph.D., Amb., FLPi — Special Emissary of the African Union. He leads a continental ecosystem spanning governance (Future Africa), enterprise (AALD, PERFORMX), and education (Erudio Hub, Auctus Africa). His live platform is theakinakinpelu.org with a private EA back office, insights articles, events, booking pipeline, and newsletter capture syncing to Beehiiv.

Your task: produce a detailed **Editorial & Newsletter Strategy Pack** for a working session with Dr. Akin and his team. The website must function as a lead-generation and influence hub — not a static brochure.

Requirements for your output:

1. Executive summary (one page, plain language) explaining how newsletter + site content drive leads for Dr. Akin personally and for AALD, PERFORMX, Erudio Hub, Auctus Africa, and Future Africa.

2. Audience segment map with: segment name, who belongs in it, content themes, forbidden topics, primary CTA URL on theakinakinpelu.org, and suggested send frequency.

3. Voice guide for “personally drafted email” style: tone rules, subject line formulas, example opening lines, sign-off, and Beehiiv formatting advice to avoid corporate-newsletter feel.

4. Content inventory worksheet: tables for Forbes/external pieces, personal drafts, site articles, books, and org-specific stories — with columns for Title, Source, Repurpose potential, Segment, Priority 1-3.

5. First 90-day editorial calendar: specific dates (starting next month), email type (Note, Dispatch, Event Pulse, Republish), segment, working title, CTA link, and owner (Dr. Akin / EA / comms).

6. Lead-generation playbook: how each email type converts to booking, contact enquiry, summit registration, or platform partnership — without being salesy.

7. Workshop facilitation guide: questions to ask Dr. Akin, red flags if voice feels wrong, and how to resolve disagreements between personal brand vs organisational promotion.

8. Repurposing workflow: step-by-step for turning one Forbes Coaches Council or draft piece into (a) site insight article, (b) personal email Note, (c) LinkedIn/WhatsApp share copy, (d) segmented Dispatch snippet.

9. Share strategy: recommend social sharing priorities for articles, events, work pages, and books; suggest post copy templates for LinkedIn and WhatsApp.

10. Risks and guardrails: AU title usage, Future Africa vs Erudio routing sensitivity, consent/privacy, frequency caps, and when not to email.

Constraints:
- Dr. Akin has extensive existing writing online especially Forbes Coaches Council plus personal drafts — prioritise repurposing over net-new volume.
- Segmented email is required: different messages for AALD interest vs PerformX vs general audience, plus occasional everyone sends.
- Emails must feel like personal letters from Dr. Akin not HTML marketing blasts.
- Beehiiv is the ESP; site already captures opt-ins with platform/event metadata.
- Gated whitepapers come next month — mention as future layer but do not depend on them for first 90 days.

Format: use clear headings and bullet lists. No markdown tables unless essential. Write for executives and EA staff who are not technical. Length: comprehensive but scannable (approximately 2500-4000 words).

Begin the strategy pack now.

---

*Document owner: Platform team · Review with Dr. Akin before first Beehiiv send*
