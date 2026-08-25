"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { HelpCenterRenderer } from "@/components/admin/help-center-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ADMIN_QUICK_LINKS,
  filterHelpSections,
  HELP_CENTER_SECTIONS,
  POPULAR_HELP_SECTION_IDS,
  searchHelp,
} from "@/lib/admin/help-center-content";
import type { HelpSection } from "@/lib/admin/help-center-parser";
import { cn } from "@/lib/utils";

function getAdminLinkForSection(sectionId: string) {
  return ADMIN_QUICK_LINKS.find((link) => link.sectionId === sectionId);
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${sectionId}`);
}

export function HelpCenterDashboard() {
  const [query, setQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string>(
    HELP_CENTER_SECTIONS[0]?.id ?? "",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredSections = useMemo(
    () => filterHelpSections(query),
    [query],
  );

  const searchResults = useMemo(() => searchHelp(query), [query]);

  const popularSections = useMemo(
    () =>
      POPULAR_HELP_SECTION_IDS.map((id) =>
        HELP_CENTER_SECTIONS.find((section) => section.id === id),
      ).filter((section): section is HelpSection => Boolean(section)),
    [],
  );

  const navigateToSection = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    setMobileNavOpen(false);
    requestAnimationFrame(() => scrollToSection(sectionId));
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && HELP_CENTER_SECTIONS.some((section) => section.id === hash)) {
      setActiveSectionId(hash);
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target.id) {
          setActiveSectionId(top.target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] },
    );

    for (const section of HELP_CENTER_SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [filteredSections.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeIndex = filteredSections.findIndex((section) => section.id === activeSectionId);
  const previousSection = activeIndex > 0 ? filteredSections[activeIndex - 1] : null;
  const nextSection =
    activeIndex >= 0 && activeIndex < filteredSections.length - 1
      ? filteredSections[activeIndex + 1]
      : null;

  return (
    <AdminLayoutShell
      title="Help Center"
      subtitle="Search guides, browse topics, and jump straight to any back-office page."
    >
      <div className="space-y-6">
        <section className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-4 sm:p-5">
          <label htmlFor="help-search" className="sr-only">
            Search help
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ploy-text-tertiary)]" />
            <Input
              ref={searchRef}
              id="help-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help… try “publish”, “hide image”, “requests”, or “migration”"
              className="h-12 pl-10 pr-24"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {query && (
                <button
                  type="button"
                  className="rounded-full p-1 text-[var(--ploy-text-tertiary)] hover:text-[var(--ploy-text-primary)]"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X className="size-4" />
                </button>
              )}
              <kbd className="hidden rounded border border-[var(--ploy-border-subtle)] px-2 py-0.5 text-xs text-[var(--ploy-text-tertiary)] sm:inline">
                /
              </kbd>
            </div>
          </div>

          {query && (
            <p className="mt-3 text-sm text-[var(--ploy-text-tertiary)]">
              {filteredSections.length === 0
                ? "No matching topics. Try a shorter phrase like “draft”, “inbox”, or “team”."
                : `${filteredSections.length} topic${filteredSections.length === 1 ? "" : "s"} · ${searchResults.length} match${searchResults.length === 1 ? "" : "es"}`}
            </p>
          )}

          {!query && (
            <div className="mt-4 flex flex-wrap gap-2">
              {popularSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="rounded-full border border-[var(--ploy-border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--ploy-text-secondary)] transition-colors hover:border-[var(--ploy-border-accent)] hover:text-[var(--ploy-text-primary)]"
                  onClick={() => navigateToSection(section.id)}
                >
                  {section.title.replace(/^\d+\.\s*/, "")}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--ploy-text-primary)]">
                Open a back-office page
              </h2>
              <p className="mt-1 text-xs text-[var(--ploy-text-tertiary)]">
                Jump to the tool you need, or read its guide below.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {ADMIN_QUICK_LINKS.map(({ label, href, icon: Icon, sectionId, description }) => (
              <div
                key={href}
                className="flex items-center gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] p-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--ploy-radius-md)] bg-[var(--ploy-background-secondary)]">
                  <Icon className="size-4 text-[var(--ploy-text-secondary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--ploy-text-primary)]">{label}</p>
                  <p className="truncate text-xs text-[var(--ploy-text-tertiary)]">{description}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button href={href} size="sm" variant="secondary" className="h-8 px-2 text-xs">
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => navigateToSection(sectionId)}
                  >
                    Guide
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <aside className="xl:sticky xl:top-6 xl:w-72 xl:shrink-0">
            <div className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left xl:cursor-default"
                onClick={() => setMobileNavOpen((open) => !open)}
                aria-expanded={mobileNavOpen}
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--ploy-text-primary)]">Topics</p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    {filteredSections.length} section{filteredSections.length === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-[var(--ploy-text-tertiary)] transition-transform xl:hidden",
                    mobileNavOpen && "rotate-180",
                  )}
                />
              </button>

              <nav
                className={cn(
                  "max-h-[24rem] overflow-y-auto border-t border-[var(--ploy-border-subtle)] px-2 py-2 xl:block xl:max-h-[calc(100vh-12rem)]",
                  mobileNavOpen ? "block" : "hidden",
                )}
                aria-label="Help topics"
              >
                {filteredSections.map((section) => {
                  const adminLink = getAdminLinkForSection(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => navigateToSection(section.id)}
                      className={cn(
                        "flex w-full flex-col rounded-[var(--ploy-radius-md)] px-3 py-2 text-left transition-colors",
                        activeSectionId === section.id
                          ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                          : "text-[var(--ploy-text-secondary)] hover:bg-[var(--ploy-interactive-secondary)] hover:text-[var(--ploy-text-primary)]",
                      )}
                    >
                      <span className="text-sm font-medium">{section.title}</span>
                      {adminLink && (
                        <span
                          className={cn(
                            "mt-0.5 text-xs",
                            activeSectionId === section.id
                              ? "text-[var(--ploy-text-inverse)]/80"
                              : "text-[var(--ploy-text-tertiary)]",
                          )}
                        >
                          Opens {adminLink.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-8">
            {filteredSections.length === 0 ? (
              <div className="rounded-[var(--ploy-radius-lg)] border border-dashed border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-8 text-center">
                <BookOpen className="mx-auto size-8 text-[var(--ploy-text-tertiary)]" />
                <p className="mt-3 text-sm font-medium text-[var(--ploy-text-primary)]">
                  No help topics matched your search
                </p>
                <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">
                  Clear the search box or try words like “publish”, “image”, “role”, or “inbox”.
                </p>
                <Button className="mt-4" variant="secondary" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </div>
            ) : (
              filteredSections.map((section) => {
                const adminLink = getAdminLinkForSection(section.id);
                return (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-5 sm:p-6"
                  >
                    <div className="mb-5 flex flex-col gap-3 border-b border-[var(--ploy-border-subtle)] pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="ploy-kicker">Guide</p>
                        <h2 className="text-lg font-semibold tracking-tight text-[var(--ploy-text-primary)]">
                          {section.title}
                        </h2>
                      </div>
                      {adminLink && (
                        <Button href={adminLink.href} size="sm" className="shrink-0">
                          Open {adminLink.label}
                          <ExternalLink className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <HelpCenterRenderer
                      blocks={section.blocks}
                      onNavigate={navigateToSection}
                      highlight={query}
                    />
                  </article>
                );
              })
            )}

            {filteredSections.length > 0 && (
              <div className="flex flex-col gap-3 rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-4 sm:flex-row sm:justify-between">
                {previousSection ? (
                  <Button
                    variant="secondary"
                    className="justify-start"
                    onClick={() => navigateToSection(previousSection.id)}
                  >
                    <ArrowRight className="size-4 rotate-180" />
                    Previous: {previousSection.title}
                  </Button>
                ) : (
                  <span />
                )}
                {nextSection && (
                  <Button
                    variant="secondary"
                    className="justify-end sm:ml-auto"
                    onClick={() => navigateToSection(nextSection.id)}
                  >
                    Next: {nextSection.title}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
