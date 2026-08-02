import { getSupabaseClient, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { AdminProfile } from "@/lib/supabase/database.types";
import { logAuditEvent } from "@/lib/booking/api";
import type { Session, User } from "@supabase/supabase-js";

function getSessionIssuedAtMs(session: Session): number {
  try {
    const segment = session.access_token.split(".")[1];
    if (!segment) return Date.now();
    const payload = JSON.parse(atob(segment)) as { iat?: number };
    if (typeof payload.iat === "number") return payload.iat * 1000;
  } catch {
    // Fall through to now — treat as fresh if JWT cannot be decoded.
  }
  return Date.now();
}

function isSessionRevoked(session: Session, sessionRevokedAt: string | null): boolean {
  if (!sessionRevokedAt) return false;
  return getSessionIssuedAtMs(session) <= new Date(sessionRevokedAt).getTime();
}

function isEmailConfirmed(user: User): boolean {
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

async function activateInvitedAdminIfReady(
  user: User,
  profile: AdminProfile,
): Promise<AdminProfile> {
  if (profile.account_state !== "invited" || !isEmailConfirmed(user)) {
    return profile;
  }

  const supabase = tryGetSupabaseClient();
  if (!supabase) return profile;

  const { data, error } = await supabase.rpc("activate_invited_admin");
  if (error || !data) return profile;
  return data as AdminProfile;
}

type AdminSessionResult =
  | { ok: true; profile: AdminProfile }
  | { ok: false; message: string; signOut: boolean };

async function resolveAdminSession(
  session: Session,
  user: User,
): Promise<AdminSessionResult> {
  let profile = await fetchAdminProfile(user.id);

  if (!profile) {
    return { ok: false, message: "This account is not authorized for admin access.", signOut: true };
  }

  if (profile.account_state === "suspended") {
    return {
      ok: false,
      message: "This account has been suspended. Contact a Super Admin.",
      signOut: true,
    };
  }

  if (profile.account_state === "revoked") {
    return { ok: false, message: "This account has been revoked.", signOut: true };
  }

  if (profile.account_state === "invited") {
    if (!isEmailConfirmed(user)) {
      return {
        ok: false,
        message: "Please confirm your email from the invite link before signing in.",
        signOut: true,
      };
    }

    // Keep the auth session alive on /admin/login while the invitee sets a password.
    if (typeof window !== "undefined" && window.location.pathname === "/admin/login") {
      return { ok: false, message: "Complete password setup.", signOut: false };
    }

    profile = await activateInvitedAdminIfReady(user, profile);
  }

  if (profile.account_state !== "active") {
    return { ok: false, message: "This account is not active yet.", signOut: true };
  }

  if (isSessionRevoked(session, profile.session_revoked_at)) {
    return {
      ok: false,
      message: "Your session has been revoked. Please sign in again.",
      signOut: true,
    };
  }

  return { ok: true, profile };
}

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
  if (!data.user || !data.session) throw new Error("Sign in failed");

  const resolved = await resolveAdminSession(data.session, data.user);
  if (!resolved.ok) {
    await supabase.auth.signOut();
    throw new Error(resolved.message);
  }

  await logAuditEvent("admin.sign_in.success", "admin_profile", resolved.profile.id, {
    email: resolved.profile.email,
  }).catch(() => {});

  return { user: data.user, session: data.session, profile: resolved.profile };
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
  session: Session;
  profile: AdminProfile;
} | null> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  const resolved = await resolveAdminSession(data.session, data.session.user);
  if (!resolved.ok) {
    if (resolved.signOut) await supabase.auth.signOut();
    return null;
  }

  return { session: data.session, profile: resolved.profile };
}

/** Validates an existing auth session for admin routes and auth state listeners. */
export async function resolveAdminProfileForSession(
  session: Session | null,
): Promise<AdminProfile | null> {
  if (!session?.user) return null;

  const resolved = await resolveAdminSession(session, session.user);
  if (!resolved.ok) {
    const supabase = tryGetSupabaseClient();
    if (resolved.signOut && supabase) await supabase.auth.signOut();
    return null;
  }

  return resolved.profile;
}
