import { readEnv } from "./lib/env";
import { resetAdminAccess, type AdminAccessRole } from "./lib/admin-access-reset";
import { hasValidStatusProbeKey } from "./lib/request-guard";
import { createServiceSupabaseClient } from "./lib/supabase-service";

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
