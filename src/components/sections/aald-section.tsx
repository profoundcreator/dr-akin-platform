"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Reveal } from "@/components/ui/reveal";
import { SITE_IMAGES } from "@/lib/media/site-images";
import { getPublicWorkOrgs } from "@/lib/work-orgs/public-orgs";
import type { PlatformWorkOrg } from "@/lib/work-orgs/types";

const SYSTEM_VISUAL_URL = SITE_IMAGES.ecosystemVisual;

export function AaldSection() {
  const [ecosystemArms, setEcosystemArms] = useState<PlatformWorkOrg[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPublicWorkOrgs()
      .then((orgs) => {
        setEcosystemArms(orgs);
        setActiveIndex(0);
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || ecosystemArms.length === 0) return null;

  const activeItem = ecosystemArms[activeIndex] ?? ecosystemArms[0];

  return (
    <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
        <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <p className="ploy-eyebrow">The ecosystem</p>
          <Heading as="h2" size="section" className="ploy-text-balance">
            A connected system for building leaders, institutions, and public impact.
          </Heading>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="border-t border-[var(--ploy-border-primary)]">
            {ecosystemArms.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  className="grid w-full grid-cols-[1fr_auto] gap-5 border-b border-[var(--ploy-border-primary)] py-6 text-left"
                >
                  <span>
                    <span
                      className={`block text-xl font-semibold tracking-[-0.025em] transition-colors md:text-2xl ${
                        isActive
                          ? "text-[var(--ploy-text-primary)]"
                          : "text-[var(--ploy-text-secondary)]"
                      }`}
                    >
                      {item.pillarTitle}
                    </span>
                    <span className="mt-2 block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-text-secondary)]">
                      {item.brandLabel}
                    </span>
                  </span>
                  <ArrowUpRight
                    className={`mt-1 size-5 transition-colors ${
                      isActive
                        ? "text-[var(--ploy-accent-primary)]"
                        : "text-[var(--ploy-text-secondary)]"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          <Reveal className="relative overflow-x-hidden rounded-xl bg-[var(--ploy-neutral-inverse)]">
            <OptimizedImage
              src={SYSTEM_VISUAL_URL}
              alt="Abstract architectural forms representing durable institutional systems"
              width={1200}
              height={900}
              className="min-h-[36rem] w-full object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-lg bg-[var(--ploy-background-primary)]/95 p-6 backdrop-blur md:inset-x-8 md:bottom-8 md:p-8">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-text-secondary)]">
                {activeItem.brandLabel}
              </p>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-[var(--ploy-text-primary)]">
                {activeItem.hubCardDescription}
              </p>
              <a
                href={`/work/${activeItem.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:decoration-[var(--ploy-text-primary)]"
              >
                Explore platform
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
