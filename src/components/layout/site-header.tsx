"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_GROUPS, TOP_LEVEL_LINKS } from "@/lib/navigation";
import { openEnquiryModal } from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PERSON_IDENTITY } from "@/data/person-identity";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[var(--ploy-canvas-wide)] items-center justify-between gap-6 px-6 md:px-10 lg:px-14 xl:px-20">
        <a
          href="/"
          aria-label={`${PERSON_IDENTITY.publicName} — Home`}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ploy-border-accent)] focus-visible:ring-offset-2"
        >
          <BrandLogo variant="header" priority />
        </a>

        <nav className="hidden items-stretch gap-1 lg:flex" aria-label="Primary">
          {NAV_GROUPS.map((group) => (
            <div
              key={group.label}
              className="relative flex items-stretch"
              onMouseEnter={() => setOpenDropdown(group.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a
                href={group.href}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-[var(--ploy-text-secondary)] transition-colors hover:bg-[var(--ploy-background-secondary)] hover:text-[var(--ploy-text-primary)]"
                aria-expanded={openDropdown === group.label}
                aria-haspopup="true"
              >
                {group.label}
                <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
              </a>

              {openDropdown === group.label && (
                <div className="absolute left-0 top-full z-50 min-w-[20rem] animate-ploy-slide-down rounded-lg border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-2 shadow-[var(--ploy-shadow-md)]">
                  {group.links.map((link, index) => (
                    <div key={link.href}>
                      {link.group && link.group !== group.links[index - 1]?.group && (
                        <p className="px-3 pb-1 pt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                          {link.group}
                        </p>
                      )}
                      {link.disabled ? (
                        <div className="block rounded-md px-3 py-2.5 opacity-65" aria-disabled="true">
                          <span className="block text-sm font-medium text-[var(--ploy-text-primary)]">
                            {link.label}
                          </span>
                          {link.description && (
                            <span className="block text-xs text-[var(--ploy-text-secondary)]">
                              {link.description}
                            </span>
                          )}
                        </div>
                      ) : (
                        <a
                          href={link.href}
                          className="block rounded-md px-3 py-2.5 transition-colors hover:bg-[var(--ploy-background-secondary)]"
                        >
                          <span className="block text-sm font-medium text-[var(--ploy-text-primary)]">
                            {link.label}
                          </span>
                          {link.description && (
                            <span className="block text-xs text-[var(--ploy-text-secondary)]">
                              {link.description}
                            </span>
                          )}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {TOP_LEVEL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-lg px-4 text-sm font-medium text-[var(--ploy-text-secondary)] transition-colors hover:bg-[var(--ploy-background-secondary)] hover:text-[var(--ploy-text-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            showArrow
            className="group hidden sm:inline-flex"
            onClick={openEnquiryModal}
          >
            Inquire
          </Button>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[var(--ploy-radius-button)] border border-[var(--ploy-border-primary)] text-[var(--ploy-text-primary)] lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      </header>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto overscroll-y-contain bg-[var(--ploy-background-primary)] lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        aria-hidden={!mobileOpen}
      >
        <nav className="mx-auto max-w-[var(--ploy-container-max)] px-6 pb-10 pt-8 flex flex-col gap-6" aria-label="Mobile">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-3">
              <a
                href={group.href}
                className="ploy-eyebrow block"
                onClick={() => setMobileOpen(false)}
              >
                {group.label}
              </a>
              <ul className="space-y-1">
                {group.links.map((link, index) => (
                  <li key={link.href}>
                    {link.group && link.group !== group.links[index - 1]?.group && (
                      <p className="px-3 pb-1 pt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                        {link.group}
                      </p>
                    )}
                    {link.disabled ? (
                      <span className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--ploy-text-secondary)]" aria-disabled="true">
                        {link.label}
                      </span>
                    ) : (
                      <a
                        href={link.href}
                        className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--ploy-text-primary)] hover:bg-[var(--ploy-background-secondary)]"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3">
            <p className="ploy-eyebrow">Events</p>
            <ul className="space-y-1">
              {TOP_LEVEL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--ploy-text-primary)] hover:bg-[var(--ploy-background-secondary)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            showArrow
            className="group mt-4 w-full"
            onClick={() => {
              setMobileOpen(false);
              openEnquiryModal();
            }}
          >
            Inquire
          </Button>
        </nav>
      </div>
    </>
  );
}
