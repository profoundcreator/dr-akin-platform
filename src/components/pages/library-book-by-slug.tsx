"use client";

import { LibraryBookPage } from "@/components/pages/library-book-page";

interface LibraryBookBySlugProps {
  slug: string;
}

export function LibraryBookBySlug({ slug }: LibraryBookBySlugProps) {
  return <LibraryBookPage slug={slug} />;
}
