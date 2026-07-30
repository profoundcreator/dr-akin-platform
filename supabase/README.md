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

## 6. Verify

```bash
npm run verify:supabase   # checks .env vars are set
npm run dev
```

- Submit booking at `/book-dr-akin`
- Sign in at `/admin/login`
- Admin dashboard shows **Supabase Connected** badge (not demo mode)
- Track at `/booking/DAA-XXXX?token=...`

Without `.env`, the app uses localStorage demo mode with 5 sample requests.

## 7. Deploy to Vercel

1. Connect this repo to [Vercel](https://vercel.com)
2. Set environment variables: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
3. Deploy — `vercel.json` includes the booking tracker rewrite
