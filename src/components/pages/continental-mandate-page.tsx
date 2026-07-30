"use client";

import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { openEnquiryModal } from "@/lib/enquiry";

const STATS = [
  {
    value: "Agenda 2063",
    label: "The Africa We Want — the AU's strategic framework.",
  },
  {
    value: "Political",
    label: "Affairs, strategic engagement & governance advocacy.",
  },
  {
    value: "Continental",
    label: "Mandate spanning the African Union.",
  },
];

const APPROACH = [
  "Advance political affairs and governance advocacy across member states.",
  "Strengthen strategic engagement between policy and enterprise.",
  "Build institutional capacity that makes continental reform durable.",
];

const MANDATE = [
  {
    letter: "a",
    title: "Political Affairs",
    description:
      "Advocacy and engagement on governance reforms, political dialogue, and the institutional priorities that advance Agenda 2063 across member states.",
  },
  {
    letter: "b",
    title: "Strategic Engagement",
    description:
      "Connecting governments, institutions, and enterprise — ensuring continental policy translates into practical leadership and measurable outcomes.",
  },
  {
    letter: "c",
    title: "Governance Advocacy",
    description:
      "Championing accountability, capacity, and leadership standards that strengthen institutions and make Africa's transformation agenda durable.",
  },
];

export function ContinentalMandatePage() {
  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow">
                African Union Agenda 2063 · Ambassadorial Assembly
              </p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                Advancing governance and strategic engagement across Africa.
              </Heading>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
                As Ambassador for the African Union Agenda 2063 Ambassadors Assembly,
                Dr. Akin advances political affairs, strategic engagement, and governance
                advocacy — connecting continental policy to the leaders and institutions
                building Africa&apos;s future.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button type="button" variant="primary" showArrow onClick={openEnquiryModal}>
                  Inquire for engagement
                </Button>
                <a href="/meet-akin/profile" className="ploy-text-link-underline inline-flex items-center gap-2">
                  View full profile
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
              <p className="font-serif text-[4.5rem] leading-none text-[var(--ploy-border-primary)] md:text-[6.5rem]">
                2063
              </p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                Continental Mandate
              </p>
              <Heading as="p" size="card" className="mt-2">
                African Union
              </Heading>
            </div>
            <div className="border-t border-[var(--ploy-accent-primary)] pt-6">
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                Agenda 2063 — The Africa We Want
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-12 md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[var(--ploy-border-primary)]">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.value}
              delay={i * 0.05}
              className="space-y-2 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <p className="text-2xl font-semibold tracking-tight md:text-3xl">{stat.value}</p>
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-neutral-inverse)] px-6 py-20 text-[var(--ploy-text-inverse)] md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-12 lg:grid-cols-2">
          <Reveal className="space-y-6">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ploy-accent-primary)]">
              The approach
            </p>
            <Heading as="h2" size="section" tone="inverse" className="ploy-text-balance">
              A continental agenda needs leaders who connect policy to enterprise.
            </Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-inverse)]/75">
              Agenda 2063 is the African Union&apos;s blueprint for an integrated, prosperous,
              and peaceful continent. Dr. Akin&apos;s ambassadorial work sits at the intersection
              of governance, strategic engagement, and leadership development — ensuring the
              continent&apos;s aspirations connect to the institutions and people who execute them.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="space-y-8">
            {APPROACH.map((point, i) => (
              <div
                key={point}
                className="flex gap-6 border-t border-[var(--ploy-text-inverse)]/15 pt-6 first:border-t-0 first:pt-0"
              >
                <span className="font-serif text-2xl text-[var(--ploy-accent-primary)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-lg leading-relaxed text-[var(--ploy-text-inverse)]/90">{point}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-[0.35fr_1fr] lg:items-end">
            <Heading as="h2" size="section">The mandate</Heading>
            <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              Three focus areas through which the ambassadorial role advances Agenda 2063.
            </p>
          </Reveal>
          <div className="border-t border-[var(--ploy-border-primary)]">
            {MANDATE.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <div className="grid gap-4 border-b border-[var(--ploy-border-primary)] py-8 md:grid-cols-[auto_1fr] md:gap-8">
                  <span className="font-serif text-3xl text-[var(--ploy-accent-primary)]">
                    {item.letter}.
                  </span>
                  <div className="space-y-3">
                    <Heading as="h3" size="card">{item.title}</Heading>
                    <p className="leading-relaxed text-[var(--ploy-text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
