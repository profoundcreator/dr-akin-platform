import { isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";
import { SITE_IMAGES } from "@/lib/media/site-images";
import type {
  DbEvent,
  EventBrand,
  EventStatus,
  EventType,
} from "@/lib/supabase/database.types";
import { isEventPubliclyVisible } from "@/lib/events/event-visibility";
import { formatSchemaSetupError } from "@/lib/site-settings/schema-support";

export interface PlatformEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  seoDescription: string | null;
  eventType: EventType;
  brand: EventBrand;
  startsAt: string;
  endsAt: string;
  timezone: string;
  location: string | null;
  locationType: string;
  coverImagePath: string | null;
  registrationUrl: string | null;
  registrationEmbedUrl: string | null;
  paymentUrl: string | null;
  paymentLabel: string | null;
  status: EventStatus;
  manuallyHidden: boolean;
  isHomepageFeatured: boolean;
  submittedBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionNote: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventInput {
  slug: string;
  title: string;
  description?: string;
  seoDescription?: string;
  eventType: EventType;
  brand: EventBrand;
  startsAt: string;
  endsAt: string;
  timezone?: string;
  location?: string;
  locationType?: string;
  coverImagePath?: string | null;
  registrationUrl?: string;
  registrationEmbedUrl?: string;
  paymentUrl?: string;
  paymentLabel?: string;
  status?: EventStatus;
  manuallyHidden?: boolean;
  isHomepageFeatured?: boolean;
}

/** Self-hosted covers when Supabase `cover_image_path` is null (build + runtime). */
export const STATIC_EVENT_COVER_PATHS: Partial<Record<string, string>> = {
  "performx-summit-2026": SITE_IMAGES.performxSummitOg,
};

const LEGACY_EVENT_COVER_PATHS: Record<string, string> = {
  "/images/marketing/performx-summit-og.webp": SITE_IMAGES.performxSummitOg,
};

function normalizeEventCoverPath(coverImagePath: string | null): string | null {
  const trimmed = coverImagePath?.trim();
  if (!trimmed) return null;
  return LEGACY_EVENT_COVER_PATHS[trimmed] ?? trimmed;
}

export function applyStaticEventCoverFallback(event: PlatformEvent): PlatformEvent {
  const normalizedPath = normalizeEventCoverPath(event.coverImagePath);
  if (normalizedPath !== event.coverImagePath) {
    return { ...event, coverImagePath: normalizedPath };
  }
  if (normalizedPath) return event;
  const fallback = STATIC_EVENT_COVER_PATHS[event.slug];
  return fallback ? { ...event, coverImagePath: fallback } : event;
}

function mapRow(row: DbEvent): PlatformEvent {
  return applyStaticEventCoverFallback({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    seoDescription: row.seo_description,
    eventType: row.event_type,
    brand: row.brand,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    location: row.location,
    locationType: row.location_type,
    coverImagePath: row.cover_image_path,
    registrationUrl: row.registration_url,
    registrationEmbedUrl: row.registration_embed_url,
    paymentUrl: row.payment_url,
    paymentLabel: row.payment_label,
    status: row.status,
    manuallyHidden: row.manually_hidden,
    isHomepageFeatured: row.is_homepage_featured ?? false,
    submittedBy: row.submitted_by,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionNote: row.rejection_note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function buildInsertPayload(
  input: EventInput,
  meta: {
    createdBy?: string;
    submittedBy?: string;
    approvedBy?: string;
    approvedAt?: string;
  },
): Record<string, unknown> {
  return {
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    seo_description: input.seoDescription?.trim() || null,
    event_type: input.eventType,
    brand: input.brand,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    timezone: input.timezone?.trim() || "Africa/Lagos",
    location: input.location?.trim() || null,
    location_type: input.locationType || "in_person",
    cover_image_path: input.coverImagePath ?? null,
    registration_url: input.registrationUrl?.trim() || null,
    registration_embed_url: input.registrationEmbedUrl?.trim() || null,
    payment_url: input.paymentUrl?.trim() || null,
    payment_label: input.paymentLabel?.trim() || null,
    status: input.status ?? "draft",
    manually_hidden: input.manuallyHidden ?? false,
    created_by: meta.createdBy ?? null,
    submitted_by: meta.submittedBy ?? null,
    approved_by: meta.approvedBy ?? null,
    approved_at: meta.approvedAt ?? null,
  };
}

export function getEventCoverUrl(coverImagePath: string | null): string | null {
  if (!coverImagePath) return null;
  if (coverImagePath.startsWith("http://") || coverImagePath.startsWith("https://")) {
    return coverImagePath;
  }
  if (coverImagePath.startsWith("/")) {
    return coverImagePath;
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/event-covers/${coverImagePath}`;
}

export function getEventMetaDescription(event: PlatformEvent): string {
  if (event.seoDescription?.trim()) return event.seoDescription.trim();
  if (event.description?.trim()) {
    const trimmed = event.description.trim();
    return trimmed.length > 160 ? `${trimmed.slice(0, 157)}…` : trimmed;
  }
  return `${event.title} — register for this event with Akin Akinpelu, Ph.D., Amb., FLPi.`;
}

export function slugifyEventTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function isValidEventSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

export async function getPublishedEvents(): Promise<PlatformEvent[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("manually_hidden", false)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow).filter(isEventPubliclyVisible);
}

export async function getUpcomingPublishedEvents(): Promise<PlatformEvent[]> {
  const events = await getPublishedEvents();
  const now = Date.now();
  return events.filter((event) => new Date(event.startsAt).getTime() > now);
}

export async function getHomepageFeaturedEvent(): Promise<PlatformEvent | null> {
  const events = await getPublishedEvents();
  const homepageFeatured = events.find((event) => event.isHomepageFeatured);
  if (homepageFeatured) return homepageFeatured;

  const now = Date.now();
  return events.find((event) => new Date(event.startsAt).getTime() > now) ?? null;
}

export async function setEventHomepageFeatured(eventId: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error: clearError } = await supabase
    .from("events")
    .update({ is_homepage_featured: false })
    .eq("is_homepage_featured", true);

  if (clearError) throw new Error(formatSchemaSetupError(clearError.message));

  const { error } = await supabase
    .from("events")
    .update({ is_homepage_featured: true })
    .eq("id", eventId);

  if (error) throw new Error(formatSchemaSetupError(error.message));
}

export async function clearEventHomepageFeatured(eventId: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("events")
    .update({ is_homepage_featured: false })
    .eq("id", eventId);

  if (error) throw new Error(formatSchemaSetupError(error.message));
}

export async function getAdminEvents(): Promise<PlatformEvent[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getPendingEvents(): Promise<PlatformEvent[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getEventBySlug(slug: string): Promise<PlatformEvent | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const event = mapRow(data);
  return isEventPubliclyVisible(event) ? event : null;
}

export async function createEvent(
  input: EventInput,
  options: {
    createdBy?: string;
    submitForApproval?: boolean;
    publishDirectly?: boolean;
    approverId?: string;
  } = {},
): Promise<PlatformEvent> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  let status: EventStatus = input.status ?? "draft";
  let approvedBy: string | undefined;
  let approvedAt: string | undefined;
  let submittedBy: string | undefined;

  if (options.publishDirectly) {
    status = "published";
    approvedBy = options.approverId;
    approvedAt = new Date().toISOString();
  } else if (options.submitForApproval) {
    status = "pending_approval";
    submittedBy = options.createdBy;
  }

  const { data, error } = await supabase
    .from("events")
    .insert(
      buildInsertPayload(
        { ...input, status },
        {
          createdBy: options.createdBy,
          submittedBy,
          approvedBy,
          approvedAt,
        },
      ),
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updateEvent(
  id: string,
  input: Partial<EventInput> & {
    status?: EventStatus;
    rejectionNote?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    submittedBy?: string | null;
  },
): Promise<PlatformEvent> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const payload: Record<string, unknown> = {};
  if (input.slug !== undefined) payload.slug = input.slug.trim().toLowerCase();
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description.trim() || null;
  if (input.seoDescription !== undefined) {
    payload.seo_description = input.seoDescription.trim() || null;
  }
  if (input.eventType !== undefined) payload.event_type = input.eventType;
  if (input.brand !== undefined) payload.brand = input.brand;
  if (input.startsAt !== undefined) payload.starts_at = input.startsAt;
  if (input.endsAt !== undefined) payload.ends_at = input.endsAt;
  if (input.timezone !== undefined) payload.timezone = input.timezone.trim() || "Africa/Lagos";
  if (input.location !== undefined) payload.location = input.location.trim() || null;
  if (input.locationType !== undefined) payload.location_type = input.locationType;
  if (input.coverImagePath !== undefined) payload.cover_image_path = input.coverImagePath;
  if (input.registrationUrl !== undefined) payload.registration_url = input.registrationUrl.trim() || null;
  if (input.registrationEmbedUrl !== undefined) {
    payload.registration_embed_url = input.registrationEmbedUrl.trim() || null;
  }
  if (input.paymentUrl !== undefined) payload.payment_url = input.paymentUrl.trim() || null;
  if (input.paymentLabel !== undefined) payload.payment_label = input.paymentLabel.trim() || null;
  if (input.status !== undefined) payload.status = input.status;
  if (input.manuallyHidden !== undefined) payload.manually_hidden = input.manuallyHidden;
  if (input.rejectionNote !== undefined) payload.rejection_note = input.rejectionNote;
  if (input.approvedBy !== undefined) payload.approved_by = input.approvedBy;
  if (input.approvedAt !== undefined) payload.approved_at = input.approvedAt;
  if (input.submittedBy !== undefined) payload.submitted_by = input.submittedBy;

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function logEventAudit(
  eventType: string,
  targetId: string,
  summary: Record<string, unknown>,
): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return;

  await supabase.rpc("log_audit_event", {
    p_event_type: eventType,
    p_target_type: "event",
    p_target_id: targetId,
    p_summary: summary,
  });
}

export function eventsToCsv(events: PlatformEvent[]): string {
  const headers = [
    "Title",
    "Slug",
    "Type",
    "Brand",
    "Status",
    "Starts",
    "Ends",
    "Timezone",
    "Location",
    "Registration URL",
    "Payment URL",
    "Created",
  ];

  const rows = events.map((event) =>
    [
      event.title,
      event.slug,
      event.eventType,
      event.brand,
      event.status,
      event.startsAt,
      event.endsAt,
      event.timezone,
      event.location ?? "",
      event.registrationUrl ?? "",
      event.paymentUrl ?? "",
      event.createdAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
