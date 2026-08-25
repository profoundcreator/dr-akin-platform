"use client";

import { BookOpen, Star } from "lucide-react";
import {
  HELP_GUIDE_CATEGORIES,
  type HelpGuide,
  isGuideEssentialForRole,
} from "@/lib/admin/help-center-guides";
import type { AdminRole } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

interface HelpCenterTopicNavProps {
  guides: HelpGuide[];
  activeGuideId: string | null;
  viewerRole: AdminRole | null;
  onSelect: (guideId: string) => void;
}

export function HelpCenterTopicNav({
  guides,
  activeGuideId,
  viewerRole,
  onSelect,
}: HelpCenterTopicNavProps) {
  return (
    <nav className="space-y-4" aria-label="Help topics">
      {HELP_GUIDE_CATEGORIES.map((category) => {
        const categoryGuides = guides.filter((guide) => guide.category === category.id);
        if (categoryGuides.length === 0) return null;

        return (
          <div key={category.id}>
            <div className="mb-2 px-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                {category.label}
              </p>
              <p className="text-xs text-[var(--ploy-text-tertiary)]">{category.description}</p>
            </div>
            <ul className="space-y-1">
              {categoryGuides.map((guide) => {
                const isActive = guide.id === activeGuideId;
                const isEssential = viewerRole
                  ? isGuideEssentialForRole(guide, viewerRole)
                  : false;

                return (
                  <li key={guide.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(guide.id)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-[var(--ploy-radius-md)] px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                          : "text-[var(--ploy-text-secondary)] hover:bg-[var(--ploy-interactive-secondary)] hover:text-[var(--ploy-text-primary)]",
                      )}
                    >
                      <BookOpen
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          isActive
                            ? "text-[var(--ploy-text-inverse)]"
                            : "text-[var(--ploy-text-tertiary)]",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{guide.shortTitle}</span>
                        {isEssential && (
                          <span
                            className={cn(
                              "mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide",
                              isActive
                                ? "text-[var(--ploy-text-inverse)]/85"
                                : "text-[var(--ploy-accent-primary)]",
                            )}
                          >
                            <Star className="size-3 fill-current" />
                            Key for you
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
