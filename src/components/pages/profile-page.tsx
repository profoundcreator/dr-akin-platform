"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { openEnquiryModal } from "@/lib/enquiry";
import { SITE_IMAGES } from "@/lib/media/site-images";
import { getPublicWorkOrgs } from "@/lib/work-orgs/public-orgs";
import type { PlatformWorkOrg } from "@/lib/work-orgs/types";

const PORTRAIT_URL = SITE_IMAGES.portrait;

const STATS = [
  { value: "700,000+", label: "Total reach across platforms, media, and leadership programmes" },
  { value: "15+", label: "Years of experience in leadership, education, and transformation" },
  { value: "First", label: "Position in several industry-standard rankings and recognitions" },
];

const CREDENTIALS = [
  {
    title: "Ph.D., Performance Leadership",
    description: "Doctoral qualification in performance leadership and institutional development.",
  },
  {
    title: "Honorary Doctorate",
    description: "Recognised for contributions to leadership education and public impact.",
  },
  {
    title: "Professor of Educational Leadership",
    description: "Academic leadership across executive education and governance reform.",
  },
  {
    title: "Forbes Thought Leader",
    description: "Published perspectives on leadership, execution, and organisational transformation.",
  },
];

const RECOGNITIONS = [
  "Member of the Nigerian Institute of Management",
  "Fellow of the Institute of Brand Management",
  "African Union Agenda 2063 Ambassador",
  "Advisor to governments, enterprises, and faith institutions",
];

const ECOSYSTEM_FALLBACK = [
  { label: "AALD", title: "Corporate Transformation", href: "/work/aald", description: "Leadership systems and institutional capability." },
  { label: "Erudio Hub", title: "Educational Reform", href: "/work/erudio-hub", description: "Systemic reform for nations and educators." },
  { label: "PERFORMX", title: "Execution Think Tank", href: "/work/performx", description: "Strategy-to-execution for operating teams." },
  { label: "TC Resource Tech", title: "Tech Alliances", href: "/work/tc-resource-technology", description: "Technology partnerships for scale." },
];

const GLOBAL_PLATFORMS = [
  "Paris", "Lagos", "London", "Johannesburg", "Nairobi", "Berlin", "Geneva", "Accra",
  "Dubai", "New York", "Abuja", "Cape Town",
];

const BOARDS = [
  { role: "Board Chair", org: "Reflop Homes" },
  { role: "Board Chair", org: "Recycling Research and Education Center (RREC)" },
  { role: "Ambassador, Political Affairs", org: "African Union Agenda 2063 Ambassadors Assembly" },
  { role: "Board Member", org: "GOTNI Leadership University" },
  { role: "Board Member", org: "J. Nissi Schools" },
  { role: "Board Member", org: "Myles Leadership University" },
  { role: "Advisor", org: "Numerous public sector, academic & non-profit institutions" },
];

export function ProfilePage() {
  const [ecosystem, setEcosystem] = useState(
    ECOSYSTEM_FALLBACK.map((item) => ({ ...item })),
  );

  useEffect(() => {
    getPublicWorkOrgs().then((orgs) => {
      if (orgs.length === 0) return;
      setEcosystem(
        orgs.map((org: PlatformWorkOrg) => ({
          label: org.brandLabel,
          title: org.pillarTitle,
          href: `/work/${org.slug}`,
          description: org.hubCardDescription,
        })),
      );
    });
  }, []);

  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow">
                Leadership Education & Professional Profile · Biography
              </p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                A globally recognized authority in leadership, education, and transformation.
              </Heading>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
                Dr. Akin Akinpelu Ph.D is an executive coach, author, and corporate transformation
                strategist working at the intersection of business, education, public policy, and
                marketplace ministry.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" showArrow onClick={openEnquiryModal}>
                  Connect with Dr. Akin
                </Button>
                <a href="/book-dr-akin" className="ploy-text-link-underline inline-flex items-center gap-2">
                  Download full profile
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="relative min-h-[28rem] border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] lg:min-h-[32rem] lg:border-l lg:border-t-0">
            <OptimizedImage
              src={PORTRAIT_URL}
              alt="Dr. Akin Akinpelu, Ph.D"
              priority
              width={960}
              height={1200}
              className="absolute inset-0 size-full object-cover object-top"
            />
            <p className="absolute bottom-6 left-6 text-sm text-[var(--ploy-text-secondary)] md:bottom-8 md:left-8">
              Dr. Akin Akinpelu, Ph.D
            </p>
            <div className="absolute right-0 top-0 h-24 w-3 bg-[var(--ploy-accent-primary)]" aria-hidden="true" />
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-12 md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-8 md:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal key={stat.value} delay={i * 0.05} className="space-y-2">
              <p className="text-3xl font-semibold tracking-tight md:text-4xl">{stat.value}</p>
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The Profile */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-10 lg:grid-cols-[0.3fr_1fr]">
          <Reveal>
            <Heading as="h2" size="section">The profile</Heading>
          </Reveal>
          <Reveal delay={0.05} className="space-y-6 text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
            <p>
              Dr. Akin Akinpelu is a leadership strategist, educator, and author whose work spans
              corporate boardrooms, classrooms, policy chambers, and faith-driven marketplace
              leadership — with a single through-line: building institutions that outlast their
              founders.
            </p>
            <p>
              As founder of the African Academy of Leadership Development (AALD) ecosystem, he
              partners with executives and enterprises to unlock human potential, drive cultural
              change, and deliver measurable business impact across Africa and beyond.
            </p>
            <p>
              A sought-after advisor to C-suite leaders, boards, and institutions, Dr. Akin has
              authored multiple books on leadership, execution, and institutional transformation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Credentials */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-12 lg:grid-cols-2">
          <Reveal className="space-y-8">
            <Heading as="h2" size="section">Credentials & recognition</Heading>
            <div className="space-y-6">
              {CREDENTIALS.map((item) => (
                <div key={item.title} className="space-y-2 border-t border-[var(--ploy-border-primary)] pt-6 first:border-t-0 first:pt-0">
                  <p className="font-semibold text-[var(--ploy-text-primary)]">{item.title}</p>
                  <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">{item.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="space-y-6">
            <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              In addition to his academic background, Dr. Akin is recognised for professional
              leadership across corporate, public, and faith sectors.
            </p>
            <ul className="space-y-4">
              {RECOGNITIONS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[var(--ploy-text-primary)]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--ploy-accent-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto mb-12 max-w-[var(--ploy-canvas-main)]">
          <Heading as="h2" size="section">Leadership across the ecosystem</Heading>
        </Reveal>
        <div className="mx-auto max-w-[var(--ploy-canvas-main)] border-t border-[var(--ploy-border-primary)]">
          {ecosystem.map((item, i) => (
            <Reveal key={item.href} delay={i * 0.05}>
              <div className="grid gap-4 border-b border-[var(--ploy-border-primary)] py-6 md:grid-cols-[0.2fr_1fr_auto] md:items-center md:gap-8">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ploy-text-secondary)]">{item.label}</p>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-[var(--ploy-text-secondary)]">{item.description}</p>
                </div>
                <a href={item.href} className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:decoration-[var(--ploy-text-primary)]">
                  View work
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Global platform */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto max-w-[var(--ploy-canvas-main)] space-y-10">
          <div className="max-w-3xl space-y-4">
            <Heading as="h2" size="section">A global platform</Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              Dr. Akin&apos;s work reaches leaders across continents — from executive boardrooms to
              public policy forums and faith communities worldwide.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {GLOBAL_PLATFORMS.map((city) => (
              <div key={city} className="border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-4 py-5 text-center text-sm font-semibold">
                {city}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Boards preview */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-10 lg:grid-cols-[0.35fr_1fr]">
          <Reveal>
            <Heading as="h2" size="section">Boards & advisory</Heading>
          </Reveal>
          <div className="border-t border-[var(--ploy-border-primary)]">
            {BOARDS.map((board, i) => (
              <Reveal key={`${board.role}-${board.org}`} delay={i * 0.04}>
                <div className="grid gap-2 border-b border-[var(--ploy-border-primary)] py-5 md:grid-cols-[auto_1fr] md:gap-6">
                  <span className="font-serif text-2xl text-[var(--ploy-text-tertiary)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--ploy-accent-primary)]">{board.role}</p>
                    <p className="font-medium">{board.org}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="mx-auto mt-10 max-w-[var(--ploy-canvas-main)]">
          <a href="/meet-akin/edu-governance" className="ploy-text-link-underline inline-flex items-center gap-2">
            View full board governance profile
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>
      </section>

      {/* Mission */}
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-neutral-inverse)] px-6 py-20 text-[var(--ploy-text-inverse)] md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto max-w-3xl space-y-6 text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ploy-accent-primary)]">Mission</p>
          <Heading as="h2" size="section" tone="inverse" className="ploy-text-balance">
            To discover, develop, and deploy people and systems to their full potential.
          </Heading>
          <p className="text-lg leading-relaxed text-[var(--ploy-text-inverse)]/75">
            Every engagement — whether coaching, speaking, or governance — is oriented toward
            building leaders and institutions that endure beyond the moment.
          </p>
        </Reveal>
      </section>
    </PageShell>
  );
}
