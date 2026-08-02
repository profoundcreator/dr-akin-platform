import { tryGetSupabaseClient } from "@/lib/supabase/client";

export interface GeneralEnquiryInput {
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  privacyAgreed: boolean;
  website?: string;
}

export async function submitGeneralEnquiry(input: GeneralEnquiryInput): Promise<string> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) {
    throw new Error("Enquiries are temporarily unavailable. Please try again later.");
  }

  const { data, error } = await supabase.rpc("submit_general_enquiry", {
    p_name: input.name,
    p_email: input.email,
    p_organization: input.organization || undefined,
    p_subject: input.subject,
    p_message: input.message,
    p_privacy_agreed: input.privacyAgreed,
    p_website: input.website || undefined,
  });

  if (error) throw new Error(error.message);
  return data as string;
}
