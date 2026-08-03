"use client";

import { useEffect, useRef } from "react";
import { Calendar, MapPin, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { formatEventLocation } from "@/lib/booking/format-rules";
import type { BookingRequest } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

interface EaReviewModalProps {
  request: BookingRequest | null;
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function EaReviewModal({ request, open, onClose }: EaReviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open || !request) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[oklch(0.21_0.005_70/0.55)] backdrop-blur-sm"
        aria-label="Close review modal"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ea-review-title"
        className={cn(
          "relative flex max-h-[90dvh] w-full flex-col overflow-hidden bg-[var(--ploy-background-elevated)] shadow-[var(--ploy-shadow-overlay)]",
          "rounded-t-[var(--ploy-radius-xl)] sm:max-w-2xl sm:rounded-[var(--ploy-radius-xl)]",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--ploy-border-subtle)] px-6 py-5">
          <div className="space-y-1">
            <p className="ploy-kicker">EA Screening Preview</p>
            <Heading as="h2" id="ea-review-title" size="card">
              {request.form.eventTitle}
            </Heading>
            <p className="font-mono text-xs text-[var(--ploy-text-tertiary)]">
              {request.reference}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)]"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--ploy-interactive-secondary)] px-3 py-1 text-xs font-medium">
              {request.status}
            </span>
            <span className="rounded-full bg-[var(--ploy-background-accent-muted)] px-3 py-1 text-xs font-medium text-[var(--ploy-text-accent)]">
              {request.internalStatus}
            </span>
            {request.conflictDetected && (
              <span className="rounded-full bg-[oklch(0.72_0.14_75/0.15)] px-3 py-1 text-xs font-medium text-[var(--ploy-status-warning)]">
                Conflict detected
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                Organizer
              </p>
              <div className="flex gap-2 text-sm">
                <User className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                <div>
                  <p className="font-medium">{request.form.name}</p>
                  <p className="text-[var(--ploy-text-secondary)]">{request.form.organization}</p>
                  <p className="text-[var(--ploy-text-tertiary)]">{request.form.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                Schedule
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <Calendar className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                  <span>{request.form.preferredDate || "—"}</span>
                </div>
                <div className="flex gap-2">
                  <MapPin className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                  <span>{formatEventLocation(request.form)}</span>
                </div>
              </div>
            </div>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--ploy-text-tertiary)]">Engagement</dt>
              <dd className="font-medium">
                {request.form.engagementType} · {request.form.format}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--ploy-text-tertiary)]">Audience</dt>
              <dd className="font-medium">{request.form.audienceSize}</dd>
            </div>
            <div>
              <dt className="text-[var(--ploy-text-tertiary)]">Budget</dt>
              <dd className="font-medium">{request.form.budgetRange}</dd>
            </div>
            <div>
              <dt className="text-[var(--ploy-text-tertiary)]">Assigned EA</dt>
              <dd className="font-medium">{request.assignedEa ?? "Unassigned"}</dd>
            </div>
          </dl>

          {request.form?.vipProtocol?.trim() && (
            <div className="rounded-[var(--ploy-radius-lg)] bg-[var(--ploy-background-secondary)] p-4 text-sm">
              <p className="font-medium">Event security & reception</p>
              <p className="mt-1 text-[var(--ploy-text-secondary)]">{request.form.vipProtocol}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--ploy-border-subtle)] px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary">Request more info</Button>
          <Button variant="primary">Move to screening</Button>
        </div>
      </div>
    </div>
  );
}
