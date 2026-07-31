import { getSupabaseClient } from "@/lib/supabase/client";
import type { RebuildResult } from "@/lib/events/publish-notice";

export type { RebuildResult };

export const REBUILD_STARTED_MESSAGE =
  "Site rebuild started. Search engines and link previews will catch up in a few minutes.";

export const REBUILD_HOOK_MISSING_MESSAGE =
  "Content is live on the website, but automatic SEO rebuild is not set up. Add VERCEL_DEPLOY_HOOK_URL in Vercel project settings, or click Rebuild site for SEO after publishing.";

export async function triggerSiteRebuild(): Promise<RebuildResult> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, message: "You must be signed in to trigger a rebuild." };
  }

  const response = await fetch("/api/trigger-rebuild", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

  if (!response.ok) {
    const message =
      response.status === 503 && payload.error?.includes("Deploy hook")
        ? REBUILD_HOOK_MISSING_MESSAGE
        : (payload.error ?? payload.message ?? "Rebuild request failed.");
    return { ok: false, message };
  }

  return {
    ok: true,
    message: payload.message ?? REBUILD_STARTED_MESSAGE,
  };
}
