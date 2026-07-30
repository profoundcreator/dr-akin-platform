"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";

const FEATURED_BOOK_URL =
  "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/2cb19b46-slurp-2282d963-a2c158d4-the-agenda-the-rise-of-kings-and-priests.webp";

const catalog = [
  {
    title: "The Leadership Blueprint",
    slug: "leadership-blueprint",
    year: "2024",
    cover: "/images/books/leadership-blueprint.svg",
  },
  {
    title: "Culture by Design",
    slug: "culture-by-design",
    year: "2023",
    cover: "/images/books/culture-by-design.svg",
  },
  {
    title: "Executive Presence",
    slug: "executive-presence",
    year: "2022",
    cover: "/images/books/executive-presence.svg",
  },
  {
    title: "Transform or Be Transformed",
    slug: "transform-or-be-transformed",
    year: "2021",
    cover: "/images/books/transform-or-be-transformed.svg",
  },
  {
    title: "Leading Africa Forward",
    slug: "leading-africa-forward",
    year: "2020",
    cover: "/images/books/leading-africa-forward.svg",
  },
  {
    title: "The Coaching Mindset",
    slug: "coaching-mindset",
    year: "2019",
    cover: "/images/books/coaching-mindset.svg",
  },
];

export function LibraryFeaturedSection() {
  return (
    <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <Reveal>
            <p className="ploy-eyebrow">The library · Featured</p>
            <Heading as="h2" size="section" className="mt-7">
              The Agenda
            </Heading>
            <p className="mt-3 text-xl font-medium text-[var(--ploy-text-secondary)]">
              The Rise of Kings and Priests
            </p>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              A globally minded call to believers and leaders shaping culture, law,
              government, and business—a blueprint for stepping into the rooms where
              civilization is being formed.
            </p>
            <Button variant="primary" showArrow href="/resources" className="mt-9">
              Explore the book
            </Button>
          </Reveal>

          <Reveal delay={0.1} className="rounded-xl bg-[var(--ploy-background-secondary)] p-8 md:p-14">
            <img
              src={FEATURED_BOOK_URL}
              alt="The Agenda — The Rise of Kings and Priests"
              className="mx-auto w-full max-w-lg object-contain"
            />
          </Reveal>
        </div>

        <div className="mt-20 border-t border-[var(--ploy-border-primary)] pt-10">
          <div className="flex items-end justify-between gap-6">
            <Heading as="h3" size="card">
              The complete library
            </Heading>
            <a
              href="/resources"
              className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:decoration-[var(--ploy-text-primary)]"
            >
              View all titles
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <Reveal stagger className="mt-9 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
            {catalog.map((book) => (
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
  );
}
