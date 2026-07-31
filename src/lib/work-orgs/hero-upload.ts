import { tryGetSupabaseClient } from "@/lib/supabase/client";

const BUCKET = "work-org-assets";
const MAX_BYTES = 6 * 1024 * 1024;

export async function uploadWorkOrgHero(file: File, slug: string): Promise<string> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  if (!file.type.startsWith("image/")) {
    throw new Error("Hero image must be a JPEG, PNG, WebP, or SVG file.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Hero image must be 6 MB or smaller.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "work-org";
  const path = `${safeSlug}-hero-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);
  return path;
}
