import { subscribeAudienceMember } from "@/lib/marketing/subscribe-audience";
import { syncAudienceToEsp } from "@/lib/marketing/sync-audience-esp";
import { notifySubmission } from "@/lib/notifications/notify-submission";
import { readContactSubmissionContext } from "@/lib/contact/platform-context";
import { tryGetSupabaseClient } from "@/lib/supabase/client";

export interface GeneralEnquiryInput {
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  privacyAgreed: boolean;
  marketingOptIn?: boolean;
  website?: string;
}

export async function submitGeneralEnquiry(input: GeneralEnquiryInput): Promise<string> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) {
    throw new Error("Enquiries are temporarily unavailable. Please try again later.");
  }

  const { platform, referrerPath } = readContactSubmissionContext();

  const { data, error } = await supabase.rpc("submit_general_enquiry", {
    p_name: input.name,
    p_email: input.email,
    p_organization: input.organization || undefined,
    p_subject: input.subject,
    p_message: input.message,
    p_privacy_agreed: input.privacyAgreed,
    p_website: input.website || undefined,
    p_referrer_path: referrerPath || undefined,
    p_platform: platform || undefined,
  });

  if (error) throw new Error(error.message);

  const enquiryId = data as string;
  notifySubmission({ kind: "enquiry", enquiryId });

  if (input.marketingOptIn) {
    try {
      await subscribeAudienceMember({
        email: input.email,
        name: input.name,
        consentSource: "contact",
        engagementContext: {
          enquiryId,
          subject: input.subject,
          organization: input.organization ?? null,
          platform,
          referrerPath,
        },
      });
      syncAudienceToEsp({
        email: input.email,
        name: input.name,
        consentSource: "contact",
        engagementContext: {
          platform,
          referrerPath,
        },
      });
    } catch (err) {
      console.warn("[marketing] contact opt-in failed:", err);
    }
  }

  return enquiryId;
}
