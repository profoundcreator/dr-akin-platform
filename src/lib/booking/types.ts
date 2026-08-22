export const ORGANIZER_STATUSES = [
  "Received",
  "Under Review",
  "Information Required",
  "Tentatively Available",
  "Confirmed",
  "Declined",
  "Cancelled",
  "Completed",
] as const;

export type OrganizerStatus = (typeof ORGANIZER_STATUSES)[number];

export const INTERNAL_STATUSES = [
  "New / Unassigned",
  "Screening",
  "Awaiting Executive Review",
  "Awaiting Organizer Information",
  "Tentative Hold",
  "Commercial / Terms Review",
  "Approved in Principle",
  "Confirmed",
  "Logistics in Progress",
  "Brief in Preparation",
  "Ready",
  "Completed",
  "Declined",
  "Cancelled",
  "Archived",
] as const;

export type InternalStatus = (typeof INTERNAL_STATUSES)[number];

import type { BookingRequestArea } from "@/lib/contact/platform-context";

export interface BookingFormData {
  // Step 1 — Contact
  name: string;
  organization: string;
  email: string;
  phone: string;
  timezone: string;
  /** Which org or office this booking is for (stored as `platform` in form_data). */
  requestArea: BookingRequestArea;
  // Step 2 — Engagement
  engagementType: string;
  eventTitle: string;
  audienceSize: string;
  format: string;
  // Step 3 — Schedule
  preferredDate: string;
  alternativeDate: string;
  city: string;
  country: string;
  travelDetails: string;
  logisticsNotApplicable: boolean;
  // Step 4 — Requirements
  budgetRange: string;
  recordingPermission: string;
  vipProtocol: string;
  protocolNotApplicable: boolean;
  termsAgreed: boolean;
  marketingOptIn: boolean;
}

export interface StatusEvent {
  previousStatus: OrganizerStatus | null;
  newStatus: OrganizerStatus;
  timestamp: string;
  actor: string;
  organizerMessage?: string;
}

export interface BookingDocument {
  id: string;
  name: string;
  uploadedAt: string;
  category: string;
}

export interface BookingRequest {
  id: string;
  reference: string;
  status: OrganizerStatus;
  internalStatus: InternalStatus;
  priority: "Normal" | "High" | "VIP";
  assignedEa: string | null;
  conflictDetected: boolean;
  form: BookingFormData;
  documents: BookingDocument[];
  statusHistory: StatusEvent[];
  createdAt: string;
  updatedAt: string;
}

export type BookingFormStep = 1 | 2 | 3 | 4;

export const EMPTY_BOOKING_FORM: BookingFormData = {
  name: "",
  organization: "",
  email: "",
  phone: "",
  timezone: "",
  requestArea: "speaking-office",
  engagementType: "",
  eventTitle: "",
  audienceSize: "",
  format: "",
  preferredDate: "",
  alternativeDate: "",
  city: "",
  country: "",
  travelDetails: "",
  logisticsNotApplicable: false,
  budgetRange: "",
  recordingPermission: "",
  vipProtocol: "",
  protocolNotApplicable: false,
  termsAgreed: false,
  marketingOptIn: false,
};
