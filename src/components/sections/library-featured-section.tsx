"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

const catalog = [
  {
    title: "The Leadership Blueprint",
    category: "Leadership",
    year: "2024",
    cover: "/images/books/leadership-blueprint.svg",
  },
  {
    title: "Culture by Design",
    category: "Organisational Development",
    year: "2023",
    cover: "/images/books/culture-by-design.svg",
  },
  {
    title: "Executive Presence",
    category: "Personal Development",
    year: "2022",
    cover: "/images/books/executive-presence.svg",
  },
  {
    title: "Transform or Be Transformed",
    category: "Strategy",
    year: "2021",
    cover: "/images/books/transform-or-be-transformed.svg",
  },
  {
    title: "Leading Africa Forward",
    category: "Leadership",
    year: "2020",
    cover: "/images/books/leading-africa-forward.svg",
  },
  {
    title: "The Coaching Mindset",
    category: "Coaching",
    year: "2019",
    cover: "/images/books/coaching-mindset.svg",
  },
];

export function LibraryFeaturedSection() {
  const featured = catalog[0];

  return (
    <section className="ploy-section bg-[var(--ploy-background-secondary)]">
      <div className="ploy-container space-y-16">
        <Reveal className="max-w-3xl space-y-4">
          <p className="ploy-kicker">Library</p>
          <Heading as="h2" size="section" className="ploy-text-balance">
            Books and frameworks for modern leaders
          </Heading>
          <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
            Dr. Akin&apos;s published works distil decades of coaching and consulting
            experience into actionable frameworks for leaders at every stage.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid overflow-hidden rounded-[var(--ploy-radius-xl)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative aspect-[3/4] bg-[var(--ploy-background-tertiary)] lg:aspect-auto lg:min-h-[28rem]">
              <img
                src={featured.cover}
                alt={`${featured.title} book cover`}
                className="size-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
              <div className="space-y-3">
                <span className="ploy-kicker">Featured Publication</span>
                <Heading as="h3" size="section">
                  {featured.title}
                </Heading>
                <p className="text-sm text-[var(--ploy-text-tertiary)]">
                  {featured.category} · {featured.year}
                </p>
              </div>

              <p className="max-w-xl leading-relaxed text-[var(--ploy-text-secondary)]">
                A definitive guide for executives who want to move beyond management
                and into transformative leadership — with practical tools for building
                teams, shaping culture, and delivering results that endure.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" showArrow href="/library/leadership-blueprint">
                  Read more
                </Button>
                <Button variant="secondary" href="/resources">
                  View full catalog
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {catalog.map((book, index) => (
            <Reveal key={book.title} delay={index * 0.05}>
              <a
                href={`/library/${book.cover.split("/").pop()?.replace(".svg", "")}`}
                className="group block space-y-3"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-[var(--ploy-radius-md)] bg-[var(--ploy-background-tertiary)] shadow-[var(--ploy-shadow-sm)] transition-transform group-hover:-translate-y-1">
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-snug text-[var(--ploy-text-primary)] group-hover:text-[var(--ploy-text-accent)]">
                    {book.title}
                  </p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    {book.year}
                  </p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
