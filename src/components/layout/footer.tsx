"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PERSON_IDENTITY } from "@/data/person-identity";
import { APPROVED_SOCIAL_LINKS, SITE_CONTACT } from "@/data/site-contact";
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
              Bring Akin into the room where the next system is being built.
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
        <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-12 lg:grid-cols-[1.25fr_repeat(4,0.75fr)]">
          <div>
            <a
              href="/"
              aria-label={`${PERSON_IDENTITY.publicName} — Home`}
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ploy-border-accent)] focus-visible:ring-offset-2"
            >
              <BrandLogo variant="footer" />
            </a>
            <p className="mt-4 text-sm font-medium text-[var(--ploy-text-primary)]">
              {PERSON_IDENTITY.publicName}
            </p>
            <p className="mt-5 max-w-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              Leadership scholar, governance strategist, diplomat, and institution builder
              working across Governance, Enterprise, and Education.
            </p>
            <div className="mt-6 text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              <p><a href={`tel:${SITE_CONTACT.phone.replace(/\s/g, "")}`}>{SITE_CONTACT.phone}</a></p>
              <p><a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a></p>
            </div>
            {APPROVED_SOCIAL_LINKS.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-4 text-sm">
                {APPROVED_SOCIAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--ploy-text-link)] hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
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
          <p>© {new Date().getFullYear()} {PERSON_IDENTITY.publicName}. All rights reserved.</p>
          <p>{PERSON_IDENTITY.auTitle}</p>
        </div>
      </div>
    </footer>
  );
}
