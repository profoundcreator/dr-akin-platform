import type {
  BookingDocument,
  BookingFormData,
  BookingRequest,
  InternalStatus,
  OrganizerStatus,
  StatusEvent,
} from "@/lib/booking/types";
import {
  createBookingRequest as createLocalBooking,
  getBookingByReference as getLocalBooking,
} from "@/lib/booking/storage";
import { getMockBookingRequests } from "@/lib/booking/mock-demo-data";
import { getBookingLookupStrategy } from "@/lib/booking/tracker-access";
import { tryGetSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { DbBookingRequest } from "@/lib/supabase/database.types";

const ACCESS_TOKEN_KEY = "daa_booking_access_tokens";

function saveAccessToken(reference: string, token: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[reference.toUpperCase()] = token;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function getStoredAccessToken(reference: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!raw) return null;
    const map: Record<string, string> = JSON.parse(raw);
    return map[reference.toUpperCase()] ?? null;
  } catch {
    return null;
  }
}

function normalizeBookingForm(raw: unknown): BookingFormData {
  const form = raw && typeof raw === "object" ? (raw as Partial<BookingFormData>) : {};

  return {
    name: form.name ?? "",
    organization: form.organization ?? "",
    email: form.email ?? "",
    phone: form.phone ?? "",
    timezone: form.timezone ?? "",
    engagementType: form.engagementType ?? "",
    eventTitle: form.eventTitle ?? "",
    audienceSize: form.audienceSize ?? "",
    format: form.format ?? "",
    preferredDate: form.preferredDate ?? "",
    alternativeDate: form.alternativeDate ?? "",
    city: form.city ?? "",
    country: form.country ?? "",
    travelDetails: form.travelDetails ?? "",
    budgetRange: form.budgetRange ?? "",
    recordingPermission: form.recordingPermission ?? "",
    vipProtocol: form.vipProtocol ?? "",
    termsAgreed: Boolean(form.termsAgreed),
  };
}

function mapDbToBooking(row: DbBookingRequest, extras?: {
  statusHistory?: StatusEvent[];
  documents?: BookingDocument[];
  assignedEa?: string | null;
}): BookingRequest {
  const form = normalizeBookingForm(row.form_data);
  return {
    id: row.id,
    reference: row.reference,
    status: row.status as OrganizerStatus,
    internalStatus: row.internal_status as InternalStatus,
    priority: row.priority as BookingRequest["priority"],
    assignedEa: extras?.assignedEa ?? row.assigned_ea?.full_name ?? null,
    conflictDetected: row.conflict_detected,
    form,
    documents: extras?.documents ?? [],
    statusHistory: extras?.statusHistory ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrganizerPayload(payload: Record<string, unknown>): BookingRequest {
  return {
    id: payload.id as string,
    reference: payload.reference as string,
    status: payload.status as OrganizerStatus,
    internalStatus: payload.internalStatus as InternalStatus,
    priority: payload.priority as BookingRequest["priority"],
    assignedEa: (payload.assignedEa as string | null) ?? null,
    conflictDetected: payload.conflictDetected as boolean,
    form: payload.form as BookingFormData,
    documents: (payload.documents as BookingDocument[]) ?? [],
    statusHistory: (payload.statusHistory as StatusEvent[]) ?? [],
    createdAt: payload.createdAt as string,
    updatedAt: payload.updatedAt as string,
  };
}

export async function createBookingRequest(
  form: BookingFormData,
  source = "web",
): Promise<{ reference: string; accessToken: string }> {
  const supabase = tryGetSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.rpc("create_booking_request", {
      p_form: form as unknown as Record<string, unknown>,
      p_source: source,
    });

    if (error) throw new Error(error.message);

    const result = data as { reference: string; access_token: string };
    saveAccessToken(result.reference, result.access_token);

    return {
      reference: result.reference,
      accessToken: result.access_token,
    };
  }

  const local = createLocalBooking(form);
  return { reference: local.reference, accessToken: "" };
}

export async function getBookingByReference(
  reference: string,
  accessToken?: string | null,
): Promise<BookingRequest | null> {
  const supabase = tryGetSupabaseClient();
  const token = accessToken ?? getStoredAccessToken(reference);
  const strategy = getBookingLookupStrategy(isSupabaseConfigured, Boolean(token));

  if (strategy === "remote" && supabase && token) {
    const { data, error } = await supabase.rpc("get_booking_for_organizer", {
      p_reference: reference,
      p_access_token: token,
    });

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapOrganizerPayload(data as Record<string, unknown>);
  }

  if (strategy === "unavailable") {
    return null;
  }

  return (
    getLocalBooking(reference) ??
    getMockBookingRequests().find(
      (r) => r.reference.toUpperCase() === reference.toUpperCase(),
    ) ??
    null
  );
}

export async function getBookingRequests(): Promise<BookingRequest[]> {
  if (!isSupabaseConfigured) {
    return getMockBookingRequests();
  }

  const supabase = tryGetSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const rows = data ?? [];

    if (rows.length === 0) return [];

    const { data: events } = await supabase
      .from("booking_status_events")
      .select("*")
      .in(
        "booking_request_id",
        rows.map((r) => r.id),
      )
      .order("created_at", { ascending: true });

    const { data: documents } = await supabase
      .from("booking_documents")
      .select("*")
      .in(
        "booking_request_id",
        rows.map((r) => r.id),
      );

    const eaIds = rows
      .map((r) => r.assigned_ea_id)
      .filter((id): id is string => Boolean(id));

    let eaMap: Record<string, string> = {};
    if (eaIds.length > 0) {
      const { data: profiles } = await supabase
        .from("admin_profiles")
        .select("id, full_name")
        .in("id", eaIds);
      eaMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.id, p.full_name]),
      );
    }

    return rows.map((row) => {
      const rowEvents = (events ?? []).filter((e) => e.booking_request_id === row.id);
      const rowDocs = (documents ?? []).filter((d) => d.booking_request_id === row.id);

      return mapDbToBooking(row as DbBookingRequest, {
        assignedEa: row.assigned_ea_id ? eaMap[row.assigned_ea_id] ?? null : null,
        statusHistory: rowEvents.map((e) => ({
          previousStatus: e.previous_status as OrganizerStatus | null,
          newStatus: e.new_status as OrganizerStatus,
          timestamp: e.created_at,
          actor: e.actor,
          organizerMessage: e.organizer_message ?? undefined,
        })),
        documents: rowDocs.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          uploadedAt: d.created_at,
        })),
      });
    });
  }

  return getMockBookingRequests();
}

export async function logAuditEvent(
  eventType: string,
  targetType?: string,
  targetId?: string,
  summary?: Record<string, unknown>,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return;

  await supabase.rpc("log_audit_event", {
    p_event_type: eventType,
    p_target_type: targetType ?? undefined,
    p_target_id: targetId ?? undefined,
    p_summary: summary ?? undefined,
    p_metadata: metadata ?? undefined,
  });
}

export async function getBookingRequestById(id: string): Promise<BookingRequest | null> {
  const all = await getBookingRequests();
  return all.find((r) => r.id === id) ?? null;
}

export async function updateBookingStatus(
  requestId: string,
  updates: {
    status?: OrganizerStatus;
    internalStatus?: InternalStatus;
    organizerMessage?: string;
    internalReason?: string;
    actorName?: string;
  },
): Promise<BookingRequest | null> {
  const supabase = tryGetSupabaseClient();

  if (!supabase) {
    const mock = getMockBookingRequests().find((r) => r.id === requestId);
    if (!mock) return null;
    if (updates.status) mock.status = updates.status;
    if (updates.internalStatus) mock.internalStatus = updates.internalStatus;
    if (updates.organizerMessage || updates.internalReason) {
      mock.statusHistory.push({
        previousStatus: mock.status,
        newStatus: updates.status ?? mock.status,
        timestamp: new Date().toISOString(),
        actor: updates.actorName ?? "EA",
        organizerMessage: updates.organizerMessage,
      });
    }
    mock.updatedAt = new Date().toISOString();
    return mock;
  }

  const { data: existing, error: fetchError } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !existing) throw new Error(fetchError?.message ?? "Request not found");

  const patch: Record<string, unknown> = {};
  if (updates.status) patch.status = updates.status;
  if (updates.internalStatus) patch.internal_status = updates.internalStatus;

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await supabase
      .from("booking_requests")
      .update(patch)
      .eq("id", requestId);

    if (updateError) throw new Error(updateError.message);
  }

  if (updates.status || updates.organizerMessage || updates.internalReason) {
    const { error: eventError } = await supabase.from("booking_status_events").insert({
      booking_request_id: requestId,
      previous_status: existing.status,
      new_status: updates.status ?? existing.status,
      actor: updates.actorName ?? "EA",
      organizer_message: updates.organizerMessage ?? null,
      internal_reason: updates.internalReason ?? null,
    });

    if (eventError) throw new Error(eventError.message);
  }

  await logAuditEvent("booking.status_updated", "booking_request", requestId, {
    status: updates.status,
    internalStatus: updates.internalStatus,
  });

  return getBookingRequestById(requestId);
}

export interface EnquiryRecord {
  id: string;
  source: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  organization: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  priority: string;
  bookingRequestId: string | null;
  createdAt: string;
}

const MOCK_ENQUIRIES: EnquiryRecord[] = [
  {
    id: "enq-1",
    source: "Booking",
    contactName: "Sarah Mensah",
    contactEmail: "sarah@acmecorp.com",
    contactPhone: null,
    organization: "Acme Corp",
    subject: "Annual Leadership Summit",
    message: "Keynote for 500 executives in Lagos.",
    status: "New",
    priority: "High",
    bookingRequestId: null,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "enq-2",
    source: "Contact",
    contactName: "James Okafor",
    contactEmail: "j.okafor@university.edu",
    contactPhone: null,
    organization: "State University",
    subject: "Board advisory enquiry",
    message: "Interested in governance advisory for our board.",
    status: "Open",
    priority: "Normal",
    bookingRequestId: null,
    createdAt: "2026-01-08T14:30:00Z",
  },
];

export async function getEnquiries(): Promise<EnquiryRecord[]> {
  const supabase = tryGetSupabaseClient();

  if (!supabase) return MOCK_ENQUIRIES;

  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    source: row.source,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    organization: row.organization,
    subject: row.subject,
    message: row.message,
    status: row.status,
    priority: row.priority,
    bookingRequestId: row.booking_request_id,
    createdAt: row.created_at,
  }));
}

function mapEnquiryRow(row: {
  id: string;
  source: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  organization: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  priority: string;
  booking_request_id: string | null;
  created_at: string;
}): EnquiryRecord {
  return {
    id: row.id,
    source: row.source,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    organization: row.organization,
    subject: row.subject,
    message: row.message,
    status: row.status,
    priority: row.priority,
    bookingRequestId: row.booking_request_id,
    createdAt: row.created_at,
  };
}

export async function getEnquiryById(enquiryId: string): Promise<EnquiryRecord | null> {
  const supabase = tryGetSupabaseClient();

  if (!supabase) {
    return MOCK_ENQUIRIES.find((e) => e.id === enquiryId) ?? null;
  }

  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", enquiryId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapEnquiryRow(data);
}

export async function convertEnquiryToBooking(
  enquiryId: string,
): Promise<{ bookingRequestId: string; reference: string }> {
  const supabase = tryGetSupabaseClient();

  if (!supabase) {
    const enquiry = MOCK_ENQUIRIES.find((e) => e.id === enquiryId);
    if (!enquiry) throw new Error("Enquiry not found");
    if (enquiry.bookingRequestId) throw new Error("Already linked to a booking");
    enquiry.bookingRequestId = "mock-booking-id";
    enquiry.status = "Open";
    return { bookingRequestId: "mock-booking-id", reference: "DAA-0000" };
  }

  const { data, error } = await supabase.rpc("convert_enquiry_to_booking", {
    p_enquiry_id: enquiryId,
  });

  if (error) throw new Error(error.message);

  const result = data as {
    booking_request_id: string;
    reference: string;
    access_token: string;
  };

  await logAuditEvent("enquiry.converted_to_booking", "enquiry", enquiryId, {
    bookingRequestId: result.booking_request_id,
    reference: result.reference,
  });

  return {
    bookingRequestId: result.booking_request_id,
    reference: result.reference,
  };
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: string,
): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) {
    const item = MOCK_ENQUIRIES.find((e) => e.id === enquiryId);
    if (item) item.status = status;
    return;
  }

  const { error } = await supabase.from("enquiries").update({ status }).eq("id", enquiryId);
  if (error) throw new Error(error.message);

  await logAuditEvent("enquiry.status_updated", "enquiry", enquiryId, { status });
}

export { isSupabaseConfigured };
