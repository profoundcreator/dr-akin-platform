"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { getPublicBookBySlug } from "@/lib/library/public-books";
import type { PlatformBook } from "@/lib/library/types";
import { sortPurchaseLinks } from "@/lib/library/purchase-links";
import { resolveContentSlug } from "@/lib/routing/resolve-content-slug";

interface LibraryBookPageProps {
  slug: string;
  initialBook?: PlatformBook | null;
}

function applyClientSeo(book: PlatformBook) {
  document.title = `${book.title} — Library`;

  const description = book.year
    ? `${book.title} by Akin Akinpelu, Ph.D., Amb., FLPi (${book.year})`
    : `${book.title} by Akin Akinpelu, Ph.D., Amb., FLPi`;

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

function BookDetail({ book }: { book: PlatformBook }) {
  const purchaseLinks = sortPurchaseLinks(book.purchaseLinks ?? []);

  return (
    <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-6">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="mx-auto w-full max-w-xs object-contain"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05} className="space-y-8">
            <div className="space-y-4">
              <p className="ploy-eyebrow">{book.category}</p>
              <Heading as="h1" size="section">
                {book.title}
              </Heading>
              {book.subtitle && (
                <p className="text-xl font-medium text-[var(--ploy-text-secondary)]">
                  {book.subtitle}
                </p>
              )}
              {book.year && (
                <p className="text-sm text-[var(--ploy-text-tertiary)]">Published {book.year}</p>
              )}
            </div>

            <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              {book.description}
            </p>

            <div className="space-y-4">
              <p className="ploy-eyebrow">Get this book</p>
              {purchaseLinks.length > 0 ? (
                <div className="flex max-w-xl flex-col gap-3">
                  {purchaseLinks.map((link, index) => (
                    <Button
                      key={link.url}
                      variant={index === 0 ? "primary" : "secondary"}
                      showArrow={index === 0}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full justify-center sm:w-auto sm:justify-start"
                    >
                      {link.label}
                    </Button>
                  ))}
                </div>
              ) : (
                <Button variant="primary" disabled className="w-full sm:w-auto">
                  Purchase link coming soon
                </Button>
              )}
            </div>

            <a href="/resources" className="ploy-text-link-underline inline-flex items-center gap-2">
              Back to library
              <ArrowRight className="size-4 rotate-180" aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function LibraryBookPage({ slug, initialBook = null }: LibraryBookPageProps) {
  const [book, setBook] = useState<PlatformBook | null>(initialBook);
  const [loading, setLoading] = useState(!initialBook);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const effectiveSlug = resolveContentSlug(slug, "library", initialBook?.slug);
    if (!effectiveSlug) {
      setBook(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    getPublicBookBySlug(effectiveSlug)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setBook(null);
          setNotFound(true);
          return;
        }
        setNotFound(false);
        setBook(data);
        applyClientSeo(data);
      })
      .catch(() => {
        if (!cancelled) {
          setBook(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, initialBook]);

  if (loading) {
    return (
      <PageShell>
        <section className="ploy-section">
          <div className="ploy-container">
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading book…</p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (notFound || !book) {
    return (
      <PageShell>
        <section className="ploy-section">
          <div className="ploy-container">
            <Heading as="h1" size="section">Book not found</Heading>
            <p className="mt-4 text-lg text-[var(--ploy-text-secondary)]">
              This title may have been moved, hidden, or is not yet published.
            </p>
            <a href="/resources" className="ploy-text-link-underline mt-6 inline-flex items-center gap-2">
              Back to library
              <ArrowRight className="size-4 rotate-180" aria-hidden="true" />
            </a>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BookDetail book={book} />
    </PageShell>
  );
}
