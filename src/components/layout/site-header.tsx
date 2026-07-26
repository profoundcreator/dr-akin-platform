"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Work",
    links: [
      { label: "Corporate Transformation", href: "/work/corporate-transformation" },
      { label: "Executive Coaching", href: "/work/executive-coaching" },
      { label: "Keynotes & Speaking", href: "/work/speaking" },
    ],
  },
  {
    label: "Meet Dr. Akin",
    links: [
      { label: "About", href: "/about" },
      { label: "Philosophy", href: "/about/philosophy" },
      { label: "Media & Press", href: "/about/media" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Library", href: "/library" },
      { label: "Insights", href: "/insights" },
      { label: "AALD Ecosystem", href: "/aald" },
    ],
  },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleInquire = () => {
    window.dispatchEvent(new CustomEvent("open-enquiry-modal"));
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)]/90 backdrop-blur-md">
      <div className="ploy-container flex h-full items-center justify-between gap-6">
        <a
          href="/"
          className="shrink-0 text-lg font-semibold tracking-[var(--ploy-tracking-tight)] text-[var(--ploy-text-primary)]"
        >
          Dr. Akin Akinpelu
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navGroups.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(group.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-[var(--ploy-radius-md)] px-3 py-2 text-sm font-medium text-[var(--ploy-text-secondary)] transition-colors hover:bg-[var(--ploy-interactive-secondary)] hover:text-[var(--ploy-text-primary)]"
                aria-expanded={openDropdown === group.label}
                aria-haspopup="true"
              >
                {group.label}
                <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
              </button>

              {openDropdown === group.label && (
                <div className="absolute left-0 top-full z-50 min-w-[15rem] animate-ploy-slide-down rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] p-2 shadow-[var(--ploy-shadow-md)]">
                  {group.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="block rounded-[var(--ploy-radius-md)] px-3 py-2.5 text-sm text-[var(--ploy-text-secondary)] transition-colors hover:bg-[var(--ploy-interactive-secondary)] hover:text-[var(--ploy-text-primary)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            showArrow
            className="group hidden sm:inline-flex"
            onClick={handleInquire}
          >
            Inquire
          </Button>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] text-[var(--ploy-text-primary)] lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-20 z-40 bg-[var(--ploy-background-primary)] lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        aria-hidden={!mobileOpen}
      >
        <nav className="ploy-container flex flex-col gap-6 py-8" aria-label="Mobile">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="ploy-kicker">{group.label}</p>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="block rounded-[var(--ploy-radius-md)] px-3 py-2.5 text-base font-medium text-[var(--ploy-text-primary)] hover:bg-[var(--ploy-interactive-secondary)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Button
            variant="primary"
            size="lg"
            showArrow
            className="group mt-4 w-full"
            onClick={() => {
              setMobileOpen(false);
              handleInquire();
            }}
          >
            Inquire
          </Button>
        </nav>
      </div>
    </header>
  );
}
