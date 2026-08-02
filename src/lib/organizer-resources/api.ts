import { getStoredAccessToken } from "@/lib/booking/api";
import { tryGetSupabaseClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BookingResourceGrant,
  OrganizerGrantedResource,
  OrganizerResourceAudience,
  OrganizerResourceFile,
} from "./types";

export const ORGANIZER_RESOURCES_MIGRATION_ERROR =
  "Organizer resources are not available yet. Apply Supabase migration 018_organizer_resources.sql and refresh the Supabase schema cache.";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Organizer resource operation failed.";
}

export function organizerResourceError(error: unknown): Error {
  const message = errorMessage(error);
  const lower = message.toLowerCase();
  if (
    lower.includes("schema cache") ||
    lower.includes("could not find the function") ||
    lower.includes("does not exist") ||
    lower.includes("42p01") ||
    lower.includes("pgrst202") ||
    lower.includes("pgrst205")
  ) {
    return new Error(ORGANIZER_RESOURCES_MIGRATION_ERROR);
  }
  return new Error(message);
}

function requireSupabase(): SupabaseClient {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as SupabaseClient;
}

function mapResource(row: {
  id: string;
  logical_key: string;
  title: string;
  category: string;
  audience_variant: OrganizerResourceAudience;
  version: number;
  file_name: string;
  object_path: string;
  mime_type: string;
  size_bytes: number;
  status: "available" | "retired";
  is_current: boolean;
  created_by: string;
  created_at: string;
  retired_at: string | null;
}): OrganizerResourceFile {
  return {
    id: row.id,
    logicalKey: row.logical_key,
    title: row.title,
    category: row.category,
    audienceVariant: row.audience_variant,
    version: row.version,
    fileName: row.file_name,
    objectPath: row.object_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    isCurrent: row.is_current,
    createdBy: row.created_by,
    createdAt: row.created_at,
    retiredAt: row.retired_at,
  };
}

function mapGrant(row: {
  id: string;
  booking_request_id: string;
  resource_file_id: string;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  revoked_by: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
}): BookingResourceGrant {
  return {
    id: row.id,
    bookingRequestId: row.booking_request_id,
    resourceFileId: row.resource_file_id,
    grantedBy: row.granted_by,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at,
    revokedBy: row.revoked_by,
    revokedAt: row.revoked_at,
    revokeReason: row.revoke_reason,
  };
}

export async function listOrganizerResourceFiles(): Promise<OrganizerResourceFile[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("organizer_resource_files")
    .select("*")
    .order("category")
    .order("title")
    .order("version", { ascending: false });
  if (error) throw organizerResourceError(error);
  return (data ?? []).map(mapResource);
}

export async function listBookingResourceGrants(
  bookingRequestId: string,
): Promise<BookingResourceGrant[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("booking_resource_grants")
    .select("*")
    .eq("booking_request_id", bookingRequestId)
    .order("granted_at", { ascending: false });
  if (error) throw organizerResourceError(error);
  return (data ?? []).map(mapGrant);
}

export async function grantBookingResource(
  bookingRequestId: string,
  resourceFileId: string,
  expiresAt?: string,
): Promise<BookingResourceGrant> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc("grant_booking_resource", {
    p_booking_request_id: bookingRequestId,
    p_resource_file_id: resourceFileId,
    p_expires_at: expiresAt || undefined,
  });
  if (error) throw organizerResourceError(error);
  return mapGrant(data);
}

export async function revokeBookingResource(
  grantId: string,
  reason?: string,
): Promise<BookingResourceGrant> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc("revoke_booking_resource", {
    p_grant_id: grantId,
    p_reason: reason || undefined,
  });
  if (error) throw organizerResourceError(error);
  return mapGrant(data);
}

export async function retireOrganizerResource(
  resourceFileId: string,
): Promise<OrganizerResourceFile> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc("retire_organizer_resource", {
    p_resource_file_id: resourceFileId,
  });
  if (error) throw organizerResourceError(error);
  return mapResource(data);
}

export async function getOrganizerGrantedResources(
  reference: string,
  accessToken?: string | null,
): Promise<OrganizerGrantedResource[]> {
  const token = accessToken ?? getStoredAccessToken(reference);
  if (!token) return [];

  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc("get_organizer_resources", {
    p_reference: reference,
    p_access_token: token,
  });
  if (error) throw organizerResourceError(error);
  if (!data) return [];

  const payload = data as { resources?: OrganizerGrantedResource[] };
  return payload.resources ?? [];
}

export async function requestOrganizerResourceDownload(
  reference: string,
  resourceId: string,
  accessToken?: string | null,
): Promise<string> {
  const token = accessToken ?? getStoredAccessToken(reference);
  if (!token) throw new Error("Your booking access token is missing. Open the secure tracking link again.");

  const response = await fetch("/api/organizer-resource-download", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ reference, accessToken: token, resourceId }),
  });
  const payload = (await response.json()) as { signedUrl?: string; error?: string };
  if (!response.ok || !payload.signedUrl) {
    throw organizerResourceError(payload.error ?? "The secure download could not be created.");
  }
  return payload.signedUrl;
}
