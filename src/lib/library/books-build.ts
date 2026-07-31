import type { DbLibraryBook } from "@/lib/supabase/database.types";
import { LIBRARY_BOOKS, type LibraryBook } from "@/data/site-content";
import { getBookCoverUrl } from "@/lib/library/books";
import type { PlatformBook } from "@/lib/library/types";
import type { PurchaseLink } from "@/lib/library/purchase-links";

function mapBuildRow(row: DbLibraryBook): PlatformBook {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    year: row.year,
    category: row.category,
    description: row.description,
    coverImagePath: row.cover_image_path,
    coverUrl: getBookCoverUrl(row.cover_image_path) ?? "/images/books/leadership-blueprint.svg",
    purchaseLinks: Array.isArray(row.purchase_links) ? (row.purchase_links as PurchaseLink[]) : [],
    isFeatured: row.is_featured ?? false,
    sortOrder: row.sort_order,
    status: row.status,
    manuallyHidden: row.manually_hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchPublishedBooksForBuild(): Promise<PlatformBook[]> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) return [];

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/library_books?select=*&status=eq.published&manually_hidden=eq.false&order=sort_order.asc,title.asc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      },
    );

    if (!response.ok) return [];
    const data = (await response.json()) as DbLibraryBook[];
    return data.map(mapBuildRow);
  } catch {
    return [];
  }
}

function staticBookToPlatform(book: LibraryBook): PlatformBook {
  return {
    id: `static-${book.slug}`,
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle ?? null,
    year: book.year ?? null,
    category: book.category,
    description: book.description,
    coverImagePath: book.cover,
    coverUrl: book.cover,
    purchaseLinks: (book.purchaseLinks ?? []) as PurchaseLink[],
    isFeatured: Boolean(book.featured),
    sortOrder: 0,
    status: "published",
    manuallyHidden: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}

export function getStaticBookPaths(): PlatformBook[] {
  return LIBRARY_BOOKS.map(staticBookToPlatform);
}

export async function fetchAllBooksForBuild(): Promise<PlatformBook[]> {
  const fromDb = await fetchPublishedBooksForBuild();
  if (fromDb.length > 0) return fromDb;
  return getStaticBookPaths();
}
