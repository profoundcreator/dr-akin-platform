# AGENTS.md

## Cursor Cloud specific instructions

This is `dr-akin-platform` — an Astro 6 (static output) marketing + operations site with React 19 islands, a Supabase backend, and a handful of Vercel serverless functions under `api/`. Package manager is npm (`package-lock.json`); Node 22 is used.

### Demo mode (important)
The app is designed to run with **no backend configured**. When `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` are unset, `src/lib/supabase/client.ts` (`isSupabaseConfigured`) puts the whole app into **demo mode**: pages render with mock data and forms return mock results (e.g. the booking form yields a `DAA-####` reference and shows a "Running in local demo mode" notice). This is the default state in a fresh cloud VM — you can develop and demo the UI end-to-end without any secrets. To exercise real persistence/auth, copy `.env.example` to `.env` and supply Supabase (and optionally Resend) values; see `supabase/README.md`.

### Services and how to run them
- **Astro dev server** — `npm run dev` (serves everything at `http://localhost:4321`). This is the only process needed for UI/content/booking-flow work. Do NOT put it in the update script; start it on demand (a tmux session works well).
- **Vercel serverless functions** (`api/*.ts`: notifications, team invites, organizer downloads, rebuild trigger, health) live **outside** `src/pages`, so `npm run dev` does NOT serve them. Full end-to-end of email/invites/downloads requires `vercel dev` plus configured Supabase + Resend env vars. Client forms still persist to Supabase without these functions (only email notifications are skipped).

### Build / lint / test
- **Build:** `npm run build` (static build; works in demo mode).
- **Lint:** there is no `lint` script and no ESLint config. Do not invent one.
- **Typecheck:** `npx tsc --noEmit` currently reports pre-existing errors (mostly Supabase generated-types `never` quirks in `src/lib/**`). These do NOT block `npm run build` because Astro/Vite transpiles with esbuild (no type-check). Treat these as pre-existing; don't "fix" them as part of unrelated work.
- **Tests:** there is no full test framework. `npm run verify:booking-tracker` is a self-contained unit test (no external deps) and is safe to run. The other `verify:*` / `setup:*` / `smoke:*` scripts in `scripts/` are operational helpers that require live Supabase/Vercel credentials.

### Deployment note
Deployment target is Vercel (`vercel.json`). `scripts/check-vercel-function-count.mjs` guards the 12-function Hobby-plan limit; shared server code lives in `server/lib/` (not `api/`) so it doesn't count as a function.
