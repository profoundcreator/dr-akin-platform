"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PERSON_IDENTITY } from "@/data/person-identity";
import { APPROVED_SOCIAL_LINKS, SITE_CONTACT } from "@/data/site-contact";
import { FOOTER_COLUMNS } from "@/lib/navigation";
import { openEnquiryModal } from "@/lib/enquiry";
import { openNewsletterModal } from "@/lib/newsletter-modal";

const footerLinkClassName =
  "text-sm text-[var(--ploy-text-secondary)] transition-colors hover:text-[var(--ploy-text-primary)]";

function FooterSocialLink({ link }: { link: { label: string; href: string } }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={footerLinkClassName}
      {...(link.label === "Twitter" ? { "aria-label": "X (Twitter)" } : {})}
    >
      {link.label}
    </a>
  );
}

function FooterSocialLinks({ links }: { links: readonly { label: string; href: string }[] }) {
  const rows = [links.slice(0, 2), links.slice(2, 4)];

  return (
    <ul className="mt-5 space-y-3 text-sm">
      {rows.map((pair) => (
        <li key={pair.map((link) => link.href).join("-")} className="flex flex-wrap items-center">
          {pair.map((link, index) => (
            <span key={link.href} className="inline-flex items-center">
              {index > 0 && (
                <span className="mx-2 text-[var(--ploy-text-secondary)]" aria-hidden="true">
                  ·
                </span>
              )}
              <FooterSocialLink link={link} />
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}

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
            <div className="flex items-center gap-2.5">
              <a
                href="/"
                aria-label={`${PERSON_IDENTITY.publicName} — Home`}
                className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ploy-border-accent)] focus-visible:ring-offset-2"
              >
                <BrandLogo variant="footerMark" />
              </a>
              <p className="ploy-eyebrow">Contact</p>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-[var(--ploy-text-secondary)]">
              <li>
                <a href={`tel:${SITE_CONTACT.phone.replace(/\s/g, "")}`}>{SITE_CONTACT.phone}</a>
              </li>
              <li>
                <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
              </li>
            </ul>

            {APPROVED_SOCIAL_LINKS.length > 0 && (
              <>
                <p className="ploy-eyebrow mt-5">Follow</p>
                <FooterSocialLinks links={APPROVED_SOCIAL_LINKS} />
              </>
            )}
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="ploy-eyebrow">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.action === "newsletter" ? (
                      <button
                        type="button"
                        onClick={openNewsletterModal}
                        className={footerLinkClassName}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className={footerLinkClassName}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </a>
                    )}
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
