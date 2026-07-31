import { createAuthenticatedServerClient } from "./lib/authenticated-server-client.ts";

const APPROVER_ROLES = new Set(["super_admin", "executive_assistant", "admin_manager"]);

const REBUILD_STARTED_MESSAGE =
  "Site rebuild started. Search engines and link previews will catch up in a few minutes.";

function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

async function handleRebuild(request: Request): Promise<Response> {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    return jsonResponse(503, {
      error:
        "Deploy hook is not configured. Add VERCEL_DEPLOY_HOOK_URL in Vercel environment variables.",
    });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse(401, { error: "Missing authorization token." });
  }

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(503, { error: "Supabase is not configured on the server." });
  }

  const token = authHeader.slice("Bearer ".length);
  const supabase = createAuthenticatedServerClient(token);

  if (!supabase) {
    return jsonResponse(503, { error: "Supabase is not configured on the server." });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return jsonResponse(401, { error: "Invalid session." });
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("role, account_state")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.account_state !== "active") {
    return jsonResponse(403, { error: "Active admin access required." });
  }

  if (!APPROVER_ROLES.has(profile.role)) {
    return jsonResponse(403, { error: "Only approvers can trigger a site rebuild." });
  }

  const hookResponse = await fetch(deployHookUrl, { method: "POST" });

  if (!hookResponse.ok) {
    return jsonResponse(502, { error: "Vercel deploy hook failed." });
  }

  return jsonResponse(200, {
    message: REBUILD_STARTED_MESSAGE,
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed." });
    }
    return handleRebuild(request);
  },
};
