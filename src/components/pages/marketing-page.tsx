"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { InsightArticleBody } from "@/components/insights/insight-article-body";
import {
  InsightArticleHero,
  InsightSourceAttribution,
} from "@/components/insights/insight-article-hero";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { formatInsightDate } from "@/lib/insights/articles";
import type { PageContent } from "@/data/site-content";

interface MarketingPageProps {
  content: PageContent;
}

export function MarketingPage({ content }: MarketingPageProps) {
  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container space-y-16">
          <Reveal className="max-w-3xl space-y-4">
            <p className="ploy-kicker">{content.kicker}</p>
            <Heading as="h1" size="section" className="ploy-text-balance">
              {content.headline}
            </Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)] ploy-text-pretty">
              {content.description}
            </p>
            {content.cta && (
              <Button variant="primary" showArrow href={content.cta.href}>
                {content.cta.label}
              </Button>
            )}
          </Reveal>

          {content.sections.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.05}>
              <div
                id={section.title.toLowerCase().replace(/\s+/g, "-")}
                className="ploy-surface-elevated max-w-3xl space-y-4 p-8"
              >
                <Heading as="h2" size="card">
                  {section.title}
                </Heading>
                <p className="leading-relaxed text-[var(--ploy-text-secondary)]">{section.body}</p>
                {section.bullets && (
                  <ul className="space-y-2">
                    {section.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm text-[var(--ploy-text-primary)]"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ploy-background-accent)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}

          {content.relatedLinks && content.relatedLinks.length > 0 && (
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.relatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between ploy-surface-elevated p-6 transition-all hover:-translate-y-0.5"
                  >
                    <span className="font-medium">{link.label}</span>
                    <ArrowUpRight className="size-4 text-[var(--ploy-text-accent)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </PageShell>
  );
}

interface InsightsIndexPageProps {
  articles: Array<{ slug: string; title: string; category: string; summary: string }>;
}

export function InsightsIndexPage({ articles }: InsightsIndexPageProps) {
  return (
    <PageShell>
      <section className="ploy-section bg-[var(--ploy-background-secondary)]">
        <div className="ploy-container space-y-12">
          <Reveal className="max-w-3xl space-y-4">
            <p className="ploy-kicker">Insights</p>
            <Heading as="h1" size="section">
              Essays and field notes on leadership
            </Heading>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {articles.map((item, i) => (
              <Reveal key={item.slug} delay={i * 0.05}>
                <a
                  href={`/insights/${item.slug}`}
                  className="group flex h-full flex-col justify-between gap-6 ploy-surface-elevated p-6 lg:p-8"
                >
                  <div className="space-y-4">
                    <span className="inline-block rounded-full bg-[var(--ploy-background-accent-muted)] px-3 py-1 text-xs font-medium text-[var(--ploy-text-accent)]">
                      {item.category}
                    </span>
                    <Heading as="h2" size="card">
                      {item.title}
                    </Heading>
                    <p className="text-sm text-[var(--ploy-text-secondary)]">{item.summary}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--ploy-text-accent)]">
                    Read insight
                    <ArrowUpRight className="size-4" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

interface InsightArticlePageProps {
  title: string;
  category: string;
  date: string;
  body: string;
  heroImageUrl?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
}

export function InsightArticlePage({
  title,
  category,
  date,
  body,
  heroImageUrl,
  sourceLabel,
  sourceUrl,
}: InsightArticlePageProps) {
  const displayDate = date.includes("T") ? formatInsightDate(date) : formatInsightDate(`${date}T12:00:00`);

  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container">
          <article className="mx-auto max-w-3xl space-y-8">
            <Reveal className="space-y-4">
              <p className="ploy-kicker">{category}</p>
              <Heading as="h1" size="section">
                {title}
              </Heading>
              {displayDate && (
                <p className="text-sm text-[var(--ploy-text-tertiary)]">{displayDate}</p>
              )}
              {sourceLabel && (
                <InsightSourceAttribution sourceLabel={sourceLabel} sourceUrl={sourceUrl} />
              )}
            </Reveal>
            {heroImageUrl && (
              <InsightArticleHero src={heroImageUrl} alt="" />
            )}
            <InsightArticleBody html={body} />
            <Button variant="ghost" href="/insights">
              <ArrowRight className="size-4 rotate-180" />
              Back to insights
            </Button>
          </article>
        </div>
      </section>
    </PageShell>
  );
}

interface ResourcesPageProps {
  books: Array<{ slug: string; title: string; year: string; category: string }>;
}

export function ResourcesPage({ books }: ResourcesPageProps) {
  const anchors = [
    { id: "marketplace-ministry", title: "Marketplace Ministry" },
    { id: "high-performance", title: "High Performance" },
    { id: "academic", title: "Academic Excellence" },
    { id: "audio", title: "Audio Archives" },
  ];

  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container space-y-16">
          <Reveal className="max-w-3xl space-y-4">
            <p className="ploy-kicker">Resources</p>
            <Heading as="h1" size="section">
              Library and leadership archives
            </Heading>
            <p className="text-lg text-[var(--ploy-text-secondary)]">
              Nine published titles and curated resources for leaders, educators, and practitioners.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {books.map((book, i) => (
              <Reveal key={book.slug} delay={i * 0.03}>
                <a href={`/library/${book.slug}`} className="group block space-y-3">
                  <div className="aspect-[3/4] overflow-hidden rounded-[var(--ploy-radius-md)] bg-[var(--ploy-background-tertiary)] shadow-[var(--ploy-shadow-sm)]">
                    <img
                      src={`/images/books/${book.slug}.svg`}
                      alt={`${book.title} cover`}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="text-sm font-medium group-hover:text-[var(--ploy-text-accent)]">
                    {book.title}
                  </p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">{book.year}</p>
                </a>
              </Reveal>
            ))}
          </div>

          {anchors.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.05}>
              <div id={a.id} className="ploy-surface-elevated scroll-mt-24 p-8">
                <Heading as="h2" size="card">
                  {a.title}
                </Heading>
                <p className="mt-3 text-[var(--ploy-text-secondary)]">
                  Curated materials in this category will be published here. Contact the team for
                  early access to selected resources.
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
