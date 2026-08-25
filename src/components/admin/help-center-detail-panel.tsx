"use client";

import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Lightbulb, Shield, XCircle } from "lucide-react";
import { HelpCenterRenderer } from "@/components/admin/help-center-renderer";
import { HelpInlineMarkdown } from "@/components/admin/help-center-inline-markdown";
import { Button } from "@/components/ui/button";
import type { HelpGuide } from "@/lib/admin/help-center-guides";
import { getRelevantRoleNotes } from "@/lib/admin/help-center-guides";
import type { HelpSection } from "@/lib/admin/help-center-parser";
import type { AdminRole } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

interface HelpCenterDetailPanelProps {
  guide: HelpGuide;
  markdownSection?: HelpSection;
  roleLens: AdminRole | "all";
  query: string;
  onNavigate: (sectionId: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  previousTitle?: string;
  nextTitle?: string;
  onClose?: () => void;
}

export function HelpCenterDetailPanel({
  guide,
  markdownSection,
  roleLens,
  query,
  onNavigate,
  onPrevious,
  onNext,
  previousTitle,
  nextTitle,
  onClose,
}: HelpCenterDetailPanelProps) {
  const roleNotes = getRelevantRoleNotes(guide, roleLens);

  return (
    <div className="flex h-full min-h-[32rem] flex-col rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)]">
      <div className="border-b border-[var(--ploy-border-subtle)] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="ploy-kicker">Guide</p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--ploy-text-primary)]">
              {guide.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              {guide.summary}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onClose && (
              <button
                type="button"
                className="rounded-[var(--ploy-radius-md)] p-2 text-[var(--ploy-text-tertiary)] hover:bg-[var(--ploy-interactive-secondary)] lg:hidden"
                aria-label="Close guide"
                onClick={onClose}
              >
                <XCircle className="size-5" />
              </button>
            )}
            {guide.adminHref && guide.adminLabel && (
              <Button href={guide.adminHref} size="sm" className="shrink-0">
                Open {guide.adminLabel}
                <ExternalLink className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-5">
          <section className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-accent)] bg-[var(--ploy-background-accent-muted)]/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="size-4 text-[var(--ploy-accent-primary)]" />
              <h3 className="text-sm font-semibold text-[var(--ploy-text-primary)]">
                Must know before you start
              </h3>
            </div>
            <ul className="space-y-2">
              {guide.mustKnow.map((item, index) => (
                <li key={index} className="flex gap-2 text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--ploy-accent-primary)]" />
                  <span>
                    <HelpInlineMarkdown text={item} onNavigate={onNavigate} highlight={query} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {roleNotes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-[var(--ploy-text-secondary)]" />
                <h3 className="text-sm font-semibold text-[var(--ploy-text-primary)]">
                  {roleLens === "all" ? "Role guide (compare all)" : "Your role in this area"}
                </h3>
              </div>
              {roleNotes.map(({ role, label, note }) => (
                <div
                  key={role}
                  className={cn(
                    "rounded-[var(--ploy-radius-md)] border p-4",
                    roleLens === "all"
                      ? "border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)]"
                      : "border-[var(--ploy-border-accent)] bg-[var(--ploy-background-primary)]",
                  )}
                >
                  {roleLens === "all" && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                      {label}
                    </p>
                  )}
                  <p className="text-sm font-medium text-[var(--ploy-text-primary)]">{note.headline}</p>
                  {note.canDo.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {note.canDo.map((item, index) => (
                        <li key={index} className="flex gap-2 text-sm text-[var(--ploy-text-secondary)]">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[var(--ploy-accent-primary)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {note.cannotDo && note.cannotDo.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {note.cannotDo.map((item, index) => (
                        <li key={index} className="flex gap-2 text-sm text-[var(--ploy-text-secondary)]">
                          <XCircle className="mt-0.5 size-3.5 shrink-0 text-[var(--ploy-text-tertiary)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {note.tip && (
                    <p className="mt-3 flex gap-2 rounded-[var(--ploy-radius-sm)] bg-[var(--ploy-background-secondary)] px-3 py-2 text-xs leading-relaxed text-[var(--ploy-text-secondary)]">
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-[var(--ploy-accent-primary)]" />
                      {note.tip}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {guide.steps.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[var(--ploy-text-primary)]">
                Step by step
              </h3>
              <ol className="space-y-3">
                {guide.steps.map((step, index) => (
                  <li
                    key={index}
                    className="flex gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] p-3"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--ploy-interactive-primary)] text-xs font-semibold text-[var(--ploy-text-inverse)]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--ploy-text-primary)]">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {guide.commonMistakes && guide.commonMistakes.length > 0 && (
            <section className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] p-4">
              <h3 className="text-sm font-semibold text-[var(--ploy-text-primary)]">Common mistakes</h3>
              <ul className="mt-3 space-y-2">
                {guide.commonMistakes.map((item, index) => (
                  <li key={index} className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                    • {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {markdownSection && markdownSection.blocks.length > 0 && (
            <section className="border-t border-[var(--ploy-border-subtle)] pt-5">
              <h3 className="mb-4 text-sm font-semibold text-[var(--ploy-text-primary)]">
                Full reference
              </h3>
              <HelpCenterRenderer
                blocks={markdownSection.blocks}
                onNavigate={onNavigate}
                highlight={query}
              />
            </section>
          )}

          {guide.relatedSectionIds.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-[var(--ploy-text-primary)]">
                Related guides
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide.relatedSectionIds.map((sectionId) => (
                  <button
                    key={sectionId}
                    type="button"
                    className="rounded-full border border-[var(--ploy-border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--ploy-text-secondary)] hover:border-[var(--ploy-border-accent)] hover:text-[var(--ploy-text-primary)]"
                    onClick={() => onNavigate(sectionId)}
                  >
                    {sectionId.replace(/^\d+-/, "").replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {(onPrevious || onNext) && (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--ploy-border-subtle)] px-5 py-3 sm:px-6">
          {onPrevious ? (
            <Button variant="secondary" size="sm" onClick={onPrevious}>
              <ChevronLeft className="size-4" />
              {previousTitle ?? "Previous"}
            </Button>
          ) : (
            <span />
          )}
          {onNext && (
            <Button variant="secondary" size="sm" onClick={onNext} className="ml-auto">
              {nextTitle ?? "Next"}
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
