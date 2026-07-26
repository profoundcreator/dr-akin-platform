"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

const footerColumns = [
  {
    title: "Work",
    links: [
      { label: "Corporate Transformation", href: "/work/corporate-transformation" },
      { label: "Executive Coaching", href: "/work/executive-coaching" },
      { label: "Keynotes & Speaking", href: "/work/speaking" },
    ],
  },
  {
    title: "Meet Dr. Akin",
    links: [
      { label: "About", href: "/about" },
      { label: "Philosophy", href: "/about/philosophy" },
      { label: "Media & Press", href: "/about/media" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Library", href: "/library" },
      { label: "Insights", href: "/insights" },
      { label: "AALD Ecosystem", href: "/aald" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Book a Session", href: "/book" },
      { label: "General Enquiry", href: "/contact" },
      { label: "LinkedIn", href: "https://linkedin.com", external: true },
    ],
  },
];

export function Footer() {
  const handleInquire = () => {
    window.dispatchEvent(new CustomEvent("open-enquiry-modal"));
  };

  return (
    <footer className="border-t border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-secondary)]">
      <div className="ploy-container py-16 lg:py-20">
        <Reveal className="mb-16 overflow-hidden rounded-[var(--ploy-radius-xl)] bg-[var(--ploy-background-inverse)] px-8 py-12 text-[var(--ploy-text-inverse)] lg:px-12 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="ploy-kicker text-[var(--ploy-text-inverse)]/70">
                Ready to transform
              </p>
              <Heading as="h2" size="section" tone="inverse" className="ploy-text-balance">
                Partner with Dr. Akin to elevate leadership, culture, and performance.
              </Heading>
              <p className="max-w-xl text-base leading-relaxed text-[var(--ploy-text-inverse)]/75">
                Whether you need executive coaching, a keynote, or a full corporate
                transformation programme, begin with a conversation.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              showArrow
              className="group shrink-0 bg-[var(--ploy-background-elevated)] text-[var(--ploy-text-primary)] hover:bg-white"
              onClick={handleInquire}
            >
              Start an enquiry
            </Button>
          </div>
        </Reveal>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-sm font-semibold text-[var(--ploy-text-primary)]">
                {column.title}
              </p>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-[var(--ploy-text-secondary)] transition-colors hover:text-[var(--ploy-text-primary)]"
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                      {"external" in link && link.external && (
                        <ArrowRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="ploy-divider my-12" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--ploy-text-primary)]">
              Dr. Akin Akinpelu
            </p>
            <p className="text-sm text-[var(--ploy-text-tertiary)]">
              Executive Coach · Author · Corporate Transformation Strategist
            </p>
          </div>
          <p className="text-sm text-[var(--ploy-text-tertiary)]">
            © {new Date().getFullYear()} Dr. Akin Akinpelu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
