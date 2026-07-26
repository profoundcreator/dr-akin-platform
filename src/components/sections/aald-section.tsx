"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const ecosystemTabs = [
  {
    id: "academy",
    label: "AALD Academy",
    title: "Develop leaders at every level",
    description:
      "Structured learning pathways for emerging managers, senior executives, and C-suite leaders — combining coaching, cohort learning, and applied practice.",
    highlights: [
      "Executive leadership programmes",
      "Manager acceleration tracks",
      "Certification pathways",
    ],
  },
  {
    id: "consulting",
    label: "Consulting",
    title: "Transform organisations with precision",
    description:
      "End-to-end corporate transformation engagements — from diagnostic assessments to culture redesign, change management, and sustained performance.",
    highlights: [
      "Organisational diagnostics",
      "Culture & values alignment",
      "Change leadership support",
    ],
  },
  {
    id: "community",
    label: "Community",
    title: "A network of purpose-driven leaders",
    description:
      "The AALD community connects executives, entrepreneurs, and changemakers across Africa for peer learning, mentorship, and collaborative impact.",
    highlights: [
      "Executive roundtables",
      "Mentorship circles",
      "Annual leadership summit",
    ],
  },
  {
    id: "media",
    label: "Media",
    title: "Ideas that reach beyond the boardroom",
    description:
      "Podcasts, publications, and digital content that extend Dr. Akin's frameworks to leaders who may never sit in a coaching room.",
    highlights: [
      "Leadership podcast series",
      "Weekly insights newsletter",
      "Digital learning library",
    ],
  },
];

export function AaldSection() {
  const [activeTab, setActiveTab] = useState(ecosystemTabs[0].id);
  const active = ecosystemTabs.find((tab) => tab.id === activeTab) ?? ecosystemTabs[0];

  return (
    <section className="ploy-section">
      <div className="ploy-container">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="space-y-6">
            <p className="ploy-kicker">AALD Ecosystem</p>
            <Heading as="h2" size="section" className="ploy-text-balance">
              A unified platform for leadership development
            </Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              The African Academy of Leadership Development (AALD) is Dr. Akin&apos;s
              integrated ecosystem — combining academy, consulting, community, and media
              to develop leaders who build lasting institutions.
            </p>

            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="AALD ecosystem areas"
            >
              {ecosystemTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`aald-panel-${tab.id}`}
                  id={`aald-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                      : "bg-[var(--ploy-interactive-secondary)] text-[var(--ploy-text-secondary)] hover:text-[var(--ploy-text-primary)]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              id={`aald-panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`aald-tab-${active.id}`}
              className="ploy-surface-elevated space-y-6 p-8 lg:p-10"
            >
              <div className="space-y-4">
                <Heading as="h3" size="card">
                  {active.title}
                </Heading>
                <p className="leading-relaxed text-[var(--ploy-text-secondary)]">
                  {active.description}
                </p>
              </div>

              <ul className="space-y-3">
                {active.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-[var(--ploy-text-primary)]"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ploy-background-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button variant="secondary" showArrow href="/aald">
                Explore {active.label}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
