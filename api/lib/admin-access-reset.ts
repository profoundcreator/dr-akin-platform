import { randomBytes } from "node:crypto";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { siteUrl } from "./env";

export const ADMIN_ACCESS_ROLES = [
  "super_admin",
  "technical_admin",
  "admin_manager",
  "executive_assistant",
  "executive_reviewer",
  "inbox_manager",
  "resource_manager",
  "read_only_auditor",
] as const;

export type AdminAccessRole = (typeof ADMIN_ACCESS_ROLES)[number];

export interface AdminAccessResetInput {
  email: string;
  fullName?: string;
  role?: AdminAccessRole;
}

export interface AdminAccessResetResult {
  loginUrl: string;
  email: string;
  password: string;
  role: AdminAccessRole;
  state: string;
  userId: string;
  createdAuthUser: boolean;
}

function generateTempPassword(): string {
  const word = randomBytes(9).toString("base64url");
  return `Akin-${word}!`;
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

export async function resetAdminAccess(
  adminClient: SupabaseClient,
  input: AdminAccessResetInput,
): Promise<AdminAccessResetResult> {
  const email = input.email.trim().toLowerCase();
  const fullName = (input.fullName ?? "Executive Assistant").trim();
  const role = input.role ?? "executive_assistant";

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!ADMIN_ACCESS_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

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
    role: (finalProfile?.role ?? role) as AdminAccessRole,
    state: finalProfile?.account_state ?? "active",
    userId: authUser.id,
    createdAuthUser,
  };
}
