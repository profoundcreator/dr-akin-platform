import { z } from "zod";

export const step1Schema = z.object({
  name: z.string().min(2, "Full name is required"),
  organization: z.string().min(2, "Organization is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(6, "Phone or WhatsApp is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

export const step2Schema = z.object({
  engagementType: z.string().min(1, "Engagement type is required"),
  eventTitle: z.string().min(3, "Event title is required"),
  audienceSize: z.string().min(1, "Audience size is required"),
  format: z.string().min(1, "Format is required"),
});

export const step3Schema = z.object({
  preferredDate: z.string().min(1, "Preferred date is required"),
  alternativeDate: z.string().optional(),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  travelDetails: z.string().optional(),
});

export const step4Schema = z.object({
  budgetRange: z.string().min(1, "Budget range is required"),
  recordingPermission: z.string().min(1, "Recording preference is required"),
  vipProtocol: z.string().optional(),
  termsAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms to submit" }),
  }),
});

export const bookingFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;

export function validateStep(step: number, data: Record<string, unknown>) {
  const schemas = [step1Schema, step2Schema, step3Schema, step4Schema];
  const schema = schemas[step - 1];
  if (!schema) return { success: true as const, errors: {} };

  const result = schema.safeParse(data);
  if (result.success) return { success: true as const, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") errors[key] = issue.message;
  }
  return { success: false as const, errors };
}
