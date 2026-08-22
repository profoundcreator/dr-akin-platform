# Privacy notice review brief

**Provide this document to counsel for review before marketing email goes live.**

---

**Subject:** Public website privacy notice for theakinakinpelu.org  
**Data controller:** Akin Akinpelu (individual / sole operator — confirm corporate entity if different)  
**Contact:** hello@theakinakinpelu.org | +234 706 589 5185  
**Jurisdictions:** Nigeria (NDPA 2023, NDPC GAID) + GDPR for EU/UK visitors  
**Last draft date:** 2 August 2026 (operational-only; requires expansion)

**Current published draft:** [`src/pages/privacy.astro`](../src/pages/privacy.astro) (updated 21 Aug 2026 with marketing sections — still requires legal sign-off).

## Website and processing activities

1. **Contact enquiries** — name, email, phone (optional), organization, subject/topic, message. Lawful basis: legitimate interest / pre-contractual steps.
2. **Booking requests** — full organizer form including engagement type, dates, location, audience size, budget, VIP protocol. Lawful basis: legitimate interest / pre-contractual steps.
3. **Marketing communications** (new) — optional opt-in at contact, booking, newsletter, summit interest. Lawful basis: **consent** (must be freely given, specific, unbundled from operational processing, withdrawable).
4. **Admin team accounts** — email, name for platform access. Lawful basis: contract / legitimate interest.
5. **Organizer resource access** — booking reference + access token; download audit logs. Lawful basis: contract.
6. **Rate limiting** — hashed email only (`public_enquiry_rate_limits`), not identifiable storage.

## Processors / sub-processors

| Processor | Purpose | Location |
|-----------|---------|----------|
| Supabase | Database, auth | Configurable region |
| Vercel | Hosting, serverless API | US/EU |
| Resend | Transactional email | US |
| Beehiiv or Kit | Marketing email | US |
| (Future) Event registration vendor | Summit delegates | TBD |

## International transfers

Data may be processed outside Nigeria; require appropriate safeguards (SCCs, NDPC cross-border mechanisms).

## Retention (proposed — counsel to confirm)

- Enquiries/bookings: 3–7 years for operational/legal records
- Marketing subscribers: until unsubscribe + 30 days suppression
- Rate-limit hashes: 24 hours

## Individual rights to address

- Access, rectification, erasure, restriction, objection
- Withdraw marketing consent without affecting operational enquiry handling
- Lodge complaint with NDPC (Nigeria) and relevant EU/UK supervisory authority
- NDPC registration/audit obligations for data controller (confirm if applicable)

## Specific questions for counsel

1. Is separate consent checkbox required for marketing vs. operational privacy acknowledgement on same form?
2. Can summit "register interest" imply consent to event-related emails only, or must it join the unified list with general marketing consent?
3. Lawful basis for syncing consented contacts to US-based ESP (Beehiiv/Kit)?
4. Is NDPC registration required for this controller at current scale?
5. Wording for children's data (site not directed at under-16s)?
6. Cookie/analytics disclosure — confirm if any analytics (Vercel Analytics, etc.) are in scope?

## Deliverable requested

Production-ready privacy notice text + cookie notice if needed, suitable for publication at `/privacy`.

After approval: remove `[For legal review]` callouts in `privacy.astro` and set final "Last updated" date.
