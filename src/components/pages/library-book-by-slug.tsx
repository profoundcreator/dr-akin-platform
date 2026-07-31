"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { getPublicBookBySlug } from "@/lib/library/public-books";
import type { PlatformBook } from "@/lib/library/types";
import { LibraryBookPage } from "@/components/pages/library-book-page";

interface LibraryBookBySlugProps {
  slug: string;
}

function applyClientSeo(book: PlatformBook) {
  document.title = `${book.title} — Library`;

  const description = book.year
    ? `${book.title} by Dr. Akin Akinpelu (${book.year})`
    : `${book.title} by Dr. Akin Akinpelu`;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${book.title} — Library`);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", description);

  if (book.coverUrl) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", book.coverUrl);
  }
}

export function LibraryBookBySlug({ slug }: LibraryBookBySlugProps) {
  const [book, setBook] = useState<PlatformBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug.trim()) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    getPublicBookBySlug(slug)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setBook(data);
        applyClientSeo(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading book…</p>
        </section>
      </PageShell>
    );
  }

  if (notFound || !book) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-xl space-y-6">
            <Heading as="h1" size="section">Book not found</Heading>
            <p className="text-lg text-[var(--ploy-text-secondary)]">
              This title may have been moved or is not yet published.
            </p>
            <Button variant="secondary" href="/resources">
              Back to library
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return <LibraryBookPage slug={slug} initialBook={book} />;
}
