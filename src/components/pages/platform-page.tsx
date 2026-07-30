"use client";

import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import type { PageContent } from "@/data/site-content";

interface PlatformPageProps {
  content: PageContent;
  heroImage?: string;
  heroImageAlt?: string;
}

export function PlatformPage({ content, heroImage, heroImageAlt }: PlatformPageProps) {
  const hasHeroImage = Boolean(heroImage);

  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div
          className={`mx-auto max-w-[var(--ploy-canvas-wide)] ${
            hasHeroImage ? "grid lg:grid-cols-[1.08fr_0.92fr]" : ""
          }`}
        >
          <div
            className={`flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20 ${
              hasHeroImage ? "" : "max-w-4xl"
            }`}
          >
            <Reveal className="space-y-8">
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
                {content.cta && (
                  <Button variant="primary" showArrow href={content.cta.href}>
                    {content.cta.label}
                  </Button>
                )}
                {content.secondaryCta && (
                  <a href={content.secondaryCta.href} className="ploy-text-link-underline">
                    {content.secondaryCta.label}
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {hasHeroImage && heroImage && (
            <Reveal
              delay={0.15}
              className="relative min-h-[24rem] overflow-x-hidden border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] lg:min-h-full lg:border-l lg:border-t-0"
            >
              <img
                src={heroImage}
                alt={heroImageAlt ?? content.headline}
                loading="eager"
                className="absolute inset-0 size-full object-cover object-center"
              />
              <div
                className="absolute right-0 top-0 h-24 w-3 bg-[var(--ploy-accent-primary)]"
                aria-hidden="true"
              />
            </Reveal>
          )}
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)] space-y-12">
          {content.sections.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.05}>
              <div
                id={section.title.toLowerCase().replace(/\s+/g, "-")}
                className="max-w-3xl space-y-4 border-t border-[var(--ploy-border-primary)] pt-10 first:border-t-0 first:pt-0"
              >
                <Heading as="h2" size="card">
                  {section.title}
                </Heading>
                <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
                  {section.body}
                </p>
                {section.bullets && (
                  <ul className="space-y-3 pt-2">
                    {section.bullets.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[var(--ploy-text-primary)]"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--ploy-accent-primary)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}

          {content.relatedLinks && content.relatedLinks.length > 0 && (
            <Reveal>
              <div className="grid gap-4 border-t border-[var(--ploy-border-primary)] pt-10 sm:grid-cols-2">
                {content.relatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between border border-[var(--ploy-border-primary)] p-6 transition-colors hover:bg-[var(--ploy-background-secondary)]"
                  >
                    <span className="font-medium">{link.label}</span>
                    <ArrowUpRight className="size-4 text-[var(--ploy-text-secondary)] transition-colors group-hover:text-[var(--ploy-accent-primary)]" />
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
