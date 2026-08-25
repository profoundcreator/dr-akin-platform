# Build time log — Dr. Akin Platform

Track **your** active build time: planning, prompting, coding, testing, client calls about the build, DNS/email setup, etc. Git commits alone miss thinking, live testing, and conversations — this log is the honest record.

**How to use**

1. At the **start** of a session, add a row (or note start time on a sticky/todo).
2. At the **stop**, fill in end time and a short **what you did** line.
3. Mark `source` as `manual` for rows you enter yourself.
4. Leave `source: git-estimate` rows as-is until you replace them with real times, or delete rows that never happened.

**Entry fields**

| Field | Example |
|-------|---------|
| Date | 2026-08-25 |
| Start | 09:30 |
| Stop | 12:15 |
| Hours | 2.75 *(optional — compute from start/stop, or round)* |
| Phase | Post-launch |
| What you did | Fixed www redirect; tested contact form on live site |
| Source | manual |

**Phases** *(pick one)*

- `Foundation` — initial site, admin, booking scaffold
- `Iteration` — features and refinements pre-launch
- `Launch prep` — content, audit, checklist work
- `Go-live sprint` — DNS, email, privacy, booking fixes
- `Post-launch` — hardening, newsletter, docs, client handoff
- `Other` — anything else

---

## Log

| Date | Start | Stop | Hours | Phase | What you did | Source |
|------|-------|------|-------|-------|--------------|--------|
| 2026-07-26 | 18:55 | 19:30 | 0.5 | Foundation | Scaffold baseline (Astro 6 + React 19) | git-estimate |
| 2026-07-29 | 15:26 | 21:30 | 6.2 | Foundation | Complete platform build + Vercel deploy triggers | git-estimate |
| 2026-07-30 | 04:13 | 14:00 | 10.0 | Foundation | Platform iteration and wiring | git-estimate |
| 2026-07-31 | 14:42 | 23:00 | 8.5 | Foundation | Heavy build day — admin, booking, content | git-estimate |
| 2026-08-02 | 15:04 | 23:30 | 8.8 | Iteration | Feature work and refinements | git-estimate |
| 2026-08-03 | 18:23 | 00:10 | 5.8 | Iteration | Feature work and refinements | git-estimate |
| 2026-08-04 | 00:36 | 10:30 | 10.0 | Iteration | Feature work | git-estimate |
| 2026-08-05 | 12:05 | 12:50 | 0.8 | Iteration | Light touch | git-estimate |
| 2026-08-11 | 04:02 | 14:00 | 10.0 | Launch prep | Continental content transformation + audit | git-estimate |
| 2026-08-16 | 20:47 | 21:15 | 0.5 | Launch prep | Light touch | git-estimate |
| 2026-08-20 | 23:27 | 23:55 | 0.6 | Launch prep | Light touch | git-estimate |
| 2026-08-21 | 00:03 | 10:00 | 10.0 | Go-live sprint | Launch batch — brand routing, privacy, platform links | git-estimate |
| 2026-08-22 | 06:56 | 17:00 | 10.0 | Go-live sprint | Launch, email, privacy plan; booking + contact fixes | git-estimate |
| 2026-08-23 | 13:48 | 16:30 | 2.7 | Go-live sprint | Post-launch polish | git-estimate |
| 2026-08-25 | 06:14 | 16:00 | 9.9 | Post-launch | Audit, fixes, Help Center, DNS, newsletter, docs | git-estimate |
| | | | | | | |
| | | | | | | |

*Add new rows above the blank template rows. Most recent first is fine if you prefer — just stay consistent.*

---

## Running totals

Update this section when you add **manual** rows or revise estimates.

| Metric | Value |
|--------|-------|
| **Logged hours (all rows below)** | **~95 h** *(git-estimate seed — revise as you confirm)* |
| Active days (rows with hours > 0) | 15 |
| Calendar span (first → last date) | 26 Jul – 25 Aug 2026 (~31 days, ~4.5 weeks) |
| Equivalent full-time weeks (÷ 40 h) | ~2.4 weeks |
| Equivalent 8 h days (÷ 8) | ~12 days |

### By phase *(git-estimate seed)*

| Phase | Hours | Days |
|-------|-------|------|
| Foundation | ~25.2 | 4 |
| Iteration | ~25.4 | 4 |
| Launch prep | ~11.1 | 3 |
| Go-live sprint | ~22.7 | 3 |
| Post-launch | ~9.9 | 1 |
| **Total** | **~94.3** | **15** |

---

## Not captured here (add manually if it matters)

- Planning and scoping **before** 26 Jul 2026
- Client / EA conversations about the platform
- Live-site testing that did not produce commits
- Waiting on DNS, Vercel, Supabase, Resend, Beehiiv verification
- Content or strategy work kept outside the repo (Google Docs, Gemini workshops)

---

## Quick-add template

Copy into the log table:

```text
| YYYY-MM-DD | HH:MM | HH:MM |  | Phase | What you did | manual |
```

---

*Last seed from git: 25 Aug 2026 · Repo: `profoundcreator/dr-akin-platform`*
