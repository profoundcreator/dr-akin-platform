import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createAuthenticatedServerClient } from "./lib/authenticated-server-client.ts";
import type { AdminAccountState, AdminRole } from "./lib/admin-types.ts";

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

function json(
  res: { status: (code: number) => { json: (body: unknown) => void } },
  status: number,
  body: unknown,
) {
  return res.status(status).json(body);
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

function getSiteUrl(): string {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:4321";
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

/** Sends a new-user invite, or a password-setup email when Auth already has this address. */
async function sendInviteEmail(
  adminClient: SupabaseClient,
  email: string,
  fullName?: string,
): Promise<{ user: User; delivery: "invite" | "password_setup" }> {
  const redirectTo = `${getSiteUrl()}/admin/login`;
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

  // Auth user already exists (common after a partial invite) — resend a setup link instead.
  const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
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

function parseRequestBody(body: unknown): InviteRequestBody {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as InviteRequestBody;
    } catch {
      return {};
    }
  }
  return (body ?? {}) as InviteRequestBody;
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

export default async function handler(
  req: { method?: string; headers: { authorization?: string }; body?: InviteRequestBody },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? "";

  if (!serviceRoleKey || !supabaseUrl) {
    return json(res, 503, {
      error:
        "Team invites are not configured yet. Add SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.",
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return json(res, 401, { error: "Missing authorization token." });
  }

  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!anonKey) {
    return json(res, 503, { error: "Supabase is not configured on the server." });
  }

  const token = authHeader.slice("Bearer ".length);
  const verified = await verifyInviter(token);

  if ("error" in verified) {
    return json(res, 403, { error: verified.error });
  }

  const body = parseRequestBody(req.body);
  const email = body.email?.trim().toLowerCase() ?? "";
  const fullName = body.fullName?.trim() ?? "";
  const role = body.role;
  const resend = Boolean(body.resend);

  if (!email || !fullName || !role) {
    return json(res, 400, { error: "Email, full name, and role are required." });
  }

  if (!canAssignRole(verified.inviter, role)) {
    return json(res, 403, { error: "You cannot assign that role." });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    let authUser = await findAuthUserByEmail(adminClient, email);

    const { data: existingProfile } = authUser
      ? await adminClient
          .from("admin_profiles")
          .select("id, account_state")
          .eq("id", authUser.id)
          .maybeSingle()
      : { data: null };

    if (existingProfile && !resend) {
      return json(res, 409, {
        error: "This person already has a team profile. Update their role from the team list instead.",
      });
    }

    const shouldSendInviteEmail = resend || !authUser || !existingProfile;
    let delivery: "invite" | "password_setup" = "invite";

    if (!authUser) {
      const sent = await sendInviteEmail(adminClient, email, fullName);
      authUser = sent.user;
      delivery = sent.delivery;
    } else if (shouldSendInviteEmail) {
      const sent = await sendInviteEmail(adminClient, email, fullName);
      delivery = sent.delivery;
    }

    if (!authUser) {
      return json(res, 500, { error: "Could not create or find the invited user." });
    }

    if (existingProfile && resend) {
      await verified.inviterClient.rpc("log_audit_event", {
        p_event_type: "team_member_invite_resent",
        p_target_type: "admin_profile",
        p_target_id: existingProfile.id,
        p_summary: { email, role, invitedBy: verified.inviter.id, delivery },
      });

      return json(res, 200, {
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
      return json(res, 400, { error: message });
    }

    await verified.inviterClient.rpc("log_audit_event", {
      p_event_type: "team_member_invited",
      p_target_type: "admin_profile",
      p_target_id: authUser.id,
      p_summary: { email, role, invitedBy: verified.inviter.id },
    });

    return json(res, 200, {
      message: inviteDeliveryMessage(delivery, false),
      memberId: authUser.id,
    });
  } catch (error) {
    return json(res, 500, { error: errorMessage(error) });
  }
}
