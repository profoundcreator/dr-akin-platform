import { getSupabaseClient, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { AdminProfile } from "@/lib/supabase/database.types";
import { logAuditEvent } from "@/lib/booking/api";

export async function fetchAdminProfile(userId: string): Promise<AdminProfile | null> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminProfile;
}

export async function signInAdmin(email: string, password: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Sign in failed");

  let profile = await fetchAdminProfile(data.user.id);

  if (!profile) {
    await supabase.auth.signOut();
    throw new Error("This account is not authorized for admin access.");
  }

  if (profile.account_state === "suspended") {
    await supabase.auth.signOut();
    throw new Error("This account has been suspended. Contact a Super Admin.");
  }

  if (profile.account_state === "revoked") {
    await supabase.auth.signOut();
    throw new Error("This account has been revoked.");
  }

  if (profile.account_state === "invited") {
    const emailConfirmed = Boolean(data.user.email_confirmed_at ?? data.user.confirmed_at);
    if (emailConfirmed) {
      const supabase = tryGetSupabaseClient();
      if (supabase) {
        await supabase
          .from("admin_profiles")
          .update({ account_state: "active" })
          .eq("id", profile.id);
      }
      profile = { ...profile, account_state: "active" };
    } else {
      await supabase.auth.signOut();
      throw new Error("Please confirm your email from the invite link before signing in.");
    }
  }

  if (profile.session_revoked_at) {
    const revokedAt = new Date(profile.session_revoked_at).getTime();
    const sessionAt = data.session?.expires_at
      ? data.session.expires_at * 1000
      : Date.now();
    if (sessionAt <= revokedAt) {
      await supabase.auth.signOut();
      throw new Error("Your session has been revoked. Please sign in again.");
    }
  }

  await logAuditEvent("admin.sign_in.success", "admin_profile", profile.id, {
    email: profile.email,
  }).catch(() => {});

  return { user: data.user, session: data.session, profile };
}

export async function signOutAdmin(profile: AdminProfile | null) {
  const supabase = getSupabaseClient();

  if (profile) {
    await logAuditEvent("admin.sign_out", "admin_profile", profile.id).catch(
      () => {},
    );
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentAdmin(): Promise<{
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  profile: AdminProfile;
} | null> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  const profile = await fetchAdminProfile(data.session.user.id);
  if (!profile || profile.account_state !== "active") return null;

  return { session: data.session, profile };
}
