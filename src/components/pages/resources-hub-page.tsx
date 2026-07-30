"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import type { PageContent } from "@/data/site-content";
import {
  FEATURED_BOOK,
  LIBRARY_CATALOG,
  RESOURCE_SECTIONS,
  booksForResourceSection,
} from "@/data/site-content";

interface ResourcesHubPageProps {
  content: PageContent;
}

export function ResourcesHubPage({ content }: ResourcesHubPageProps) {
  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow">{content.kicker}</p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                {content.headline}
                {content.headlineSecondary && (
                  <span className="block text-[var(--ploy-text-secondary)]">
                    {content.headlineSecondary}
                  </span>
                )}
              </Heading>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
                {content.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" showArrow href="#library">
                  Browse the library
                </Button>
                <a href="/insights" className="ploy-text-link-underline inline-flex items-center gap-2">
                  Insights & writing
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal
            delay={0.15}
            className="relative flex min-h-[28rem] flex-col justify-between border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-8 lg:min-h-[32rem] lg:border-l lg:border-t-0 lg:p-12"
          >
            <div>
              <p className="font-serif text-[6rem] leading-none text-[var(--ploy-border-primary)] md:text-[8rem]">
                09
              </p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                The Library
              </p>
              <Heading as="p" size="card" className="mt-2">
                Books & Archives
              </Heading>
            </div>
            <div className="border-t border-[var(--ploy-accent-primary)] pt-6">
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                Ideas worth building institutions around
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="library"
        className="scroll-mt-24 border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20"
      >
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <Reveal>
              <p className="ploy-eyebrow">The library · Featured</p>
              <Heading as="h2" size="section" className="mt-7">
                {FEATURED_BOOK.title}
              </Heading>
              {FEATURED_BOOK.subtitle && (
                <p className="mt-3 text-xl font-medium text-[var(--ploy-text-secondary)]">
                  {FEATURED_BOOK.subtitle}
                </p>
              )}
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
                {FEATURED_BOOK.description}
              </p>
              <Button variant="primary" showArrow href={`/library/${FEATURED_BOOK.slug}`} className="mt-9">
                Explore the book
              </Button>
            </Reveal>

            <Reveal delay={0.1} className="rounded-xl bg-[var(--ploy-background-secondary)] p-8 md:p-14">
              <img
                src={FEATURED_BOOK.cover}
                alt={`${FEATURED_BOOK.title}${FEATURED_BOOK.subtitle ? ` — ${FEATURED_BOOK.subtitle}` : ""}`}
                className="mx-auto w-full max-w-lg object-contain"
              />
            </Reveal>
          </div>

          <div className="mt-20 border-t border-[var(--ploy-border-primary)] pt-10">
            <Reveal className="flex items-end justify-between gap-6">
              <Heading as="h3" size="card">The complete library</Heading>
              <a
                href="#library"
                className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:decoration-[var(--ploy-text-primary)]"
              >
                {LIBRARY_CATALOG.length + 1} published titles
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </Reveal>

            <Reveal stagger className="mt-9 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
              {LIBRARY_CATALOG.map((book) => (
                <RevealItem key={book.slug}>
                  <a href={`/library/${book.slug}`} className="group block">
                    <div className="aspect-[2/3] overflow-x-hidden rounded-lg border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)]">
                      <img
                        src={book.cover}
                        alt={book.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-snug text-[var(--ploy-text-primary)]">
                      {book.title}
                    </p>
                  </a>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-[0.35fr_1fr] lg:items-end">
            <Heading as="h2" size="section">Resource collections</Heading>
            <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              Curated archives for marketplace leaders, high performers, educators, and teams.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {RESOURCE_SECTIONS.map((section, i) => {
              const sectionBooks = booksForResourceSection(section.id);
              const isAudio = section.id === "audio";

              return (
              <Reveal key={section.id} delay={i * 0.05}>
                <div
                  id={section.id}
                  className="scroll-mt-24 space-y-4 border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-8"
                >
                  <Heading as="h3" size="card">{section.title}</Heading>
                  <p className="leading-relaxed text-[var(--ploy-text-secondary)]">
                    {section.description}
                  </p>
                  {isAudio && (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-[var(--ploy-text-primary)]">
                        The Kingdom Catalyst on Spotify
                      </p>
                      <Button variant="primary" showArrow href="/resources/audio">
                        Open audio archives
                      </Button>
                    </div>
                  )}
                  {!isAudio && sectionBooks.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {sectionBooks.map((book) => (
                        <a key={book.slug} href={`/library/${book.slug}`} className="group block">
                          <div className="aspect-[2/3] overflow-hidden rounded-lg border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)]">
                            <img
                              src={book.cover}
                              alt={book.title}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                          <p className="mt-2 text-sm font-semibold leading-snug">{book.title}</p>
                        </a>
                      ))}
                    </div>
                  )}
                  {!isAudio && sectionBooks.length === 0 && (
                    <p className="text-sm text-[var(--ploy-text-secondary)]">
                      Titles for this collection will be added soon.
                    </p>
                  )}
                  {!isAudio && (
                  <ul className="space-y-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 text-sm text-[var(--ploy-text-primary)]"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ploy-accent-primary)]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  )}
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <Heading as="h2" size="section">Essays and field notes</Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              Practical perspectives on leadership, execution, education reform, and the institutions
              that shape public life.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" showArrow href="/insights">
              Read insights
            </Button>
            <a
              href="/insights"
              className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:decoration-[var(--ploy-text-primary)]"
            >
              View all writing
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
