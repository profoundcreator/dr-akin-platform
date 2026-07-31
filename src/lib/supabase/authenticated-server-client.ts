import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Supabase client that forwards a user access token for RLS-protected queries. */
export function createAuthenticatedServerClient(
  accessToken: string,
): SupabaseClient | null {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !anonKey || !accessToken) return null;

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
