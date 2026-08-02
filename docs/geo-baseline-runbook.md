# GEO baseline runbook

## Deployment checklist

1. Set `PUBLIC_SITE_URL` to the production origin without a trailing slash.
2. Apply `supabase/migrations/018_contact_geo_foundation.sql`.
3. Confirm `/robots.txt`, `/sitemap-index.xml`, and `/rss.xml` return `200`.
4. Confirm canonical URLs contain no query string.
5. Validate homepage, profile, insight, event, and book pages with a Schema.org validator.
6. Verify the default social image is a raster asset and individual content images resolve publicly.
7. Submit the sitemap and RSS feed to the relevant webmaster and feed tools.

## Content publishing checklist

- Give each insight a unique title and concise search description.
- Add meaningful social-image alternative text whenever an image is uploaded.
- Use one stable public URL per item; avoid publishing duplicate slugs.
- Keep publication and event dates accurate and include locations or registration URLs where available.

## Identity and brand controls

Canonical person and contact values live in `src/data/site-contact.ts`. Approved social links must be
added there only after the client confirms the account URLs. Brand asset slots live in
`src/lib/brand/assets.ts`; null wordmark and iconmark slots deliberately fall back to text and the
current favicon.

Do not add `llms.txt` without a separate review of its content, maintenance owner, and disclosure
risk.
