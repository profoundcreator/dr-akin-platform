import type { AudienceConsentSource } from "@/lib/marketing/subscribe-audience";

export interface SyncAudienceEspInput {
  email: string;
  name?: string;
  consentSource: AudienceConsentSource;
  engagementContext?: Record<string, unknown>;
}

/** Fire-and-forget ESP sync after audience RPC subscribe. */
export function syncAudienceToEsp(input: SyncAudienceEspInput): void {
  if (typeof window === "undefined") return;

  void fetch("/api/audience-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).catch((error) => {
    console.warn("[marketing] audience-sync request failed:", error);
  });
}
