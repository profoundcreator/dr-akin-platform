import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readEnv } from "./env";

export function createServiceSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = readEnv("PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
