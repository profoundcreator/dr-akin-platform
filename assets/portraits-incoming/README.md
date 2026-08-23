# Portrait imports

Drop retouched studio portraits here, then run:

```bash
npm run import:portraits
```

Homepage hero is **not** replaced by default. To update it:

```bash
npm run import:portraits -- --include-homepage
```

After updating **formal**, refresh the default link-preview crop:

```bash
npm run import:social-images -- --bootstrap-og
```

## Slot mapping

| Incoming filename | Public output | Used on |
| --- | --- | --- |
| `dr-akin-portrait-formal.jpg` | `dr-akin-portrait-formal.webp` | `/meet-akin/profile` |
| `dr-akin-portrait-approachable.jpg` | `dr-akin-portrait-approachable.webp` | `/meet-akin`, `/work` |
| `dr-akin-portrait.jpg` | `dr-akin-portrait.webp` | `/` homepage hero (opt-in only) |

## Retouch batch (beard)

| Photo | Assign to incoming file |
| --- | --- |
| Red tie, arms crossed | `dr-akin-portrait-formal.jpg` |
| Blue suit, no tie, arms crossed | `dr-akin-portrait-approachable.jpg` |
| Double-breasted, hands on lapels | `dr-akin-portrait.jpg` (homepage — only with `--include-homepage`) |
| Orange tie, buttoning blazer | Keep in inbox for a future media slot |

Accepted extensions: `.jpg`, `.jpeg`, `.png`, `.webp` (any case)
