import { z } from "zod";
import { validateStepForFormat } from "@/lib/booking/format-rules";
import type { BookingFormData } from "@/lib/booking/types";

export const step1Schema = z.object({
  name: z.string().min(2, "Full name is required"),
  requestArea: z.string().min(1, "Please select which area this request is for"),
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

export function validateStep(step: number, data: BookingFormData | Record<string, unknown>) {
  return validateStepForFormat(step, data as BookingFormData);
}
