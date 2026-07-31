let warnedMissingEnv = false;

export function isSupabaseBuildEnvConfigured(): boolean {
  const url = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && key);
}

/** Log once per build when CMS content cannot be fetched at compile time. */
export function warnIfSupabaseBuildEnvMissing(context: string): void {
  if (isSupabaseBuildEnvConfigured() || warnedMissingEnv) return;

  warnedMissingEnv = true;
  console.warn(
    `\n[dr-akin-platform] WARNING: Supabase env vars missing during ${context}.` +
      "\n  Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in Vercel before deploy." +
      "\n  Without them, static pages use seed content only and hide/restore settings are ignored.\n",
  );
}
