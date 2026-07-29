import type { BookingFormData, BookingRequest, InternalStatus, OrganizerStatus } from "./types";
import { generateBookingReference } from "./reference";

const STORAGE_KEY = "daa_booking_requests";

function readAll(): BookingRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookingRequest[]) : [];
  } catch {
    return [];
  }
}

function writeAll(requests: BookingRequest[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function getBookingRequests(): BookingRequest[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getBookingByReference(reference: string): BookingRequest | null {
  return readAll().find((r) => r.reference.toUpperCase() === reference.toUpperCase()) ?? null;
}

export function createBookingRequest(form: BookingFormData): BookingRequest {
  const now = new Date().toISOString();
  const reference = generateBookingReference();
  const request: BookingRequest = {
    id: crypto.randomUUID(),
    reference,
    status: "Received",
    internalStatus: "New / Unassigned",
    priority: "Normal",
    assignedEa: null,
    conflictDetected: false,
    form,
    documents: [],
    statusHistory: [
      {
        previousStatus: null,
        newStatus: "Received",
        timestamp: now,
        actor: "System",
        organizerMessage: "Your booking request has been received.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const requests = readAll();
  requests.push(request);
  writeAll(requests);
  return request;
}

export function updateBookingStatus(
  reference: string,
  status: OrganizerStatus,
  internalStatus: InternalStatus,
  organizerMessage?: string,
): BookingRequest | null {
  const requests = readAll();
  const index = requests.findIndex(
    (r) => r.reference.toUpperCase() === reference.toUpperCase(),
  );
  if (index === -1) return null;

  const existing = requests[index];
  const now = new Date().toISOString();
  const updated: BookingRequest = {
    ...existing,
    status,
    internalStatus,
    updatedAt: now,
    statusHistory: [
      ...existing.statusHistory,
      {
        previousStatus: existing.status,
        newStatus: status,
        timestamp: now,
        actor: "Executive Assistant",
        organizerMessage,
      },
    ],
  };

  requests[index] = updated;
  writeAll(requests);
  return updated;
}

export function seedDemoRequests(): void {
  if (typeof window === "undefined") return;
  if (readAll().length > 0) return;

  const demo: BookingRequest = {
    id: crypto.randomUUID(),
    reference: "DAA-8492",
    status: "Under Review",
    internalStatus: "Screening",
    priority: "High",
    assignedEa: "Sarah M.",
    conflictDetected: false,
    form: {
      name: "Amara Okafor",
      organization: "Lagos Business Forum",
      email: "amara@lagosbusinessforum.org",
      phone: "+234 801 234 5678",
      timezone: "WAT (West Africa)",
      engagementType: "Keynote",
      eventTitle: "Leadership in Uncertain Times",
      audienceSize: "500 – 1,000",
      format: "In-person",
      preferredDate: "2026-11-15",
      alternativeDate: "2026-11-22",
      city: "Lagos",
      country: "Nigeria",
      travelDetails: "International flight required. Accommodation provided.",
      budgetRange: "$25,000 – $50,000",
      recordingPermission: "Video recording",
      vipProtocol: "Governor's office reception. Security detail on arrival.",
      termsAgreed: true,
    },
    documents: [
      {
        id: "doc-1",
        name: "Formal_Invitation_Letter.pdf",
        uploadedAt: new Date().toISOString(),
        category: "Invitation",
      },
    ],
    statusHistory: [
      {
        previousStatus: null,
        newStatus: "Received",
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        actor: "System",
        organizerMessage: "Your booking request has been received.",
      },
      {
        previousStatus: "Received",
        newStatus: "Under Review",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        actor: "Executive Assistant",
        organizerMessage: "Our team is reviewing your invitation.",
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  };

  writeAll([demo]);
}
