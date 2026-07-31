"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { getPublicHomepageInsights } from "@/lib/insights/public-insights";
import type { PlatformInsight } from "@/lib/insights/types";

export function CorporateTransformationSection() {
  const [insights, setInsights] = useState<PlatformInsight[]>([]);

  useEffect(() => {
    getPublicHomepageInsights().then(setInsights);
  }, []);

  if (insights.length === 0) return null;

  return (
    <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
        <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="ploy-eyebrow">Insights & writing</p>
          </div>
          <div>
            <Heading as="h2" size="section" className="ploy-text-balance">
              Ideas become durable when they are built into systems.
            </Heading>
            <div className="mt-7 flex items-end justify-between gap-8">
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
                Essays and field notes on leadership, execution, education reform, and the
                institutions that shape public life.
              </p>
              <a
                href="/insights"
                className="ploy-text-link-underline hidden shrink-0 md:block"
              >
                View all writing
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal stagger className="mt-14 grid border-l border-t border-[var(--ploy-border-primary)] md:grid-cols-3">
          {insights.map((item) => (
            <RevealItem key={item.slug}>
              <a
                href={`/insights/${item.slug}`}
                className="group flex min-h-[25rem] flex-col justify-between border-b border-r border-[var(--ploy-border-primary)] p-7 transition-colors duration-300 hover:bg-[var(--ploy-background-secondary)] md:p-9"
              >
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--ploy-text-secondary)]">
                    {item.category}
                  </p>
                  <Heading as="h3" size="card" className="mt-10">
                    {item.title}
                  </Heading>
                </div>
                <div>
                  <p className="leading-relaxed text-[var(--ploy-text-secondary)]">
                    {item.summary}
                  </p>
                  <ArrowUpRight
                    className="mt-8 size-5 transition-colors group-hover:text-[var(--ploy-accent-primary)]"
                    aria-hidden="true"
                  />
                </div>
              </a>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
