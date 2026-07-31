"use client";

import { LibraryBookPage } from "@/components/pages/library-book-page";
import type { PlatformBook } from "@/lib/library/types";

interface LibraryBookBySlugProps {
  slug: string;
  initialBook?: PlatformBook | null;
}

export function LibraryBookBySlug({ slug, initialBook = null }: LibraryBookBySlugProps) {
  return <LibraryBookPage slug={slug} initialBook={initialBook} />;
}
