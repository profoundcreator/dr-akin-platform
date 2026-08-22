import type { BookingFormData } from "@/lib/booking/types";

export function isVirtualFormat(format: string): boolean {
  return format === "Virtual";
}

export function isHybridFormat(format: string): boolean {
  return format === "Hybrid";
}

export interface FormatFieldVisibility {
  showLocation: boolean;
  showLogistics: boolean;
  showProtocol: boolean;
}

export function fieldsForFormat(format: string): FormatFieldVisibility {
  const virtual = isVirtualFormat(format);
  return {
    showLocation: !virtual,
    showLogistics: !virtual,
    showProtocol: !virtual,
  };
}

export function stepDescriptionForFormat(step: number, format: string): string {
  if (step === 3) {
    return isVirtualFormat(format) ? "Date & timing" : "Date & location";
  }
  if (step === 4) {
    return isVirtualFormat(format) ? "Commercial terms" : "Terms & event protocol";
  }
  const defaults = ["Organizer details", "Engagement overview", "Date & location", "Terms & protocol"];
  return defaults[step - 1] ?? "";
}

export function cityLabelForFormat(format: string): string {
  return isHybridFormat(format) ? "Primary event city" : "Event city";
}

export function countryLabelForFormat(format: string): string {
  return isHybridFormat(format) ? "Primary event country" : "Event country";
}

export function logisticsLabelForFormat(format: string): string {
  return isHybridFormat(format)
    ? "In-person logistics you will provide"
    : "Logistics you will provide";
}

export function logisticsHelperForFormat(format: string): string {
  const base =
    "Tell us what travel and on-site support your team will arrange for Akin Akinpelu. If this does not apply to your request, you may indicate that below.";
  return isHybridFormat(format) ? `${base} (For the in-person portion.)` : base;
}

export const LOGISTICS_PLACEHOLDER =
  "e.g. Business-class flights covered, hotel for 2 nights, airport pickup and local driver";

export const LOGISTICS_NOT_APPLICABLE_VALUE =
  "Not applicable — no logistics support required from our side at this stage.";

export const PROTOCOL_NOT_APPLICABLE_VALUE =
  "Not applicable — no special security or reception requirements for this engagement.";

export function isLogisticsNotApplicable(value: string | null | undefined): boolean {
  return (value ?? "").trim() === LOGISTICS_NOT_APPLICABLE_VALUE;
}

export function isProtocolNotApplicable(value: string | null | undefined): boolean {
  return (value ?? "").trim() === PROTOCOL_NOT_APPLICABLE_VALUE;
}

export const PROTOCOL_HELPER =
  "Describe any security, reception, or on-site protocol expectations for this engagement. Akin's team will share speaker requirements after review. If this does not apply, you may indicate that below.";

export const PROTOCOL_PLACEHOLDER =
  "e.g. Airport VIP reception, security detail at venue, dress code, head-of-state attendance";

/** Fields cleared when format switches to Virtual. */
export const VOIDED_FIELDS_ON_VIRTUAL = [
  "city",
  "country",
  "travelDetails",
  "vipProtocol",
  "logisticsNotApplicable",
  "protocolNotApplicable",
] as const satisfies readonly (keyof BookingFormData)[];

export function applyFormatChange(
  prev: BookingFormData,
  format: string,
): BookingFormData {
  if (!isVirtualFormat(format)) return { ...prev, format };

  return {
    ...prev,
    format,
    city: "",
    country: "",
    travelDetails: "",
    vipProtocol: "",
    logisticsNotApplicable: false,
    protocolNotApplicable: false,
  };
}

/** Sync N/A booleans with stored sentinel values (drafts and legacy rows). */
export function syncBookingOptionalFieldFlags(
  form: Pick<
    BookingFormData,
    "travelDetails" | "vipProtocol" | "logisticsNotApplicable" | "protocolNotApplicable"
  >,
): Pick<BookingFormData, "travelDetails" | "vipProtocol" | "logisticsNotApplicable" | "protocolNotApplicable"> {
  const logisticsNotApplicable =
    form.logisticsNotApplicable || isLogisticsNotApplicable(form.travelDetails);
  const protocolNotApplicable =
    form.protocolNotApplicable || isProtocolNotApplicable(form.vipProtocol);

  return {
    logisticsNotApplicable,
    protocolNotApplicable,
    travelDetails: logisticsNotApplicable ? LOGISTICS_NOT_APPLICABLE_VALUE : form.travelDetails,
    vipProtocol: protocolNotApplicable ? PROTOCOL_NOT_APPLICABLE_VALUE : form.vipProtocol,
  };
}

export function formatEventLocation(form: Pick<BookingFormData, "format" | "city" | "country">): string {
  if (isVirtualFormat(form.format)) return "Online";
  const city = form.city.trim();
  const country = form.country.trim();
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return "—";
}

export function validateStepForFormat(
  step: number,
  form: BookingFormData,
): { success: true } | { success: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const visibility = fieldsForFormat(form.format);

  if (step === 1) {
    if (!form.name || form.name.trim().length < 2) errors.name = "Full name is required";
    if (!form.requestArea) errors.requestArea = "Please select which area this request is for";
    if (!form.organization || form.organization.trim().length < 2) {
      errors.organization = "Organization is required";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Valid email is required";
    }
    if (!form.phone || form.phone.trim().length < 6) errors.phone = "Phone or WhatsApp is required";
    if (!form.timezone) errors.timezone = "Timezone is required";
  }

  if (step === 2) {
    if (!form.engagementType) errors.engagementType = "Engagement type is required";
    if (!form.eventTitle || form.eventTitle.trim().length < 3) {
      errors.eventTitle = "Engagement title is required";
    }
    if (!form.audienceSize) errors.audienceSize = "Audience size is required";
    if (!form.format) errors.format = "Format is required";
  }

  if (step === 3) {
    if (!form.preferredDate) errors.preferredDate = "Preferred date is required";
    if (visibility.showLocation) {
      if (!form.city || form.city.trim().length < 2) errors.city = "City is required";
      if (!form.country || form.country.trim().length < 2) errors.country = "Country is required";
    }
  }

  if (step === 4) {
    if (!form.budgetRange) errors.budgetRange = "Budget range is required";
    if (!form.recordingPermission) errors.recordingPermission = "Recording preference is required";
    if (!form.termsAgreed) errors.termsAgreed = "You must agree to the terms to submit";
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };
  return { success: true };
}
