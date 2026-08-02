"use client";

import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { openEnquiryModal } from "@/lib/enquiry";
import { AU_TITLE, PUBLIC_NAME } from "@/data/person-identity";

const STATS = [
  { value: "2", label: "Board chairmanships" },
  { value: "4+", label: "Board memberships & directorships" },
  { value: "Advisor", label: "To public, academic & non-profit institutions" },
];

const APPROACH = [
  "Stewardship for accountability and long-term institutional health.",
  "Bring strategic clarity, not just compliance, to the boardroom.",
  "Connect governance to measurable performance and reform.",
];

const BOARDS = [
  { role: "Board Chair", org: "Reflop Homes" },
  { role: "Board Chair", org: "Recycling Research and Education Center (RREC)" },
  { role: AU_TITLE, org: "African Union" },
  { role: "Board Member", org: "GOTNI Leadership University" },
  { role: "Board Member", org: "J. Nissi Schools" },
  { role: "Board Member", org: "Myles Leadership University" },
  { role: "Advisor", org: "Numerous public sector, academic & non-profit institutions" },
];

export function BoardGovernancePage() {
  return (
    <PageShell>
      {/* Hero — graphic column like Ploy */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow">
                Board Chair · Board Member · Institutional Advisor
              </p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                Governance leadership across enterprise, education, and the public sector.
              </Heading>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
                {PUBLIC_NAME} serves on boards and advisory bodies spanning housing, research,
                education and continental policy—bringing strategic clarity and long-term
                stewardship to every institution.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button type="button" variant="primary" showArrow onClick={openEnquiryModal}>
                  Inquire for advisory
                </Button>
                <a href="/meet-akin/profile" className="ploy-text-link-underline inline-flex items-center gap-2">
                  View full profile
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="relative flex min-h-[28rem] flex-col justify-between border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-8 lg:min-h-[32rem] lg:border-l lg:border-t-0 lg:p-12">
            <div>
              <p className="font-serif text-[6rem] leading-none text-[var(--ploy-border-primary)] md:text-[8rem]">07</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                Board Governance
              </p>
              <Heading as="p" size="card" className="mt-2">
                Boards & Advisory
              </Heading>
            </div>
            <div className="border-t border-[var(--ploy-accent-primary)] pt-6">
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                Stewardship · Accountability · Institutional health
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-12 md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-8 md:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal key={stat.value} delay={i * 0.05} className="space-y-2">
              <p className="text-3xl font-semibold tracking-tight md:text-4xl">{stat.value}</p>
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The Approach — dark */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-neutral-inverse)] px-6 py-20 text-[var(--ploy-text-inverse)] md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-12 lg:grid-cols-2">
          <Reveal className="space-y-6">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ploy-accent-primary)]">
              The approach
            </p>
            <Heading as="h2" size="section" tone="inverse" className="ploy-text-balance">
              Good governance is the quiet infrastructure behind every durable institution.
            </Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-inverse)]/75">
              Boards exist to ensure accountability, strategic clarity, and long-term institutional
              health—not merely compliance. {PUBLIC_NAME} brings this lens to every governance role.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="space-y-8">
            {APPROACH.map((point, i) => (
              <div key={point} className="flex gap-6 border-t border-[var(--ploy-text-inverse)]/15 pt-6 first:border-t-0 first:pt-0">
                <span className="font-serif text-2xl text-[var(--ploy-accent-primary)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-lg leading-relaxed text-[var(--ploy-text-inverse)]/90">{point}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Boards list */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto mb-12 grid max-w-[var(--ploy-canvas-main)] gap-6 lg:grid-cols-[0.35fr_1fr] lg:items-end">
          <Heading as="h2" size="section">Boards & advisory</Heading>
          <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
            Current and recent board roles across enterprise, education, and public institutions.
          </p>
        </Reveal>
        <div className="mx-auto max-w-[var(--ploy-canvas-main)] border-t border-[var(--ploy-border-primary)]">
          {BOARDS.map((board, i) => (
            <Reveal key={`${board.role}-${board.org}`} delay={i * 0.04}>
              <div className="grid gap-2 border-b border-[var(--ploy-border-primary)] py-6 md:grid-cols-[auto_1fr] md:gap-8">
                <span className="font-serif text-3xl text-[var(--ploy-text-tertiary)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--ploy-accent-primary)]">
                    {board.role}
                  </p>
                  <p className="mt-1 text-lg font-medium">{board.org}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
