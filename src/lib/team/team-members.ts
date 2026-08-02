import { formatSchemaSetupError } from "@/lib/site-settings/schema-support";
import { getSupabaseClient, isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { AdminAccountState, AdminProfile, AdminRole } from "@/lib/supabase/database.types";

export interface TeamMember extends AdminProfile {
  is_founder: boolean;
}

export interface TeamMemberUpdateInput {
  role?: AdminRole;
  accountState?: AdminAccountState;
  fullName?: string;
}

export async function isTeamSchemaReady(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("admin_profiles").select("is_founder").limit(1);
  return !error;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return (data ?? []) as TeamMember[];
}

export async function updateTeamMember(
  memberId: string,
  input: TeamMemberUpdateInput,
): Promise<TeamMember> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("update_admin_team_member", {
    p_target_id: memberId,
    p_role: input.role ?? undefined,
    p_account_state: input.accountState ?? undefined,
    p_full_name: input.fullName ?? undefined,
  });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return data as TeamMember;
}

export async function markTeamMemberAsFounder(memberId: string): Promise<TeamMember> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("mark_admin_as_founder", {
    p_target_id: memberId,
  });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return data as TeamMember;
}

export async function inviteTeamMember(input: {
  email: string;
  fullName: string;
  role: AdminRole;
  resend?: boolean;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, message: "You must be signed in to invite team members." };
  }

  let response: Response;
  try {
    response = await fetch("/api/admin-team-invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        resend: input.resend ?? false,
      }),
    });
  } catch {
    return {
      ok: false,
      message: "Could not reach the invite service. Check your connection and try again.",
    };
  }

  const rawBody = await response.text();
  let payload: { message?: string; error?: string } = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as { message?: string; error?: string };
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const serverMessage = payload.error ?? payload.message;
    if (serverMessage) {
      return { ok: false, message: serverMessage };
    }

    if (response.status === 404) {
      return {
        ok: false,
        message: "Invite service is unavailable. The site may still be deploying — try again shortly.",
      };
    }

    if (response.status === 429) {
      return {
        ok: false,
        message:
          payload.error ??
          "Too many invite emails sent recently. Wait about an hour before trying again.",
      };
    }

    if (response.status >= 500) {
      return {
        ok: false,
        message:
          "Invite service error on the server. If this keeps happening, confirm SUPABASE_SERVICE_ROLE_KEY is set in Vercel.",
      };
    }

    return { ok: false, message: `Invite failed (${response.status}).` };
  }

  return {
    ok: true,
    message: payload.message ?? "Invite sent.",
  };
}
