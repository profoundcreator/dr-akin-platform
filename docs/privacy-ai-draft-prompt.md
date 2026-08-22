# Privacy notice — AI draft prompt

Use this prompt in Claude, Harvey, or similar. Attach the current content from [`src/pages/privacy.astro`](../src/pages/privacy.astro).

---

```
You are a privacy lawyer drafting a website privacy notice. Produce publication-ready text (not advice disclaimers — draft for lawyer review).

CONTEXT:
- Website: theakinakinpelu.org — public site for Dr. Akin Akinpelu, Ph.D., Amb., FLPi (leadership, governance, enterprise platforms including AALD and PerformX Nexus)
- Data controller: Akin Akinpelu
- Contact: hello@theakinakinpelu.org, +234 706 589 5185
- Jurisdictions: Nigeria NDPA 2023 (NDPC GAID) and GDPR (EU/UK visitors)

DATA COLLECTED:
1. Contact form: name, email, phone (optional), organization, topic, message
2. Booking form: name, email, phone, organization, timezone, engagement details, dates, location, audience size, budget, terms acceptance
3. Marketing (optional opt-in, separate checkbox): email, name — for newsletters, summit announcements, event announcements, insights digests, partner updates
4. Admin accounts: email, name (internal team only)
5. Technical: hashed email for anti-spam rate limiting (not stored as PII)

PROCESSORS:
- Supabase (database, authentication)
- Vercel (hosting)
- Resend (transactional email: confirmations, admin alerts)
- Beehiiv or Kit (marketing email, with unsubscribe)

PROCESSING PURPOSES:
- Operational: respond to enquiries, coordinate speaking engagements, grant organizer resources, secure the service
- Marketing: send updates the subscriber opted into (consent-based only)
- We do NOT sell personal data

REQUIREMENTS:
- Clear separation of operational processing vs. marketing consent
- Lawful bases under NDPA and GDPR for each purpose
- International transfer disclosure and safeguards
- Retention periods (propose reasonable periods)
- Data subject rights: access, correction, deletion, objection, withdraw consent
- How to exercise rights (contact form, subject "Privacy request")
- NDPC and EU supervisory authority complaint rights
- No marketing to children; site not directed at under-16s
- Last updated date placeholder
- Plain English, professional tone, suitable for /privacy page (HTML-friendly sections with h2 headings)

OUTPUT FORMAT:
- Section headings matching a standard privacy notice structure
- No bullet-only sections — use complete sentences
- Flag any [LAWYER REVIEW REQUIRED] items where jurisdiction-specific registration or DPA wording is needed
```

---

After lawyer approval, replace content in `privacy.astro` and align form checkbox copy in contact and booking forms with the approved marketing section references.

See also: [`privacy-lawyer-brief.md`](privacy-lawyer-brief.md).
