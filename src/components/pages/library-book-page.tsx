"use client";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

interface LibraryBookPageProps {
  book: { slug: string; title: string; year: string; category: string };
}

export function LibraryBookPage({ book }: LibraryBookPageProps) {
  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container">
          <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[240px_1fr]">
            <Reveal>
              <div className="aspect-[3/4] overflow-hidden rounded-[var(--ploy-radius-lg)] bg-[var(--ploy-background-tertiary)] shadow-[var(--ploy-shadow-md)]">
                <img
                  src={`/images/books/${book.slug}.svg`}
                  alt={`${book.title} cover`}
                  className="size-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.05} className="space-y-6">
              <div className="space-y-3">
                <p className="ploy-kicker">{book.category}</p>
                <Heading as="h1" size="section">
                  {book.title}
                </Heading>
                <p className="text-sm text-[var(--ploy-text-tertiary)]">Published {book.year}</p>
              </div>
              <p className="leading-relaxed text-[var(--ploy-text-secondary)]">
                A leadership resource from Dr. Akin Akinpelu — practical frameworks drawn from
                decades of executive coaching and organisational consulting.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" href="/book-dr-akin">
                  Invite Dr. Akin to speak
                </Button>
                <Button variant="secondary" href="/resources">
                  Back to library
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
