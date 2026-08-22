# Email marketing setup (ESP)

Marketing sends use a separate ESP from Resend transactional mail. **Resend stays transactional only** (contact/booking alerts, confirmations, status updates).

## Recommended: Beehiiv Launch (free)

| Criteria | Beehiiv | Kit (ConvertKit) |
|----------|---------|------------------|
| Free tier | 2,500 subs, unlimited sends | 10,000 subs, unlimited sends |
| Non-technical UX | Excellent drag-and-drop | Very good |
| Custom domain | Yes (free tier, 2026) | Yes |
| Upgrade trigger | 2,501+ subscribers | Budget vs Beehiiv cap |

**Default choice:** Beehiiv unless you expect 2,500+ subscribers within six months without budget — then start on Kit.

## Decision gate (before enabling sync)

1. Create Beehiiv (or Kit) account on free tier.
2. Send one test campaign to the internal team.
3. Confirm: compose flow, mobile preview, unsubscribe footer, custom sender domain.
4. Lock tool choice and set Vercel env vars below.

## Platform integration

Opt-ins flow:

```
Contact / Booking / Footer / Summit form
  → subscribe_audience_member RPC (Supabase)
  → POST /api/audience-sync (Beehiiv or Kit API)
  → esp_provider + esp_subscriber_id on audience_members
```

Admin visibility: `/admin/audience` (count, source breakdown, CSV export, sync status).

### Beehiiv

1. Settings → Integrations → create API key.
2. Copy **Publication ID** from dashboard URL (`…/publications/{id}`).
3. Vercel env:

```
BEEHIIV_API_KEY=…
BEEHIIV_PUBLICATION_ID=…
```

Beehiiv takes precedence when both Beehiiv and Kit vars are set.

### Kit (ConvertKit)

1. Account → Settings → Advanced → API key.
2. Create a form; copy **Form ID**.
3. Vercel env:

```
KIT_API_KEY=…
KIT_FORM_ID=…
```

## Campaign types (operational taxonomy)

Non-technical senders tag posts in the ESP; platform stores `consent_source` for analytics:

| Type | Use |
|------|-----|
| `newsletter` | General periodic update |
| `summit_announcement` | PerformX Summit 2026 |
| `event_announcement` | Other events |
| `insights_digest` | New articles |
| `partner_update` | AALD / PerformX news |

Default audience: **whole opted-in list**. Source is tracked, not used to exclude unless unsubscribed.

## Consent model

- Optional marketing checkbox on contact, booking, footer, summit forms — **unchecked by default**.
- Operational privacy/terms checkboxes remain required and separate.
- Do **not** backfill historical enquiries/bookings without re-consent.

## Unsubscribe

- ESP-hosted unsubscribe link in every marketing send.
- Platform `audience_members.status = unsubscribed` on manual admin action or future webhook (v2).

## Privacy

Marketing must not go live until:

1. Privacy notice published with marketing sections ([`/privacy`](../src/pages/privacy.astro)).
2. Lawyer sign-off on [`privacy-lawyer-brief.md`](privacy-lawyer-brief.md) deliverable.
3. ESP sender domain verified.

## Testing sync

After env vars are set:

1. Submit footer newsletter signup on staging/production with opt-in checked.
2. Check `/admin/audience` — row with `esp_provider` and checkmark.
3. Confirm subscriber appears in Beehiiv/Kit dashboard.

Sync skipped gracefully when no ESP env vars (`200 { skipped: true }`).
