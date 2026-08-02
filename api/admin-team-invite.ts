import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type AdminRole =
  | "super_admin"
  | "technical_admin"
  | "admin_manager"
  | "executive_assistant"
  | "executive_reviewer"
  | "inbox_manager"
  | "resource_manager"
  | "read_only_auditor";

type AdminAccountState = "invited" | "active" | "suspended" | "revoked";

const PRIVILEGED_ROLES = new Set<AdminRole>(["super_admin", "technical_admin"]);

const OPERATIONAL_ROLES = new Set<AdminRole>([
  "admin_manager",
  "executive_assistant",
  "executive_reviewer",
  "inbox_manager",
  "resource_manager",
  "read_only_auditor",
]);

interface InviterProfile {
  id: string;
  role: AdminRole;
  account_state: AdminAccountState;
}

interface InviteRequestBody {
  email?: string;
  fullName?: string;
  role?: AdminRole;
  resend?: boolean;
}

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

function createAuthenticatedServerClient(accessToken: string): SupabaseClient | null {
  const supabaseUrl = readEnv("PUBLIC_SUPABASE_URL");
  const anonKey = readEnv("PUBLIC_SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey || !accessToken) return null;

  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

async function verifyInviter(token: string) {
  const supabaseAnon = createAuthenticatedServerClient(token);
  if (!supabaseAnon) {
    return { error: "Supabase is not configured on the server." as const };
  }

  const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
  if (userError || !userData.user) {
    return { error: "Invalid session." as const };
  }

  const { data: profile, error: profileError } = await supabaseAnon
    .from("admin_profiles")
    .select("id, role, account_state")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.account_state !== "active") {
    return { error: "Active admin access required." as const };
  }

  const inviter = profile as InviterProfile;
  const canInvite =
    PRIVILEGED_ROLES.has(inviter.role) || inviter.role === "admin_manager";

  if (!canInvite) {
    return { error: "You do not have permission to invite team members." as const };
  }

  return { inviter, inviterClient: supabaseAnon };
}

function canAssignRole(inviter: InviterProfile, role: AdminRole): boolean {
  if (PRIVILEGED_ROLES.has(inviter.role)) return true;
  if (inviter.role === "admin_manager") return OPERATIONAL_ROLES.has(role);
  return false;
}

function getInviteRedirectUrl(): string {
  const site = readEnv("PUBLIC_SITE_URL");
  if (site) return `${site.replace(/\/$/, "")}/admin/login`;

  const vercel = readEnv("VERCEL_URL");
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}/admin/login`;

  if (readEnv("VERCEL_ENV") === "production") {
    throw new Error(
      "PUBLIC_SITE_URL is not set in Vercel. Add it (e.g. https://dr-akin-platform.vercel.app) before sending team invites.",
    );
  }

  return "http://localhost:4321/admin/login";
}

async function findAuthUserByEmail(
  adminClient: SupabaseClient,
  email: string,
): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) return match;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

function isExistingAuthUserError(error: { message?: string; status?: number }): boolean {
  const message = (error.message ?? "").toLowerCase();
  return (
    error.status === 422 ||
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists")
  );
}

async function sendInviteEmail(
  adminClient: SupabaseClient,
  publicClient: SupabaseClient,
  email: string,
  fullName?: string,
): Promise<{ user: User; delivery: "invite" | "password_setup" }> {
  const redirectTo = getInviteRedirectUrl();
  const inviteOptions = {
    redirectTo,
    data: fullName ? { full_name: fullName } : undefined,
  };

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, inviteOptions);

  if (!error && data.user) {
    return { user: data.user, delivery: "invite" };
  }

  if (error && !isExistingAuthUserError(error)) {
    throw error;
  }

  // Password reset emails must use the anon key — service role returns "Invalid API key".
  const { error: resetError } = await publicClient.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (resetError) {
    throw resetError;
  }

  const existing = await findAuthUserByEmail(adminClient, email);
  if (!existing) {
    throw new Error("Invite email could not be sent.");
  }

  return { user: existing, delivery: "password_setup" };
}

function inviteDeliveryMessage(delivery: "invite" | "password_setup", resend: boolean): string {
  if (delivery === "password_setup") {
    return resend
      ? "Setup email resent. They can set their password from the link in their inbox."
      : "Invite sent. They will receive an email to set their password and sign in.";
  }

  return resend
    ? "Invite email resent. They can finish setup from their inbox."
    : "Invite sent. They will receive an email to set their password and sign in.";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Invite failed.";
}

function isInvalidApiKeyError(error: unknown): boolean {
  return errorMessage(error).toLowerCase().includes("invalid api key");
}

const SERVICE_ROLE_SETUP_ERROR =
  "Supabase service role key is invalid. In Vercel → Project → Settings → Environment Variables, set SUPABASE_SERVICE_ROLE_KEY to the service_role secret from Supabase → Settings → API (not the anon public key). Redeploy after saving.";

export async function POST(request: Request): Promise<Response> {
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = readEnv("PUBLIC_SUPABASE_URL");
  const anonKey = readEnv("PUBLIC_SUPABASE_ANON_KEY");

  if (!serviceRoleKey || !supabaseUrl) {
    return jsonResponse(503, {
      error:
        "Team invites are not configured yet. Add SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.",
    });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse(401, { error: "Missing authorization token." });
  }

  if (!anonKey) {
    return jsonResponse(503, { error: "Supabase is not configured on the server." });
  }

  let body: InviteRequestBody;
  try {
    body = (await request.json()) as InviteRequestBody;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." });
  }

  const token = authHeader.slice("Bearer ".length);
  const verified = await verifyInviter(token);

  if ("error" in verified) {
    return jsonResponse(403, { error: verified.error });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const fullName = body.fullName?.trim() ?? "";
  const role = body.role;
  const resend = Boolean(body.resend);

  if (!email || !fullName || !role) {
    return jsonResponse(400, { error: "Email, full name, and role are required." });
  }

  if (!canAssignRole(verified.inviter, role)) {
    return jsonResponse(403, { error: "You cannot assign that role." });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const publicClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { error: serviceProbeError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    if (serviceProbeError) {
      if (isInvalidApiKeyError(serviceProbeError)) {
        return jsonResponse(503, { error: SERVICE_ROLE_SETUP_ERROR });
      }
      throw serviceProbeError;
    }

    let authUser = await findAuthUserByEmail(adminClient, email);

    const { data: existingProfile } = authUser
      ? await adminClient
          .from("admin_profiles")
          .select("id, account_state")
          .eq("id", authUser.id)
          .maybeSingle()
      : { data: null };

    if (existingProfile && !resend) {
      return jsonResponse(409, {
        error:
          "This person already has a team profile. Update their role from the team list instead.",
      });
    }

    const shouldSendInviteEmail = resend || !authUser || !existingProfile;
    let delivery: "invite" | "password_setup" = "invite";

    if (!authUser) {
      const sent = await sendInviteEmail(adminClient, publicClient, email, fullName);
      authUser = sent.user;
      delivery = sent.delivery;
    } else if (shouldSendInviteEmail) {
      const sent = await sendInviteEmail(adminClient, publicClient, email, fullName);
      delivery = sent.delivery;
    }

    if (!authUser) {
      return jsonResponse(500, { error: "Could not create or find the invited user." });
    }

    if (existingProfile && resend) {
      await verified.inviterClient.rpc("log_audit_event", {
        p_event_type: "team_member_invite_resent",
        p_target_type: "admin_profile",
        p_target_id: existingProfile.id,
        p_summary: { email, role, invitedBy: verified.inviter.id, delivery },
      });

      return jsonResponse(200, {
        message: inviteDeliveryMessage(delivery, true),
        memberId: existingProfile.id,
      });
    }

    const { error: insertError } = await adminClient.from("admin_profiles").insert({
      id: authUser.id,
      email,
      full_name: fullName,
      role,
      account_state: "invited",
      invited_by: verified.inviter.id,
      invited_at: new Date().toISOString(),
    });

    if (insertError) {
      const message = insertError.message.includes("admin_profiles_email_key")
        ? "This email is already on the team list. Update their role from the team list instead."
        : insertError.message;
      return jsonResponse(400, { error: message });
    }

    await verified.inviterClient.rpc("log_audit_event", {
      p_event_type: "team_member_invited",
      p_target_type: "admin_profile",
      p_target_id: authUser.id,
      p_summary: { email, role, invitedBy: verified.inviter.id },
    });

    return jsonResponse(200, {
      message: inviteDeliveryMessage(delivery, false),
      memberId: authUser.id,
    });
  } catch (error) {
    if (isInvalidApiKeyError(error)) {
      return jsonResponse(503, { error: SERVICE_ROLE_SETUP_ERROR });
    }
    return jsonResponse(500, { error: errorMessage(error) });
  }
}
