import { readEnv } from "./_lib/env";
import { getBrandInboxes } from "./_lib/notification-routing";
import { getNotificationMailConfig } from "./_lib/notifications";
import { hasValidStatusProbeKey } from "./_lib/request-guard";
import { createServiceSupabaseClient } from "./_lib/supabase-service";

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function maskEmail(value: string): string {
  const match = value.match(/<?([^<>\s]+@[^<>\s]+)>?/);
  if (!match) return value ? "(set)" : "(missing)";
  const email = match[1];
  const [local, domain] = email.split("@");
  if (!local || !domain) return "(set)";
  const visible = local.length <= 2 ? "*" : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

/** Lightweight config check for Resend notification setup (no secrets returned). */
export async function GET(request: Request): Promise<Response> {
  const probeKey = readEnv("NOTIFICATIONS_STATUS_KEY");
  if (!probeKey || !hasValidStatusProbeKey(request, probeKey)) {
    return json(404, { error: "Not found." });
  }

  const mailConfig = getNotificationMailConfig();
  const supabase = createServiceSupabaseClient();
  const brandInboxes = getBrandInboxes();

  const resendApiKey = readEnv("RESEND_API_KEY");
  const from = readEnv("NOTIFICATION_FROM_EMAIL");
  const adminTo = readEnv("ADMIN_NOTIFICATION_EMAIL");
  const replyTo = readEnv("NOTIFICATION_REPLY_TO");
  const serviceRole = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  const checks = {
    resendApiKey: Boolean(resendApiKey),
    notificationFromEmail: Boolean(from),
    adminNotificationEmail: Boolean(adminTo),
    supabaseServiceRole: Boolean(serviceRole),
    resendClientReady: Boolean(mailConfig),
    supabaseServiceClientReady: Boolean(supabase),
  };

  const brandChecks = {
    aald: Boolean(brandInboxes.aald),
    performx: Boolean(brandInboxes.performx),
    erudio: Boolean(brandInboxes.erudio),
    auctus: Boolean(brandInboxes.auctus),
    futureAfricaViaErudio: Boolean(brandInboxes.erudio),
  };

  const ready = Object.values(checks).every(Boolean);

  return json(ready ? 200 : 503, {
    ok: ready,
    service: "submission-notifications",
    checks,
    brandChecks,
    masked: {
      from: maskEmail(from),
      adminTo: maskEmail(adminTo),
      replyTo: replyTo ? maskEmail(replyTo) : maskEmail(adminTo),
      aald: brandInboxes.aald ? maskEmail(brandInboxes.aald) : "(missing)",
      performx: brandInboxes.performx ? maskEmail(brandInboxes.performx) : "(missing)",
      erudio: brandInboxes.erudio ? maskEmail(brandInboxes.erudio) : "(missing)",
      auctus: brandInboxes.auctus ? maskEmail(brandInboxes.auctus) : "(missing)",
      futureAfricaViaErudio: brandInboxes.erudio
        ? `${maskEmail(brandInboxes.erudio)} (Future Africa interim)`
        : "(missing — required for Future Africa)",
    },
    resendSetupRequired: [
      "Add and verify theakinakinpelu.org (or your sending domain) in Resend → Domains.",
      "NOTIFICATION_FROM_EMAIL must use that verified domain (e.g. notifications@theakinakinpelu.org).",
      "Create a Resend API key and set RESEND_API_KEY in Vercel.",
      "Receiving at ea@theakinakinpelu.org uses your existing MX records — separate from Resend sending DNS.",
    ],
  });
}
