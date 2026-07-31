import { LIBRARY_BOOKS, RESOURCE_SECTIONS, type LibraryBook } from "@/data/site-content";
import {
  getBookBySlugFromDb,
  getPublishedBooksFromDb,
} from "@/lib/library/books";
import type { PlatformBook } from "@/lib/library/types";

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
    purchaseLinks: book.purchaseLinks ?? [],
    isFeatured: Boolean(book.featured),
    sortOrder: 0,
    status: "published",
    manuallyHidden: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}

const STATIC_BOOKS = LIBRARY_BOOKS.map(staticBookToPlatform);

export async function getPublicBooks(): Promise<PlatformBook[]> {
  const fromDb = await getPublishedBooksFromDb();
  if (fromDb.length > 0) return fromDb;
  return STATIC_BOOKS;
}

export async function getPublicFeaturedBook(): Promise<PlatformBook | null> {
  const books = await getPublicBooks();
  return books.find((book) => book.isFeatured) ?? books[0] ?? null;
}

export async function getPublicCatalogBooks(): Promise<PlatformBook[]> {
  const books = await getPublicBooks();
  const featured = books.find((book) => book.isFeatured);
  if (!featured) return books;
  return books.filter((book) => book.id !== featured.id);
}

export async function getPublicBookBySlug(slug: string): Promise<PlatformBook | null> {
  const fromDb = await getBookBySlugFromDb(slug);
  if (fromDb) return fromDb;
  return STATIC_BOOKS.find((book) => book.slug === slug) ?? null;
}

export function booksForPublicResourceSection(
  books: PlatformBook[],
  sectionId: string,
): PlatformBook[] {
  const section = RESOURCE_SECTIONS.find((item) => item.id === sectionId);
  if (!section || !("bookCategory" in section)) return [];
  return books.filter((book) => book.category === section.bookCategory);
}
