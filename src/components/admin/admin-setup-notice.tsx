"use client";

import { AlertTriangle } from "lucide-react";
import { MIGRATION_007_HINT, MIGRATION_009_HINT, MIGRATION_010_HINT, MIGRATION_011_HINT } from "@/lib/site-settings/schema-support";

interface AdminSetupNoticeProps {
  variant?: "homepage" | "books" | "insights" | "work-orgs";
}

export function AdminSetupNotice({ variant = "homepage" }: AdminSetupNoticeProps) {
  const copy =
    variant === "books"
      ? {
          title: "Books CMS needs one database step",
          hint: MIGRATION_009_HINT,
          detail:
            "The public site keeps showing the existing library until this is done. Books admin needs it.",
        }
      : variant === "insights"
        ? {
            title: "Insights CMS needs one database step",
            hint: MIGRATION_010_HINT,
            detail:
              "The public site keeps showing the existing articles until this is done. Insights admin needs it.",
          }
        : variant === "work-orgs"
          ? {
              title: "Work orgs CMS needs one database step",
              hint: MIGRATION_011_HINT,
              detail:
                "The public site keeps showing the existing platforms until this is done. Work admin needs it.",
            }
          : {
            title: "Homepage CMS needs one database step",
            hint: MIGRATION_007_HINT,
            detail:
              "The public site keeps working with defaults until this is done. Events admin and homepage controls need it.",
          };

  return (
    <div className="mb-6 rounded-[var(--ploy-radius-md)] border border-[oklch(0.72_0.14_75/0.35)] bg-[oklch(0.72_0.14_75/0.1)] px-4 py-3 text-sm text-[var(--ploy-text-primary)]">
      <p className="flex items-start gap-2 font-medium">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--ploy-status-warning)]" />
        {copy.title}
      </p>
      <p className="mt-2 text-[var(--ploy-text-secondary)]">{copy.hint}</p>
      <p className="mt-2 text-xs text-[var(--ploy-text-tertiary)]">{copy.detail}</p>
    </div>
  );
}
