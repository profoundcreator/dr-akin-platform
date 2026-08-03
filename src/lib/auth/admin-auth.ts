import { getSupabaseClient, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { AdminProfile } from "@/lib/supabase/database.types";
import { logAuditEvent } from "@/lib/booking/api";
import {
  consumeAdminBootstrapUser,
  isInviteSetupActive,
  stashAdminBootstrapUser,
} from "@/lib/auth/admin-session-bootstrap";
import type { Session, User } from "@supabase/supabase-js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getSessionIssuedAtMs(session: Session): number {
  try {
    const segment = session.access_token.split(".")[1];
    if (!segment) return Date.now();
    const payload = JSON.parse(atob(segment)) as { iat?: number };
    if (typeof payload.iat === "number") return payload.iat * 1000;
  } catch {
    /* fall through */
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

async function fetchAdminProfileOnce(userId: string): Promise<{
  profile: AdminProfile | null;
  errorMessage: string | null;
}> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) {
    return { profile: null, errorMessage: "Supabase is not configured." };
  }

  // Ensure JWT is attached before RLS-protected query (avoids auth-header race).
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return {
      profile: null,
      errorMessage: `Could not verify your session (${userError.message}). Please sign in again.`,
    };
  }

  if (!userData.user) {
    return { profile: null, errorMessage: null };
  }

  if (userData.user.id !== userId) {
    return {
      profile: null,
      errorMessage: "Session user mismatch. Please sign in again.",
    };
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[admin-auth] admin_profiles lookup failed:", error.message);
    return {
      profile: null,
      errorMessage: `Could not load your admin profile (${error.message}). Ask a Super Admin to verify your admin_profiles row.`,
    };
  }

  if (!data) {
    return { profile: null, errorMessage: null };
  }

  return { profile: data as AdminProfile, errorMessage: null };
}

export async function fetchAdminProfile(userId: string): Promise<{
  profile: AdminProfile | null;
  errorMessage: string | null;
}> {
  const allowRetry = consumeAdminBootstrapUser(userId);
  const attempts = allowRetry ? 4 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const result = await fetchAdminProfileOnce(userId);
    if (result.profile || result.errorMessage) {
      return result;
    }
    if (attempt < attempts - 1) {
      await sleep(150 * (attempt + 1));
    }
  }

  return {
    profile: null,
    errorMessage:
      "This account is not authorized for admin access. Your Supabase auth user may be missing a matching admin_profiles row.",
  };
}

async function resolveAdminSession(
  session: Session,
  user: User,
): Promise<AdminSessionResult> {
  const lookup = await fetchAdminProfile(user.id);

  if (lookup.errorMessage) {
    return {
      ok: false,
      message: lookup.errorMessage,
      signOut: true,
    };
  }

  let profile = lookup.profile;

  if (!profile) {
    return {
      ok: false,
      message:
        "This account is not authorized for admin access. Ask a Super Admin to add your user to admin_profiles.",
      signOut: true,
    };
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

    if (isInviteSetupActive()) {
      return { ok: false, message: "Complete password setup.", signOut: false };
    }

    profile = await activateInvitedAdminIfReady(user, profile);
  }

  if (profile.account_state !== "active") {
    return {
      ok: false,
      message:
        "This account is not active yet. If you were invited, open the invite link from your email or ask a Super Admin to set account_state to active.",
      signOut: true,
    };
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
    if (resolved.signOut) {
      await supabase.auth.signOut();
    }
    throw new Error(resolved.message);
  }

  stashAdminBootstrapUser(data.user.id);

  await logAuditEvent("admin.sign_in.success", "admin_profile", resolved.profile.id, {
    email: resolved.profile.email,
  }).catch(() => {});

  return { user: data.user, session: data.session, profile: resolved.profile };
}

export async function signOutAdmin(profile: AdminProfile | null) {
  const supabase = getSupabaseClient();

  if (profile) {
    await logAuditEvent("admin.sign_out", "admin_profile", profile.id).catch(() => {});
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
): Promise<{ profile: AdminProfile | null; message: string | null; signOut: boolean }> {
  if (!session?.user) {
    return { profile: null, message: null, signOut: false };
  }

  const resolved = await resolveAdminSession(session, session.user);
  if (!resolved.ok) {
    return { profile: null, message: resolved.message, signOut: resolved.signOut };
  }

  return { profile: resolved.profile, message: null, signOut: false };
}
