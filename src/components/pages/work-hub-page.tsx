"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import type { PageContent } from "@/data/site-content";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { SITE_IMAGES } from "@/lib/media/site-images";
import { formatWorkOrgNumber } from "@/lib/work-orgs/mappers";
import { getPublicWorkOrgs } from "@/lib/work-orgs/public-orgs";
import type { PlatformWorkOrg } from "@/lib/work-orgs/types";

const WORK_PORTRAIT_URL = SITE_IMAGES.portrait;

interface WorkHubPageProps {
  content: PageContent;
  initialOrgs?: PlatformWorkOrg[];
}

export function WorkHubPage({ content, initialOrgs = [] }: WorkHubPageProps) {
  const [platforms, setPlatforms] = useState<PlatformWorkOrg[]>(initialOrgs);

  useEffect(() => {
    getPublicWorkOrgs().then(setPlatforms);
  }, []);

  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow max-w-2xl">{content.kicker}</p>
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
              {content.cta && (
                <Button variant="primary" showArrow href={content.cta.href}>
                  {content.cta.label}
                </Button>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.15} className="relative min-h-[28rem] overflow-x-hidden border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] lg:min-h-[32rem] lg:border-l lg:border-t-0">
            <OptimizedImage
              src={WORK_PORTRAIT_URL}
              alt="Dr. Akin Akinpelu"
              priority
              width={960}
              height={1200}
              className="absolute inset-0 size-full object-cover object-top"
            />
            <div className="absolute right-0 top-0 h-24 w-3 bg-[var(--ploy-accent-primary)]" aria-hidden="true" />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-neutral-inverse)] px-6 py-20 text-[var(--ploy-text-inverse)] md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <Reveal className="mb-14 max-w-3xl space-y-4">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ploy-text-inverse)]/60">
              The ecosystem
            </p>
            <Heading as="h2" size="section" tone="inverse" className="ploy-text-balance">
              Four operating arms. One integrated agenda.
            </Heading>
          </Reveal>

          <div className="border-t border-[var(--ploy-text-inverse)]/15">
            {platforms.map((platform, i) => (
              <Reveal key={platform.slug} delay={i * 0.05}>
                <div className="grid gap-6 border-b border-[var(--ploy-text-inverse)]/15 py-8 lg:grid-cols-[auto_1fr_auto] lg:items-start lg:gap-10">
                  <span className="font-serif text-3xl text-[var(--ploy-accent-primary)] md:text-4xl">
                    {formatWorkOrgNumber(platform.sortOrder)}
                  </span>
                  <div className="space-y-2">
                    <Heading as="h3" size="card" tone="inverse">
                      {platform.pillarTitle}
                    </Heading>
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-text-inverse)]/60">
                      {platform.brandLabel}
                    </p>
                    <p className="max-w-2xl leading-relaxed text-[var(--ploy-text-inverse)]/75">
                      {platform.hubCardDescription}
                    </p>
                  </div>
                  <a
                    href={`/work/${platform.slug}`}
                    className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-[var(--ploy-text-inverse)] underline decoration-[var(--ploy-text-inverse)]/30 underline-offset-4 transition-colors hover:decoration-[var(--ploy-text-inverse)]"
                  >
                    Launch platform
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {content.sections.map((section, i) => (
        <section
          key={section.title}
          className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20"
        >
          <Reveal delay={i * 0.05} className="mx-auto max-w-3xl space-y-4 lg:max-w-[var(--ploy-canvas-main)]">
            <p className="ploy-eyebrow">The approach</p>
            <Heading as="h2" size="section">
              {section.title}
            </Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">{section.body}</p>
          </Reveal>
        </section>
      ))}
    </PageShell>
  );
}
