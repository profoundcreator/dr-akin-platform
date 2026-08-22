# Social & stage image sources

Drop the four approved stage photos here, then run:

```bash
npm run import:social-images
```

| Source filename | Output | Use |
| --- | --- | --- |
| `dr-akin-social-og-source.jpg` | `dr-akin-social-og.webp` | Site-wide default OG (1200×630) — side profile on stage |
| `dr-akin-speaking-og-source.jpg` | `dr-akin-speaking-og.webp` | `/meet-akin/speaking` link preview |
| `dr-akin-speaking-hero-source.jpg` | `dr-akin-speaking-hero.webp` | Speaking page in-browser hero |
| `performx-summit-og-source.jpg` | `performx-summit-og.webp` | PerformX Summit 2026 event cover + OG |

Accepted extensions: `.jpg`, `.jpeg`, `.png`, `.webp`

Interim bootstrap (studio portrait crops until stage files are added):

```bash
npm run import:social-images -- --bootstrap
```
