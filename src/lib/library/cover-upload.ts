import { tryGetSupabaseClient } from "@/lib/supabase/client";

const BUCKET = "book-covers";
const MAX_BYTES = 6 * 1024 * 1024;

export async function uploadBookCover(file: File, slug: string): Promise<string> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  if (!file.type.startsWith("image/")) {
    throw new Error("Cover image must be a JPEG, PNG, or WebP file.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Cover image must be 6 MB or smaller.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "book";
  const path = `${safeSlug}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);
  return path;
}
