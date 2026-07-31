"use client";

import { AlertTriangle } from "lucide-react";
import { MIGRATION_007_HINT, MIGRATION_009_HINT } from "@/lib/site-settings/schema-support";

interface AdminSetupNoticeProps {
  variant?: "homepage" | "books";
}

export function AdminSetupNotice({ variant = "homepage" }: AdminSetupNoticeProps) {
  const isBooks = variant === "books";

  return (
    <div className="mb-6 rounded-[var(--ploy-radius-md)] border border-[oklch(0.72_0.14_75/0.35)] bg-[oklch(0.72_0.14_75/0.1)] px-4 py-3 text-sm text-[var(--ploy-text-primary)]">
      <p className="flex items-start gap-2 font-medium">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--ploy-status-warning)]" />
        {isBooks ? "Books CMS needs one database step" : "Homepage CMS needs one database step"}
      </p>
      <p className="mt-2 text-[var(--ploy-text-secondary)]">
        {isBooks ? MIGRATION_009_HINT : MIGRATION_007_HINT}
      </p>
      <p className="mt-2 text-xs text-[var(--ploy-text-tertiary)]">
        {isBooks
          ? "The public site keeps showing the existing library until this is done. Books admin needs it."
          : "The public site keeps working with defaults until this is done. Events admin and homepage controls need it."}
      </p>
    </div>
  );
}
