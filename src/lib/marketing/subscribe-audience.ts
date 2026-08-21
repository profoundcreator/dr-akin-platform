import { tryGetSupabaseClient } from "@/lib/supabase/client";

export type AudienceConsentSource = "contact" | "booking" | "newsletter" | "summit_interest";

export interface SubscribeAudienceInput {
  email: string;
  name?: string;
  consentSource: AudienceConsentSource;
  engagementContext?: Record<string, unknown>;
}

/** Records marketing opt-in. Failures are non-blocking for form submission. */
export async function subscribeAudienceMember(input: SubscribeAudienceInput): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.rpc("subscribe_audience_member", {
    p_email: input.email.trim(),
    p_name: input.name?.trim() || undefined,
    p_consent_source: input.consentSource,
    p_engagement_context: input.engagementContext ?? undefined,
  });

  if (error) {
    console.warn("[marketing] audience subscribe failed:", error.message);
  }
}
