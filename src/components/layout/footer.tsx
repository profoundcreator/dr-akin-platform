"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { FOOTER_COLUMNS } from "@/lib/navigation";
import { openEnquiryModal } from "@/lib/enquiry";

export function Footer() {
  return (
    <footer className="bg-[var(--ploy-background-primary)]">
      <section className="bg-[var(--ploy-background-secondary)] px-6 py-16 md:px-10 md:py-24 lg:px-14 xl:px-20">
        <Reveal className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-10 rounded-xl border border-[var(--ploy-border-primary)] p-8 md:p-12 lg:grid-cols-[1fr_auto] lg:items-end lg:p-16">
          <div>
            <p className="ploy-eyebrow">Advisory · Keynotes · Transformation</p>
            <Heading as="h2" size="section" className="mt-6 max-w-4xl ploy-text-balance">
              Bring Dr. Akin into the room where the next system is being built.
            </Heading>
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            showArrow
            className="group shrink-0"
            onClick={openEnquiryModal}
          >
            Inquire for advisory
          </Button>
        </Reveal>
      </section>

      <div className="border-t border-[var(--ploy-border-primary)] px-6 py-14 md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-12 lg:grid-cols-[1.25fr_repeat(3,0.75fr)]">
          <div>
            <a
              href="/"
              className="text-xl font-semibold tracking-[-0.03em] text-[var(--ploy-text-primary)]"
            >
              Dr. Akin Akinpelu{" "}
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                Ph.D
              </span>
            </a>
            <p className="mt-5 max-w-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              Leadership strategist, educator, author, and marketplace-ministry leader
              across corporate, academic, and public spheres.
            </p>
            <div className="mt-6 text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              <p>+234 706 589 5185</p>
              <p>hello@theakinakinpelu.org</p>
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="ploy-eyebrow">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--ploy-text-secondary)] transition-colors hover:text-[var(--ploy-text-primary)]"
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--ploy-border-primary)] px-6 py-6 text-xs text-[var(--ploy-text-secondary)] md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto flex max-w-[var(--ploy-canvas-main)] flex-col gap-2 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Dr. Akin Akinpelu. All rights reserved.</p>
          <p>Executive Coach · Author · Corporate Transformation Strategist</p>
        </div>
      </div>
    </footer>
  );
}
