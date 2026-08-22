import { createServiceSupabaseClient } from "../server/lib/supabase-service";
import { readEnv } from "../server/lib/env";
import { isSameSiteRequest } from "../server/lib/request-guard";

interface SyncBody {
  email: string;
  name?: string;
  consentSource: string;
  engagementContext?: Record<string, unknown>;
}

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function syncToBeehiiv(
  email: string,
  name: string | undefined,
  publicationId: string,
  apiKey: string,
): Promise<{ ok: true; subscriberId: string } | { ok: false; error: string }> {
  const response = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        reactivate_existing: true,
        send_welcome_email: false,
        utm_source: "dr-akin-platform",
        custom_fields: name ? [{ name: "name", value: name }] : [],
      }),
    },
  );

  const data = (await response.json().catch(() => ({}))) as {
    data?: { id?: string };
    errors?: Array<{ message?: string }>;
  };

  if (!response.ok) {
    const message =
      data.errors?.[0]?.message ?? `Beehiiv API returned ${response.status}.`;
    return { ok: false, error: message };
  }

  const subscriberId = data.data?.id;
  if (!subscriberId) {
    return { ok: false, error: "Beehiiv did not return a subscriber id." };
  }

  return { ok: true, subscriberId };
}

async function syncToKit(
  email: string,
  name: string | undefined,
  formId: string,
  apiKey: string,
): Promise<{ ok: true; subscriberId: string } | { ok: false; error: string }> {
  const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      email: email.toLowerCase(),
      first_name: name ?? "",
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    subscription?: { subscriber?: { id?: number } };
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    return { ok: false, error: data.message ?? data.error ?? `Kit API returned ${response.status}.` };
  }

  const subscriberId = data.subscription?.subscriber?.id;
  if (!subscriberId) {
    return { ok: false, error: "Kit did not return a subscriber id." };
  }

  return { ok: true, subscriberId: String(subscriberId) };
}

/** Sync a consented audience member to the configured marketing ESP. */
export async function POST(request: Request): Promise<Response> {
  if (!isSameSiteRequest(request)) {
    return json(403, { error: "Forbidden." });
  }

  let body: SyncBody;
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  const email = readString(body.email).toLowerCase();
  if (!email) {
    return json(400, { error: "email is required." });
  }

  const beehiivKey = readEnv("BEEHIIV_API_KEY");
  const beehiivPublication = readEnv("BEEHIIV_PUBLICATION_ID");
  const kitKey = readEnv("KIT_API_KEY");
  const kitFormId = readEnv("KIT_FORM_ID");

  const espProvider = beehiivKey && beehiivPublication ? "beehiiv" : kitKey && kitFormId ? "kit" : null;

  if (!espProvider) {
    return json(200, { ok: true, skipped: true, reason: "esp_not_configured" });
  }

  const name = readString(body.name) || undefined;
  const syncResult =
    espProvider === "beehiiv"
      ? await syncToBeehiiv(email, name, beehiivPublication!, beehiivKey!)
      : await syncToKit(email, name, kitFormId!, kitKey!);

  if (!syncResult.ok) {
    console.error("[audience-sync] ESP sync failed:", syncResult.error);
    return json(502, { error: syncResult.error });
  }

  const supabase = createServiceSupabaseClient();
  if (supabase) {
    await supabase
      .from("audience_members")
      .update({
        esp_provider: espProvider,
        esp_subscriber_id: syncResult.subscriberId,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);
  }

  return json(200, {
    ok: true,
    espProvider,
    subscriberId: syncResult.subscriberId,
  });
}
