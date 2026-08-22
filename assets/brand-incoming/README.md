# Brand wordmark source

Drop your master logo here, then run:

```bash
npm run import:brand
```

| File | Purpose |
| --- | --- |
| `akin-wordmark-source.png` | Grey italic lockup (screenshot export is fine) |

**Export tips**

- PNG with **transparent background** is best. Black background also works — the import script keys it out.
- Minimum **800 px wide**; wider is fine.
- Avoid JPEG (compression artefacts on text edges).

**Generated outputs** (`public/brand/`)

| Output | Used for |
| --- | --- |
| `akin-wordmark-light.png` | Site header & footer |
| `akin-wordmark-email-light.png` | Notification emails (light mode) |
| `akin-wordmark-email-dark.png` | Notification emails (dark mode) |

**Email display size:** 200×auto px (44 px max height), linking to your site home URL.

### Favicon / Apple touch icon

Attach in Cursor chat or save locally, then run `npm run import:favicon`:

| File | Purpose |
| --- | --- |
| `akin-iconmark-cream-512.png` | 512×512 cream `#FAFAF8` square (preferred master) |
| `akin-iconmark-cream-180.png` | Optional 180×180; 512 is resized if this is all you have |

**Outputs:** `public/favicon.svg`, `public/brand/akin-iconmark.png` (180×180), `public/brand/akin-iconmark-512.png`
