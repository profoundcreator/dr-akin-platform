import { createAuthenticatedServerClient } from "../src/lib/supabase/authenticated-server-client";

const APPROVER_ROLES = new Set(["super_admin", "executive_assistant", "admin_manager"]);

const REBUILD_STARTED_MESSAGE =
  "Site rebuild started. Search engines and link previews will catch up in a few minutes.";

export default async function handler(
  req: { method?: string; headers: { authorization?: string } },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
  },
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    return res.status(503).json({
      error: "Deploy hook is not configured. Add VERCEL_DEPLOY_HOOK_URL in Vercel environment variables.",
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token." });
  }

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({ error: "Supabase is not configured on the server." });
  }

  const token = authHeader.slice("Bearer ".length);
  const supabase = createAuthenticatedServerClient(token);

  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured on the server." });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return res.status(401).json({ error: "Invalid session." });
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("role, account_state")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.account_state !== "active") {
    return res.status(403).json({ error: "Active admin access required." });
  }

  if (!APPROVER_ROLES.has(profile.role)) {
    return res.status(403).json({ error: "Only approvers can trigger a site rebuild." });
  }

  const hookResponse = await fetch(deployHookUrl, { method: "POST" });

  if (!hookResponse.ok) {
    return res.status(502).json({ error: "Vercel deploy hook failed." });
  }

  return res.status(200).json({
    message: REBUILD_STARTED_MESSAGE,
  });
}
