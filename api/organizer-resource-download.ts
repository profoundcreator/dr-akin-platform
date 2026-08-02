import { createClient } from "@supabase/supabase-js";

const MIGRATION_ERROR =
  "Organizer resources are not available yet. Apply Supabase migration 018_organizer_resources.sql and refresh the Supabase schema cache.";

interface DownloadBody {
  reference?: string;
  accessToken?: string;
  resourceId?: string;
}

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function isMissingMigration(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("schema cache") ||
    lower.includes("does not exist") ||
    lower.includes("could not find the function") ||
    lower.includes("42p01") ||
    lower.includes("pgrst202") ||
    lower.includes("pgrst205")
  );
}

export async function POST(request: Request): Promise<Response> {
  const supabaseUrl = env("PUBLIC_SUPABASE_URL");
  const anonKey = env("PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(503, {
      error:
        "Secure organizer downloads are not configured. Set the Supabase URL, anon key, and service role key in Vercel.",
    });
  }

  let body: DownloadBody;
  try {
    body = (await request.json()) as DownloadBody;
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  const reference = body.reference?.trim() ?? "";
  const accessToken = body.accessToken?.trim() ?? "";
  const resourceId = body.resourceId?.trim() ?? "";
  if (!reference || accessToken.length < 32 || !/^[0-9a-f-]{36}$/i.test(resourceId)) {
    return json(400, { error: "A valid booking reference, access token, and resource are required." });
  }

  const publicClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: grantPayload, error: grantError } = await publicClient.rpc(
    "get_organizer_resources",
    { p_reference: reference, p_access_token: accessToken },
  );
  if (grantError) {
    return json(isMissingMigration(grantError.message) ? 503 : 403, {
      error: isMissingMigration(grantError.message) ? MIGRATION_ERROR : "Secure resource access was denied.",
    });
  }

  const resources = ((grantPayload as { resources?: Array<{ resourceId: string }> } | null)
    ?.resources ?? []);
  if (!resources.some((resource) => resource.resourceId === resourceId)) {
    return json(404, { error: "This material is not granted to the booking or the grant has expired." });
  }

  const { data: resource, error: resourceError } = await serviceClient
    .from("organizer_resource_files")
    .select("object_path")
    .eq("id", resourceId)
    .eq("status", "available")
    .maybeSingle();
  if (resourceError || !resource) {
    const message = resourceError?.message ?? "";
    return json(isMissingMigration(message) ? 503 : 404, {
      error: isMissingMigration(message) ? MIGRATION_ERROR : "The approved material is unavailable.",
    });
  }

  const { data: signed, error: signedError } = await serviceClient.storage
    .from("organizer-materials")
    .createSignedUrl(resource.object_path, 60);
  if (signedError || !signed?.signedUrl) {
    return json(503, { error: "A secure download link could not be created. Please try again." });
  }

  const { data: recorded, error: recordError } = await publicClient.rpc(
    "record_organizer_resource_access",
    {
      p_reference: reference,
      p_access_token: accessToken,
      p_resource_file_id: resourceId,
    },
  );
  if (recordError || recorded !== true) {
    return json(isMissingMigration(recordError?.message ?? "") ? 503 : 403, {
      error: isMissingMigration(recordError?.message ?? "")
        ? MIGRATION_ERROR
        : "The resource grant changed. Refresh the booking tracker and try again.",
    });
  }

  return json(200, { signedUrl: signed.signedUrl, expiresIn: 60 });
}
