import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AdminAccountState, AdminRole } from "../src/lib/supabase/database.types";

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

async function verifyInviter(token: string, supabaseAnon: SupabaseClient) {
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

  return { inviter };
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
  const anonClient = createClient(supabaseUrl, anonKey);
  const verified = await verifyInviter(token, anonClient);

  if ("error" in verified) {
    return json(res, 403, { error: verified.error });
  }

  const email = req.body?.email?.trim().toLowerCase() ?? "";
  const fullName = req.body?.fullName?.trim() ?? "";
  const role = req.body?.role;
  const resend = Boolean(req.body?.resend);

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

    if (!authUser) {
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${getSiteUrl()}/admin/login`,
        data: { full_name: fullName },
      });

      if (error) {
        return json(res, 400, { error: error.message });
      }

      authUser = data.user;
    } else if (resend) {
      const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${getSiteUrl()}/admin/login`,
      });

      if (error) {
        return json(res, 400, { error: error.message });
      }
    }

    if (!authUser) {
      return json(res, 500, { error: "Could not create or find the invited user." });
    }

    const { data: existingProfile } = await adminClient
      .from("admin_profiles")
      .select("id, account_state")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existingProfile) {
      if (resend) {
        return json(res, 200, {
          message: "Invite email resent. They can finish setup from their inbox.",
          memberId: existingProfile.id,
        });
      }

      return json(res, 409, {
        error: "This person already has a team profile. Update their role from the team list instead.",
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
      return json(res, 400, { error: insertError.message });
    }

    await adminClient.rpc("log_audit_event", {
      p_event_type: "team_member_invited",
      p_target_type: "admin_profile",
      p_target_id: authUser.id,
      p_summary: { email, role, invitedBy: verified.inviter.id },
    });

    return json(res, 200, {
      message: resend
        ? "Invite email resent."
        : "Invite sent. They will receive an email to set their password and sign in.",
      memberId: authUser.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invite failed.";
    return json(res, 500, { error: message });
  }
}
