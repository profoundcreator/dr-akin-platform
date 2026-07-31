import { isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { DbLibraryBook, LibraryBookStatus } from "@/lib/supabase/database.types";
import type { PurchaseLink } from "@/lib/library/purchase-links";
import type { BookInput, PlatformBook } from "@/lib/library/types";
import { formatSchemaSetupError } from "@/lib/site-settings/schema-support";

function parsePurchaseLinks(value: unknown): PurchaseLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is PurchaseLink => {
      if (!item || typeof item !== "object") return false;
      const link = item as PurchaseLink;
      return typeof link.label === "string" && typeof link.url === "string";
    })
    .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
    .filter((link) => link.label && link.url);
}

export function getBookCoverUrl(coverImagePath: string | null): string | null {
  if (!coverImagePath) return null;
  if (
    coverImagePath.startsWith("http://") ||
    coverImagePath.startsWith("https://") ||
    coverImagePath.startsWith("/")
  ) {
    return coverImagePath;
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/book-covers/${coverImagePath}`;
}

function mapRow(row: DbLibraryBook): PlatformBook {
  const coverUrl = getBookCoverUrl(row.cover_image_path) ?? "/images/books/leadership-blueprint.svg";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    year: row.year,
    category: row.category,
    description: row.description,
    coverImagePath: row.cover_image_path,
    coverUrl,
    purchaseLinks: parsePurchaseLinks(row.purchase_links),
    isFeatured: row.is_featured ?? false,
    sortOrder: row.sort_order,
    status: row.status,
    manuallyHidden: row.manually_hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function slugifyBookTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function isValidBookSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

function isPublicBook(book: PlatformBook): boolean {
  return book.status === "published" && !book.manuallyHidden;
}

export async function getPublishedBooksFromDb(): Promise<PlatformBook[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("status", "published")
    .eq("manually_hidden", false)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapRow).filter(isPublicBook);
}

export async function getBookBySlugFromDb(slug: string): Promise<PlatformBook | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const book = mapRow(data);
  return isPublicBook(book) ? book : null;
}

export async function getAdminBooks(): Promise<PlatformBook[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return (data ?? []).map(mapRow);
}

export async function getPendingBooks(): Promise<PlatformBook[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return (data ?? []).map(mapRow);
}

export async function isPhase2SchemaReady(): Promise<boolean> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("library_books").select("id").limit(1);
  return !error;
}

function buildInsertPayload(
  input: BookInput,
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
    subtitle: input.subtitle?.trim() || null,
    year: input.year?.trim() || null,
    category: input.category.trim(),
    description: input.description.trim(),
    cover_image_path: input.coverImagePath ?? null,
    purchase_links: input.purchaseLinks ?? [],
    is_featured: false,
    sort_order: input.sortOrder ?? 0,
    status: input.status ?? "draft",
    manually_hidden: input.manuallyHidden ?? false,
    created_by: meta.createdBy ?? null,
    submitted_by: meta.submittedBy ?? null,
    approved_by: meta.approvedBy ?? null,
    approved_at: meta.approvedAt ?? null,
  };
}

export async function createBook(
  input: BookInput,
  options: {
    createdBy?: string;
    submitForApproval?: boolean;
    publishDirectly?: boolean;
    approverId?: string;
  } = {},
): Promise<PlatformBook> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  let status: LibraryBookStatus = input.status ?? "draft";
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
    .from("library_books")
    .insert(
      buildInsertPayload({ ...input, status }, {
        createdBy: options.createdBy,
        submittedBy,
        approvedBy,
        approvedAt,
      }),
    )
    .select("*")
    .single();

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return mapRow(data);
}

export async function updateBook(
  id: string,
  input: Partial<BookInput> & {
    status?: LibraryBookStatus;
    rejectionNote?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    submittedBy?: string | null;
  },
): Promise<PlatformBook> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const payload: Record<string, unknown> = {};
  if (input.slug !== undefined) payload.slug = input.slug.trim().toLowerCase();
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.subtitle !== undefined) payload.subtitle = input.subtitle.trim() || null;
  if (input.year !== undefined) payload.year = input.year.trim() || null;
  if (input.category !== undefined) payload.category = input.category.trim();
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.coverImagePath !== undefined) payload.cover_image_path = input.coverImagePath;
  if (input.purchaseLinks !== undefined) payload.purchase_links = input.purchaseLinks;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.status !== undefined) payload.status = input.status;
  if (input.manuallyHidden !== undefined) payload.manually_hidden = input.manuallyHidden;
  if (input.rejectionNote !== undefined) payload.rejection_note = input.rejectionNote;
  if (input.approvedBy !== undefined) payload.approved_by = input.approvedBy;
  if (input.approvedAt !== undefined) payload.approved_at = input.approvedAt;
  if (input.submittedBy !== undefined) payload.submitted_by = input.submittedBy;

  const { data, error } = await supabase
    .from("library_books")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return mapRow(data);
}

export async function deleteBookPermanently(id: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("library_books").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setBookFeatured(bookId: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error: clearError } = await supabase
    .from("library_books")
    .update({ is_featured: false })
    .eq("is_featured", true);

  if (clearError) throw new Error(formatSchemaSetupError(clearError.message));

  const { error } = await supabase
    .from("library_books")
    .update({ is_featured: true })
    .eq("id", bookId);

  if (error) throw new Error(formatSchemaSetupError(error.message));
}

export async function clearBookFeatured(bookId: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("library_books")
    .update({ is_featured: false })
    .eq("id", bookId);

  if (error) throw new Error(formatSchemaSetupError(error.message));
}

export async function logBookAudit(
  eventType: string,
  targetId: string,
  summary: Record<string, unknown>,
): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return;

  await supabase.rpc("log_audit_event", {
    p_event_type: eventType,
    p_target_type: "library_book",
    p_target_id: targetId,
    p_summary: summary,
  });
}

export function booksToCsv(books: PlatformBook[]): string {
  const headers = ["Title", "Slug", "Category", "Status", "Featured", "Year", "Created"];
  const rows = books.map((book) =>
    [
      book.title,
      book.slug,
      book.category,
      book.status,
      book.isFeatured ? "yes" : "no",
      book.year ?? "",
      book.createdAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
