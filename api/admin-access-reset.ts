import type { SupabaseClient, User } from "@supabase/supabase-js";
import { readEnv, siteUrl } from "./_lib/env";
import { hasValidStatusProbeKey } from "./_lib/request-guard";
import { createServiceSupabaseClient } from "./_lib/supabase-service";

type AdminAccessRole =
  | "super_admin"
  | "technical_admin"
  | "admin_manager"
  | "executive_assistant"
  | "executive_reviewer"
  | "inbox_manager"
  | "resource_manager"
  | "read_only_auditor";

interface ResetRequestBody {
  email?: string;
  fullName?: string;
  role?: AdminAccessRole;
}

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function readResetKey(): string {
  return readEnv("ADMIN_ACCESS_RESET_KEY") || readEnv("NOTIFICATIONS_STATUS_KEY");
}

function isInvalidApiKeyError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("invalid api key");
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateTempPassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return `Akin-${bytesToBase64Url(bytes)}!`;
}

async function findAuthUserByEmail(
  adminClient: SupabaseClient,
  targetEmail: string,
): Promise<User | null> {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) return match;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

async function resetAdminAccess(
  adminClient: SupabaseClient,
  input: { email: string; fullName?: string; role?: AdminAccessRole },
) {
  const email = input.email.trim().toLowerCase();
  const fullName = (input.fullName ?? "Executive Assistant").trim();
  const role = input.role ?? "executive_assistant";

  if (!email) throw new Error("Email is required.");

  const tempPassword = generateTempPassword();
  const loginUrl = `${siteUrl()}/admin/login`;

  let authUser = await findAuthUserByEmail(adminClient, email);
  let createdAuthUser = false;

  if (!authUser) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });
    if (error) throw error;
    authUser = data.user;
    createdAuthUser = true;
  } else {
    const { data, error } = await adminClient.auth.admin.updateUserById(authUser.id, {
      password: tempPassword,
      email_confirm: true,
    });
    if (error) throw error;
    authUser = data.user;
  }

  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("id, email, full_name, role, account_state, session_revoked_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    const { data: inviter } = await adminClient
      .from("admin_profiles")
      .select("id")
      .eq("role", "super_admin")
      .eq("account_state", "active")
      .limit(1)
      .maybeSingle();

    const { error: insertError } = await adminClient.from("admin_profiles").insert({
      id: authUser.id,
      email,
      full_name: fullName,
      role,
      account_state: "active",
      invited_by: inviter?.id ?? null,
      invited_at: new Date().toISOString(),
      session_revoked_at: null,
    });
    if (insertError) throw insertError;
  } else {
    const { error: updateError } = await adminClient
      .from("admin_profiles")
      .update({
        email,
        full_name: profile.full_name || fullName,
        role: profile.role || role,
        account_state: "active",
        session_revoked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id);
    if (updateError) throw updateError;
  }

  const { data: finalProfile, error: finalError } = await adminClient
    .from("admin_profiles")
    .select("role, account_state")
    .eq("id", authUser.id)
    .single();

  if (finalError) throw finalError;

  return {
    loginUrl,
    email,
    password: tempPassword,
    role: finalProfile?.role ?? role,
    state: finalProfile?.account_state ?? "active",
    createdAuthUser,
  };
}

/**
 * Set a temporary admin password directly (no email).
 * Protected by ADMIN_ACCESS_RESET_KEY or NOTIFICATIONS_STATUS_KEY.
 *
 * POST /api/admin-access-reset?key=…
 * Body: { "email": "ea@theakinakinpelu.org", "fullName": "Executive Assistant" }
 */
export async function POST(request: Request): Promise<Response> {
  const resetKey = readResetKey();
  if (!resetKey || !hasValidStatusProbeKey(request, resetKey)) {
    return json(404, { error: "Not found." });
  }

  const adminClient = createServiceSupabaseClient();
  if (!adminClient) {
    return json(503, {
      error:
        "Supabase service role is not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel and redeploy.",
    });
  }

  let body: ResetRequestBody;
  try {
    body = (await request.json()) as ResetRequestBody;
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!email) {
    return json(400, { error: "Email is required." });
  }

  try {
    const { error: probeError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (probeError) {
      if (isInvalidApiKeyError(probeError)) {
        return json(503, {
          error:
            "SUPABASE_SERVICE_ROLE_KEY is invalid. Use the service_role secret from Supabase → Settings → API.",
        });
      }
      throw probeError;
    }

    const result = await resetAdminAccess(adminClient, {
      email,
      fullName: body.fullName,
      role: body.role,
    });

    return json(200, {
      ok: true,
      loginUrl: result.loginUrl,
      email: result.email,
      password: result.password,
      role: result.role,
      state: result.state,
      createdAuthUser: result.createdAuthUser,
      message:
        "Temporary password set. Share it securely with the team member. No email was sent.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin access reset failed.";
    return json(500, { error: message });
  }
}

export async function GET(): Promise<Response> {
  return json(405, { error: "Use POST with JSON body." });
}
