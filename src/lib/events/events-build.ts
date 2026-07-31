import { tryGetSupabaseClient } from "@/lib/supabase/client";
import type { PlatformEvent } from "@/lib/events/events";
import { isEventPubliclyVisible } from "@/lib/events/event-visibility";
import type { DbEvent } from "@/lib/supabase/database.types";

function mapBuildRow(row: DbEvent): PlatformEvent {
  return {
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
    isHomepageFeatured: row.is_homepage_featured,
    submittedBy: row.submitted_by,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionNote: row.rejection_note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchPublishedEventsForBuild(): Promise<PlatformEvent[]> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) return [];

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/events?select=*&status=eq.published&manually_hidden=eq.false&order=starts_at.asc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as DbEvent[];
    return data.map(mapBuildRow).filter(isEventPubliclyVisible);
  } catch {
    return [];
  }
}
