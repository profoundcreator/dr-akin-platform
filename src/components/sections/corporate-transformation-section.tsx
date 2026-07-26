"use client";

import { ArrowUpRight } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

const insights = [
  {
    title: "Culture as a Strategic Asset",
    summary:
      "How high-performing organisations embed values into daily decisions, not just boardroom slides.",
    tag: "Corporate Transformation",
    href: "/insights/culture-as-strategic-asset",
  },
  {
    title: "The Executive Mindset Shift",
    summary:
      "Why the transition from functional expert to enterprise leader demands a new identity, not just new skills.",
    tag: "Executive Coaching",
    href: "/insights/executive-mindset-shift",
  },
  {
    title: "Leading Through Disruption",
    summary:
      "Frameworks for maintaining clarity, trust, and momentum when markets and teams are under pressure.",
    tag: "Leadership",
    href: "/insights/leading-through-disruption",
  },
  {
    title: "Measuring Transformation ROI",
    summary:
      "Connecting people development initiatives to revenue, retention, and operational excellence.",
    tag: "Strategy",
    href: "/insights/measuring-transformation-roi",
  },
];

export function CorporateTransformationSection() {
  return (
    <section className="ploy-section bg-[var(--ploy-background-secondary)]">
      <div className="ploy-container space-y-12">
        <Reveal className="max-w-3xl space-y-4">
          <p className="ploy-kicker">Corporate Transformation</p>
          <Heading as="h2" size="section" className="ploy-text-balance">
            Insights for leaders navigating change at scale
          </Heading>
          <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
            Practical perspectives drawn from decades of executive coaching,
            organisational consulting, and real-world transformation programmes.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {insights.map((item, index) => (
            <Reveal key={item.href} delay={index * 0.08}>
              <a
                href={item.href}
                className="group flex h-full flex-col justify-between gap-6 ploy-surface-elevated p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--ploy-shadow-md)] lg:p-8"
              >
                <div className="space-y-4">
                  <span className="inline-block rounded-full bg-[var(--ploy-background-accent-muted)] px-3 py-1 text-xs font-medium text-[var(--ploy-text-accent)]">
                    {item.tag}
                  </span>
                  <Heading as="h3" size="card">
                    {item.title}
                  </Heading>
                  <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                    {item.summary}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--ploy-text-accent)]">
                  Read insight
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
