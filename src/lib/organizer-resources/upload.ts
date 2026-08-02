import { organizerResourceError } from "./api";
import type { OrganizerResourceAudience, OrganizerResourceFile } from "./types";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "organizer-materials";
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function toLogicalKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uploadOrganizerResource(input: {
  file: File;
  title: string;
  category: string;
  audienceVariant: OrganizerResourceAudience;
  logicalKey?: string;
}): Promise<OrganizerResourceFile> {
  const { file } = input;
  const title = input.title.trim();
  const category = input.category.trim();
  const logicalKey = toLogicalKey(input.logicalKey || title);

  if (title.length < 2 || category.length < 2 || logicalKey.length < 2) {
    throw new Error("Title, category, and resource key must each contain at least two characters.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use PDF, ZIP, DOCX, JPEG, PNG, or WebP files only.");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("Organizer materials must be between 1 byte and 25 MB.");
  }

  const supabase = getSupabaseClient() as SupabaseClient;
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Your admin session has expired. Sign in again.");

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const objectPath = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw organizerResourceError(uploadError);

  const { data, error } = await supabase.rpc("register_organizer_resource", {
    p_logical_key: logicalKey,
    p_title: title,
    p_category: category,
    p_audience_variant: input.audienceVariant,
    p_file_name: file.name,
    p_object_path: objectPath,
    p_mime_type: file.type,
    p_size_bytes: file.size,
  });

  if (error) {
    await supabase.storage.from(BUCKET).remove([objectPath]);
    throw organizerResourceError(error);
  }

  return {
    id: data.id,
    logicalKey: data.logical_key,
    title: data.title,
    category: data.category,
    audienceVariant: data.audience_variant,
    version: data.version,
    fileName: data.file_name,
    objectPath: data.object_path,
    mimeType: data.mime_type,
    sizeBytes: data.size_bytes,
    status: data.status,
    isCurrent: data.is_current,
    createdBy: data.created_by,
    createdAt: data.created_at,
    retiredAt: data.retired_at,
  };
}
