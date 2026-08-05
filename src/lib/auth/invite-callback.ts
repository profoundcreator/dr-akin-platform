import type { SupabaseClient } from "@supabase/supabase-js";

export type InviteCallbackType = "invite" | "recovery";

function readHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return raw ? new URLSearchParams(raw) : new URLSearchParams();
}

function readQueryParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function authParamsFromUrl(): URLSearchParams {
  const hash = readHashParams();
  if (
    hash.get("access_token") ||
    hash.get("token_hash") ||
    hash.get("type") === "invite" ||
    hash.get("type") === "recovery"
  ) {
    return hash;
  }
  return readQueryParams();
}

function normalizeFlowType(type: string | null): InviteCallbackType | null {
  if (type === "invite" || type === "recovery") return type;
  if (type === "signup") return "invite";
  return null;
}

export function parseAuthHashType(): InviteCallbackType | null {
  const params = authParamsFromUrl();
  const explicit = normalizeFlowType(params.get("type"));
  if (explicit) return explicit;

  if (params.get("access_token") || params.get("token_hash") || params.get("code")) {
    return "invite";
  }

  return null;
}

export function parseAuthCallbackError(): string | null {
  const query = readQueryParams();
  const error = query.get("error_description") ?? query.get("error");
  return error?.trim() || null;
}

export function parseAuthHashTokens(): {
  accessToken: string;
  refreshToken: string;
} | null {
  const params = authParamsFromUrl();
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
}

export function clearAuthHashFromUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.hash = "";

  for (const key of [
    "code",
    "token_hash",
    "type",
    "access_token",
    "refresh_token",
    "expires_in",
    "token_type",
    "error",
    "error_description",
    "error_code",
  ]) {
    url.searchParams.delete(key);
  }

  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

export type EstablishInviteSessionResult =
  | { ok: true; email: string; flowType: InviteCallbackType }
  | { ok: false; message: string };

/** Persist the Supabase session from an invite/recovery email link. */
export async function establishSessionFromAuthHash(
  supabase: SupabaseClient,
): Promise<EstablishInviteSessionResult> {
  const callbackError = parseAuthCallbackError();
  if (callbackError) {
    return {
      ok: false,
      message: `${callbackError} Ask your Super Admin to resend the invite.`,
    };
  }

  const flowType = parseAuthHashType();
  if (!flowType) {
    return {
      ok: false,
      message: "Invite link expired or invalid. Ask your Super Admin to resend the invite.",
    };
  }

  const params = authParamsFromUrl();
  const code = params.get("code") ?? readQueryParams().get("code");
  const tokenHash = params.get("token_hash");
  const tokens = parseAuthHashTokens();

  let sessionEmail: string | null = null;

  if (tokens) {
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    if (error || !data.session?.user.email) {
      return {
        ok: false,
        message:
          error?.message ??
          "Could not start your invite session. Ask your Super Admin to resend the invite.",
      };
    }
    sessionEmail = data.session.user.email;
  } else if (tokenHash) {
    const otpType = flowType === "recovery" ? "recovery" : "invite";
    const { data, error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (error || !data.session?.user.email) {
      return {
        ok: false,
        message:
          error?.message ??
          "Could not verify your invite link. Ask your Super Admin to resend the invite.",
      };
    }
    sessionEmail = data.session.user.email;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session?.user.email) {
      return {
        ok: false,
        message:
          error?.message ??
          "Could not verify your invite link. Ask your Super Admin to resend the invite.",
      };
    }
    sessionEmail = data.session.user.email;
  } else {
    return {
      ok: false,
      message: "Invite link expired or invalid. Ask your Super Admin to resend the invite.",
    };
  }

  clearAuthHashFromUrl();
  return { ok: true, email: sessionEmail, flowType };
}

export function isAdminInviteSetupPath(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname === "/admin/login";
}

export function hasInviteCallbackInUrl(): boolean {
  return parseAuthHashType() !== null || Boolean(parseAuthCallbackError());
}
