"use client";

import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { openEnquiryModal } from "@/lib/enquiry";
import { SITE_IMAGES } from "@/lib/media/site-images";
import { PERSON_IDENTITY, PUBLIC_NAME } from "@/data/person-identity";

const PORTRAIT_URL = SITE_IMAGES.portrait;

const STATS = [
  { value: PERSON_IDENTITY.metrics.peopleReached, label: "People reached through talks, training and coaching" },
  { value: PERSON_IDENTITY.metrics.countries, label: "Countries and counting—across global stages and executive rooms" },
  { value: "3", label: "Connected themes shaping leaders and institutions" },
];

const THEMES = [
  {
    letter: "a",
    title: "Governance & Leadership",
    description:
      "Ethical leadership, institutional capacity, public purpose and the decisions required to build societies that work.",
  },
  {
    letter: "b",
    title: "Enterprise Development",
    description:
      "Building productive organisations, resilient systems and leadership cultures that turn ambition into sustainable value.",
  },
  {
    letter: "c",
    title: "Education & Youth Empowerment",
    description:
      "Preparing educators, institutions and young Africans with the capacity, confidence and opportunity to shape the continent’s future.",
  },
];

const STAGES = [
  "KPMG",
  "Standard Bank",
  "Google",
  "PwC",
  "Microsoft",
  "First Bank",
  "Meta",
  "Zenith Bank",
  "NNPC",
  "British Council",
  "United Nations",
  "Lagos State Government",
];

export function SpeakingPage() {
  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow">
                {PUBLIC_NAME} · Keynote Speaker
              </p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                A speaker who moves rooms
                <span className="block text-[var(--ploy-text-secondary)]">
                  — from the main stage to the boardroom.
                </span>
              </Heading>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
                {PUBLIC_NAME} delivers keynotes, panel contributions, workshops and fireside
                conversations for conferences, corporate retreats, and leadership summits worldwide.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" showArrow href="/book-dr-akin">
                  Invite Akin Akinpelu
                </Button>
                <a href="/meet-akin/profile" className="ploy-text-link-underline inline-flex items-center gap-2">
                  About Akin
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="relative min-h-[28rem] border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] lg:min-h-[32rem] lg:border-l lg:border-t-0">
            <OptimizedImage
              src={PORTRAIT_URL}
              alt={`${PUBLIC_NAME} — keynote speaker`}
              priority
              width={960}
              height={1200}
              className="absolute inset-0 size-full object-cover object-top"
            />
            <div className="absolute right-0 top-0 h-24 w-3 bg-[var(--ploy-accent-primary)]" aria-hidden="true" />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-12 md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-8 md:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal key={stat.value} delay={i * 0.05} className="space-y-2">
              <p className="text-3xl font-semibold tracking-tight text-[var(--ploy-text-primary)] md:text-4xl">{stat.value}</p>
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-[0.35fr_1fr] lg:items-end">
            <Heading as="h2" size="section">Speaking themes</Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              Keynotes and executive sessions tailored to your audience, sector, and strategic moment.
            </p>
          </Reveal>
          <div className="border-t border-[var(--ploy-border-primary)]">
            {THEMES.map((theme, i) => (
              <Reveal key={theme.title} delay={i * 0.05}>
                <div className="grid gap-4 border-b border-[var(--ploy-border-primary)] py-8 md:grid-cols-[auto_1fr] md:gap-8">
                  <span className="font-serif text-3xl text-[var(--ploy-accent-primary)]">{theme.letter}.</span>
                  <div className="space-y-3">
                    <Heading as="h3" size="card">{theme.title}</Heading>
                    <p className="leading-relaxed text-[var(--ploy-text-secondary)]">{theme.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              Faith and church engagements remain supported through the booking flow and the
              dedicated Christian organiser profile; they are not presented as a fourth strategic
              pillar.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto max-w-[var(--ploy-canvas-main)] space-y-10">
          <div className="max-w-3xl space-y-4">
            <Heading as="h2" size="section">Stages & platforms</Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              Keynotes and trainings delivered for respected institutions globally — including
              government, enterprise, multilateral, and faith communities.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STAGES.map((stage) => (
              <div key={stage} className="border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-4 py-5 text-center text-sm font-semibold text-[var(--ploy-text-primary)]">
                {stage}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <Heading as="h2" size="section">Invite Akin Akinpelu to your engagement</Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              For keynotes, executive workshops, or corporate retreats — submit a structured
              invitation and our team will respond within 3–5 business days.
            </p>
            <p className="text-sm text-[var(--ploy-text-secondary)]">hello@theakinakinpelu.org</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" showArrow href="/book-dr-akin">
              Submit a speaking invitation
            </Button>
            <Button type="button" variant="secondary" onClick={openEnquiryModal}>
              Start an enquiry
            </Button>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
