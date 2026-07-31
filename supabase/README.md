# Supabase Setup — Dr. Akin Platform

Configure authentication, persistent storage, and Row Level Security per `operations-scope.md`.

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Copy your **Project URL** and **anon public key** from **Settings → API**.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.

## 3. Run database migrations

In the Supabase **SQL Editor**, run in order:

1. `migrations/001_initial_schema.sql`
2. `migrations/002_rls_policies.sql` (or `002a`, `002b`, `002c` if split)
3. `migrations/005_featured_podcast_episodes.sql`
4. `migrations/006_events.sql`
5. `migrations/007_site_settings.sql`
6. `migrations/008_site_settings_insert_policy.sql`
7. `migrations/009_library_books.sql`
8. `migrations/010_insights_articles.sql`
9. `migrations/011_work_orgs.sql`
10. `migrations/012_team_admin.sql`

## 4. Configure Auth

In **Authentication → Providers → Email**:

- Disable **Enable sign ups**
- Enable **Confirm email**

## 5. Create the Super Admin

1. Add user in **Authentication → Users**
2. Run:

```sql
INSERT INTO admin_profiles (id, email, full_name, role, account_state, invited_at)
VALUES (
  '<auth-user-uuid>',
  'admin@yourdomain.com',
  'Dr. Akin Akinpelu',
  'super_admin',
  'active',
  now()
);
```

Optionally set `is_founder = true` on the primary Super Admin (see `seed-admin.sql`).

## 6. Team invites (optional)

1. Add `SUPABASE_SERVICE_ROLE_KEY` and `PUBLIC_SITE_URL` in Vercel environment variables
2. Open **Admin → Team** to invite colleagues by email

## 7. Verify

```bash
npm run verify:supabase   # checks .env vars are set
npm run dev
```

- Submit booking at `/book-dr-akin`
- Sign in at `/admin/login`
- Admin dashboard loads at `/admin/login` (demo mode if `.env` is missing)
- **Team** appears in the sidebar for Super Admin, Technical Admin, and Admin Manager

## 8. Deploy to Vercel

1. Connect this repo to [Vercel](https://vercel.com)
2. Set environment variables: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (for Team invites), `VERCEL_DEPLOY_HOOK_URL` (optional — triggers SEO rebuild when events, books, insights, or work orgs are published)
3. Deploy — `vercel.json` includes the booking tracker rewrite
