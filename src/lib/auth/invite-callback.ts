import type { SupabaseClient } from "@supabase/supabase-js";

export type InviteCallbackType = "invite" | "recovery";

export function parseAuthHashType(): InviteCallbackType | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const type = params.get("type");
  if (type === "invite" || type === "recovery") return type;
  if (params.get("access_token")) return "invite";
  return null;
}

export function parseAuthHashTokens(): {
  accessToken: string;
  refreshToken: string;
} | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
}

export function clearAuthHashFromUrl(): void {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
}

export type EstablishInviteSessionResult =
  | { ok: true; email: string; flowType: InviteCallbackType }
  | { ok: false; message: string };

/** Explicitly persist the Supabase session from an invite/recovery email link. */
export async function establishSessionFromAuthHash(
  supabase: SupabaseClient,
): Promise<EstablishInviteSessionResult> {
  const flowType = parseAuthHashType();
  const tokens = parseAuthHashTokens();

  if (!flowType || !tokens) {
    return { ok: false, message: "Invite link expired or invalid. Ask your admin to resend the invite." };
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  if (error || !data.session?.user.email) {
    return {
      ok: false,
      message: error?.message ?? "Could not start your invite session. Ask your admin to resend the invite.",
    };
  }

  clearAuthHashFromUrl();
  return { ok: true, email: data.session.user.email, flowType };
}

export function isAdminInviteSetupPath(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname === "/admin/login";
}
