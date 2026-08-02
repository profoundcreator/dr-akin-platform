# Continental Transformation: Architecture Impact and Rollout

## Executive decision

The platform is moving from four loosely described operating arms to a single identity organised around three strategic pillars and six platforms:

- Governance: African Union continental position, Future Africa.
- Enterprise: AALD, PERFORMX.
- Education: Erudio Hub, Auctus Africa.

The public identity is `Akin Akinpelu, Ph.D., Amb., FLPi`; the approved AU title is `Special Emissary, African Union`.

## Current architecture

The site uses a hybrid model:

1. Static page and platform data in `src/data/site-content.ts` and `src/lib/work-orgs/constants.ts`.
2. Published Supabase `work_orgs` rows override static platform content.
3. Navigation, profile fallbacks, speaking themes, metrics and contact details are duplicated in component-local constants.
4. Astro builds known content routes; Vercel rewrites unknown slugs to client-side shells until a rebuild runs.

This means removing TC Resource from one file is insufficient. A published database row or a component fallback can restore it at runtime.

## Target architecture

### Canonical person identity

`src/data/person-identity.ts` owns:

- Names and suffix formatting.
- Approved AU title.
- Role descriptors.
- Metrics.
- Contact details.
- Approved social links.
- Brand asset slots.

### Canonical ecosystem

`src/data/ecosystem.ts` owns:

- Pillar keys, labels and summaries.
- Six platform definitions.
- Internal and external destinations.
- Display order and grouping.

Work CMS rows continue to supply editable platform-page content. The ecosystem module supplies stable taxonomy and navigation relationships.

### Content flow

```text
person-identity.ts ──> hero / profile / speaking / footer / JSON-LD

ecosystem.ts ────────> nav / homepage ecosystem / work hub / profile ecosystem
                             │
                             └──> work-org CMS merge ──> platform detail pages

Supabase CMS ─────────> published content ──> Astro rebuild ──> static SEO pages
```

## Route changes

### Add

- `/work/future-africa`
- `/work/auctus-africa`
- `/contact`
- `/privacy`
- `/admin/resources`
- `/insights/feed.xml`

### Preserve

- `/work/aald`
- `/work/performx`
- `/work/erudio-hub`
- `/meet-akin/au-ambassador` as the existing route, while updating its visible title.

### Redirect

- Permanent redirect `/work/tc-resource-technology` → `/work`.

## Supabase and migration impact

### Work ecosystem

- Unpublish any `work_orgs` row with slug `tc-resource-technology`.
- Upsert `future-africa` and `auctus-africa`.
- Preserve the historical `tc_resource` Postgres event enum value.
- Hide TC Resource from new event/work admin options.

### Contact

Add a hardened public `create_general_enquiry` RPC:

- Validate name, email, topic and message.
- Restrict accepted topic/source values.
- Write into the existing `enquiries` table.
- Include a honeypot and server-side throttling/rate-limit strategy.
- Avoid exposing direct anonymous table inserts.

### Organizer resources

Add:

- `organizer_resource_files`: title, category, audience variant, version, storage path, status, current version.
- `booking_resource_grants`: booking, resource, grant/revoke actor and timestamps.
- Private `organizer-materials` bucket.
- Admin RLS based on `canManageResources` equivalent database checks.
- Organizer RPC that validates booking reference/token and returns only granted resources.
- Signed URLs with short expiry; no public object URLs.
- Audit events for upload, publish, grant, revoke and download-link generation.

## CMS/admin impact

- Work Admin: new platform entries; no TC option for new content.
- Events Admin: legacy TC labels remain readable, but cannot be newly selected.
- Insights Admin:
  - Social description.
  - Social image path/URL and alt text.
  - Thought-leadership categories.
  - Social-card preview.
- Admin navigation: add Resources.
- Request Detail: add resource grant/revoke controls.
- Organizer Tracker: add Approved Materials section.

## SEO/GEO impact

### Layout

Update `src/layouts/Layout.astro`:

- Canonical paths exclude query strings.
- Add `og:url`, `og:site_name`, `twitter:image`.
- Support `ogType`, published date and JSON-LD.
- Use a raster default share image.

### Structured data

- Homepage/profile: `Person`, `WebSite`.
- Platform pages: `Organization` where factually valid.
- Insights: `Article`.
- Events: `Event`.
- Books: `Book`.
- Detail routes: `BreadcrumbList`.

### Index controls

- Noindex booking, tracker and admin utility pages.
- Keep public contact/privacy/work/profile pages indexable.
- Exclude utility routes from sitemap.

## Privacy and security impact

- `/privacy` is required before relying on the current acknowledgement checkbox.
- Every form receives a contextual processing notice.
- Marketing consent remains separate from operational processing.
- Inventory localStorage, Supabase auth/session storage and future analytics.
- Do not add non-essential tracking before a real consent preference mechanism exists.
- Resource assets use private storage and least-privilege grants.
- The existing permanent booking token model should later be upgraded with expiry/rotation; resource signed links reduce file exposure in the interim.

## Brand and image impact

Use a central asset registry for:

- Wordmark.
- Iconmark.
- Favicon.
- Default social image.
- Portrait.
- Optional monochrome variants.

Insight image specification:

- Social card: 1200×630 PNG/JPEG.
- Editorial source: 1600×900.
- Consistent safe zones, title hierarchy and category label.
- Separate alt text from visual title treatment.
- Do not hard-code the temporary logo into generated templates.

## Delivery sequence

1. Approve copy deck and claims.
2. Add identity/ecosystem modules.
3. Refactor nav/home/work/profile/speaking.
4. Reconcile Work CMS data and redirect TC.
5. Add contact and privacy.
6. Add SEO/GEO metadata and schemas.
7. Extend Insight publishing and brand slots.
8. Build organizer resource centre.
9. Deploy migrations before UI that depends on them.
10. Run production smoke tests and link/metadata validation.

## Rollback strategy

- Keep each migration additive where possible.
- Preserve legacy event enum values.
- Before unpublishing TC, export its Work CMS row.
- New platform pages retain static fallbacks if Supabase is unavailable.
- Resource tables/bucket are isolated from existing booking/document tables.
- Feature UI should fail closed when a migration is missing.
- Contact form should show a safe mailto fallback if the RPC is unavailable.
- Revert public content through code without deleting source PDFs or approved copy documents.

## Verification checklist

### Content

- No production reference uses an unapproved AU title.
- Canonical suffix punctuation is consistent.
- No “four operating arms” or “technology alliances” copy remains.
- “Four spheres” remains only where it describes the separate Meet taxonomy.
- Future Africa plans are not written as completed achievements.

### Routes/data

- TC route redirects permanently.
- TC static fallback and published Supabase row no longer surface.
- Future Africa and Auctus render with and without Supabase.
- External Auctus URL is clearly labelled.

### Forms/privacy

- Contact topics reach Admin Inbox with correct source.
- Form validation, honeypot and throttling work.
- Privacy links are keyboard accessible.
- No optional marketing consent is preselected.

### Organizer resources

- Public users cannot enumerate or download private bucket files.
- Only permitted roles upload/grant/revoke.
- Booking A cannot access Booking B’s resources.
- Revoked grants no longer generate signed URLs.
- Signed URLs expire.

### SEO/social

- Canonical URLs are clean.
- JSON-LD validates.
- LinkedIn/X/WhatsApp previews use raster imagery.
- New pages enter the sitemap after deployment.
- Utility routes are noindexed.

### Engineering

- TypeScript/lints clean.
- `npm run build` passes.
- Desktop and mobile navigation verified.
- Admin and organizer flows smoke-tested against applied migrations.
