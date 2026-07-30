"use client";

import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { LIBRARY_BOOKS } from "@/data/site-content";
import { sortPurchaseLinks } from "@/lib/library/purchase-links";

interface LibraryBookPageProps {
  slug: string;
}

export function LibraryBookPage({ slug }: LibraryBookPageProps) {
  const book = LIBRARY_BOOKS.find((entry) => entry.slug === slug);

  if (!book) {
    return (
      <PageShell>
        <section className="ploy-section">
          <div className="ploy-container">
            <Heading as="h1" size="section">Book not found</Heading>
            <a href="/resources" className="ploy-text-link-underline mt-6 inline-flex items-center gap-2">
              Back to library
              <ArrowRight className="size-4 rotate-180" aria-hidden="true" />
            </a>
          </div>
        </section>
      </PageShell>
    );
  }

  const purchaseLinks = sortPurchaseLinks(book.purchaseLinks ?? []);

  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
            <Reveal>
              <div className="overflow-hidden rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-6">
                <img
                  src={book.cover}
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
    </PageShell>
  );
}
