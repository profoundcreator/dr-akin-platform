"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

const SYSTEM_VISUAL_URL =
  "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/3a077906-ai-generated-1784225940885.webp";

const ECOSYSTEM_ARMS = [
  {
    title: "Corporate Transformation",
    label: "AALD",
    href: "/work/aald",
    description:
      "Leadership systems and institutional capability designed to hold under pressure and compound over time.",
  },
  {
    title: "Educational Reform",
    label: "Erudio Hub",
    href: "/work/erudio-hub",
    description:
      "Systemic reform of how nations teach, govern schools, and develop the next generation of African educators.",
  },
  {
    title: "Execution Think Tank",
    label: "PERFORMX",
    href: "/work/performx",
    description:
      "A high-performance practice turning strategy into disciplined execution for leaders and operating teams.",
  },
  {
    title: "Tech Alliances",
    label: "TC Resource Tech",
    href: "/work/tc-resource-technology",
    description:
      "Technology partnerships and infrastructure extending the reach of every other arm of the ecosystem.",
  },
];

export function AaldSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = ECOSYSTEM_ARMS[activeIndex] ?? ECOSYSTEM_ARMS[0];

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
            {ECOSYSTEM_ARMS.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.title}
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
                      {item.title}
                    </span>
                    <span className="mt-2 block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-text-secondary)]">
                      {item.label}
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
            <img
              src={SYSTEM_VISUAL_URL}
              alt="Abstract architectural forms representing durable institutional systems"
              className="min-h-[36rem] w-full object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-lg bg-[var(--ploy-background-primary)]/95 p-6 backdrop-blur md:inset-x-8 md:bottom-8 md:p-8">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-text-secondary)]">
                {activeItem.label}
              </p>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-[var(--ploy-text-primary)]">
                {activeItem.description}
              </p>
              <a
                href={activeItem.href}
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
