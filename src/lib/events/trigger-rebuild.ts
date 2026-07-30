import { getSupabaseClient } from "@/lib/supabase/client";

export async function triggerSiteRebuild(): Promise<{ ok: boolean; message: string }> {
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
    return {
      ok: false,
      message: payload.error ?? payload.message ?? "Rebuild request failed.",
    };
  }

  return {
    ok: true,
    message: payload.message ?? "Site rebuild started. New event pages will be live in a few minutes.",
  };
}
