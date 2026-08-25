"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { HelpCenterDetailPanel } from "@/components/admin/help-center-detail-panel";
import { HelpCenterTopicNav } from "@/components/admin/help-center-topic-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  filterGuidesByQuery,
  getHelpGuideById,
  HELP_GUIDES,
  HELP_ROLE_OPTIONS,
  type HelpGuide,
} from "@/lib/admin/help-center-guides";
import { HELP_CENTER_SECTIONS } from "@/lib/admin/help-center-content";
import { ADMIN_ROLE_LABELS } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const DEFAULT_GUIDE_ID = "how-to-use-this-document";

function getMarkdownSection(guideId: string) {
  return HELP_CENTER_SECTIONS.find((section) => section.id === guideId);
}

export function HelpCenterDashboard() {
  const { profile } = useAdminAuth();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeGuideId, setActiveGuideId] = useState<string>(DEFAULT_GUIDE_ID);
  const [roleLens, setRoleLens] = useState<AdminRole | "all">("all");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const viewerRole = profile?.role ?? null;
  const roleInitialized = useRef(false);

  useEffect(() => {
    if (viewerRole && !roleInitialized.current) {
      setRoleLens(viewerRole);
      roleInitialized.current = true;
    }
  }, [viewerRole]);

  const filteredGuides = useMemo(
    () => filterGuidesByQuery(HELP_GUIDES, query),
    [query],
  );

  const activeGuide = useMemo(
    () => getHelpGuideById(activeGuideId) ?? getHelpGuideById(DEFAULT_GUIDE_ID),
    [activeGuideId],
  );

  const activeIndex = filteredGuides.findIndex((guide) => guide.id === activeGuide?.id);
  const previousGuide = activeIndex > 0 ? filteredGuides[activeIndex - 1] : null;
  const nextGuide =
    activeIndex >= 0 && activeIndex < filteredGuides.length - 1
      ? filteredGuides[activeIndex + 1]
      : null;

  const selectGuide = useCallback((guideId: string) => {
    setActiveGuideId(guideId);
    setMobilePanelOpen(true);
    window.history.replaceState(null, "", `#${guideId}`);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && getHelpGuideById(hash)) {
      setActiveGuideId(hash);
      setMobilePanelOpen(true);
    }
  }, []);

  useEffect(() => {
    if (filteredGuides.length === 0) return;
    if (!filteredGuides.some((guide) => guide.id === activeGuideId)) {
      setActiveGuideId(filteredGuides[0].id);
    }
  }, [filteredGuides, activeGuideId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
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

  const roleLensLabel =
    roleLens === "all"
      ? "All roles (compare)"
      : ADMIN_ROLE_LABELS[roleLens];

  return (
    <AdminLayoutShell
      title="Help Center"
      subtitle="Pick a topic on the left. Each guide opens here with must-know steps and role-specific instructions."
    >
      <div className="space-y-4">
        <section className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
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
                  placeholder="Search… publish, hide image, requests, migration"
                  className="h-11 pl-10 pr-20"
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
            </div>

            <div className="w-full lg:w-72">
              <label htmlFor="help-role-lens" className="mb-1.5 block text-xs font-medium text-[var(--ploy-text-secondary)]">
                View guide as
              </label>
              <Select
                id="help-role-lens"
                value={roleLens}
                onChange={(event) =>
                  setRoleLens(event.target.value as AdminRole | "all")
                }
              >
                {HELP_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value === viewerRole && option.value !== "all"
                      ? `${option.label} (you)`
                      : option.label}
                  </option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-[var(--ploy-text-tertiary)]">
                Currently showing: <strong>{roleLensLabel}</strong>
                {viewerRole && roleLens === viewerRole ? " — your account role" : ""}
              </p>
            </div>
          </div>

          {query && (
            <p className="mt-3 text-sm text-[var(--ploy-text-tertiary)]">
              {filteredGuides.length === 0
                ? "No topics match. Try “draft”, “role”, “image”, or “inbox”."
                : `${filteredGuides.length} topic${filteredGuides.length === 1 ? "" : "s"} found`}
            </p>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside
            className={cn(
              "rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] lg:sticky lg:top-6",
              mobilePanelOpen && "hidden lg:block",
            )}
          >
            <div className="border-b border-[var(--ploy-border-subtle)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--ploy-text-primary)]">Topics</p>
              <p className="text-xs text-[var(--ploy-text-tertiary)]">
                Click any topic to open its guide panel
              </p>
            </div>
            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto p-2">
              {filteredGuides.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-[var(--ploy-text-tertiary)]">No topics match your search.</p>
                  <Button className="mt-3" variant="secondary" size="sm" onClick={() => setQuery("")}>
                    Clear search
                  </Button>
                </div>
              ) : (
                <HelpCenterTopicNav
                  guides={filteredGuides}
                  activeGuideId={activeGuide?.id ?? null}
                  viewerRole={viewerRole}
                  onSelect={selectGuide}
                />
              )}
            </div>
          </aside>

          <div className={cn(!mobilePanelOpen && "hidden lg:block", "min-w-0")}>
            {activeGuide ? (
              <HelpCenterDetailPanel
                guide={activeGuide}
                markdownSection={getMarkdownSection(activeGuide.id)}
                roleLens={roleLens}
                query={query}
                onNavigate={selectGuide}
                onPrevious={previousGuide ? () => selectGuide(previousGuide.id) : undefined}
                onNext={nextGuide ? () => selectGuide(nextGuide.id) : undefined}
                previousTitle={previousGuide?.shortTitle}
                nextTitle={nextGuide?.shortTitle}
                onClose={() => setMobilePanelOpen(false)}
              />
            ) : (
              <EmptyGuidePanel onBrowse={() => selectGuide(DEFAULT_GUIDE_ID)} />
            )}
          </div>

          {!mobilePanelOpen && filteredGuides.length > 0 && (
            <div className="rounded-[var(--ploy-radius-lg)] border border-dashed border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-8 text-center lg:hidden">
              <BookOpen className="mx-auto size-8 text-[var(--ploy-text-tertiary)]" />
              <p className="mt-3 text-sm font-medium text-[var(--ploy-text-primary)]">
                Select a topic to open its guide
              </p>
              <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">
                Each guide opens in a focused panel with must-know steps and role notes.
              </p>
              <Button className="mt-4" onClick={() => selectGuide(filteredGuides[0]?.id ?? DEFAULT_GUIDE_ID)}>
                Start with {filteredGuides[0]?.shortTitle ?? "Getting started"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}

function EmptyGuidePanel({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex min-h-[32rem] items-center justify-center rounded-[var(--ploy-radius-lg)] border border-dashed border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-8 text-center">
      <div>
        <BookOpen className="mx-auto size-8 text-[var(--ploy-text-tertiary)]" />
        <p className="mt-3 text-sm font-medium text-[var(--ploy-text-primary)]">
          Choose a topic from the list
        </p>
        <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">
          Guides open here — one section at a time, with role-specific instructions.
        </p>
        <Button className="mt-4" onClick={onBrowse}>
          Open getting started guide
        </Button>
      </div>
    </div>
  );
}
