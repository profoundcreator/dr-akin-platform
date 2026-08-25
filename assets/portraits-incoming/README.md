# Portrait imports

## Retouched masters (preferred)

Drop client-retouched JPEGs here — **no grey/white beard** — then:

```bash
npm run import:portraits -- --no-beard-pass
```

| Incoming file | Used on |
| --- | --- |
| `dr-akin-portrait-formal.jpg` | `/meet-akin/profile` |
| `dr-akin-portrait-approachable.jpg` | `/meet-akin`, `/work` |
| `dr-akin-portrait.jpg` | `/` homepage (only with `--include-homepage`) |

## Legacy sources (interim)

If only `IMG_3662.JPG` / `IMG_3663.JPG` are present, the import script maps them automatically and applies a **conservative beard grey-reduction pass**:

```bash
npm run import:portraits
```

Replace with retouched masters as soon as they are available.

## Mapping reference

| Retouched photo | Incoming filename |
| --- | --- |
| Red tie, arms crossed | `dr-akin-portrait-formal.jpg` |
| No tie, arms crossed | `dr-akin-portrait-approachable.jpg` |
| Double-breasted, lapels | `dr-akin-portrait.jpg` (homepage, opt-in) |
