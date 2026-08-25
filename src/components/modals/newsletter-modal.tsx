"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { NewsletterSignupForm } from "@/components/marketing/footer-newsletter-signup";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

interface NewsletterModalProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function NewsletterModal({ open, onClose }: NewsletterModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }

    document.body.style.overflow = "";
    previousFocus.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, requestClose]);

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[oklch(0.21_0.005_70/0.55)] backdrop-blur-sm"
        aria-label="Close stay connected modal"
        onClick={requestClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-modal-title"
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-[var(--ploy-background-elevated)] shadow-[var(--ploy-shadow-overlay)]",
          "rounded-t-[var(--ploy-radius-xl)] sm:max-w-md sm:rounded-[var(--ploy-radius-xl)]",
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] px-6 py-5">
          <div className="space-y-1">
            <p className="ploy-kicker">Stay connected</p>
            <Heading as="h2" id="newsletter-modal-title" size="card">
              Occasional updates
            </Heading>
            <p className="text-sm text-[var(--ploy-text-secondary)]">
              Insights, events, and announcements — no spam.
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] text-[var(--ploy-text-primary)] hover:bg-[var(--ploy-interactive-secondary)]"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <NewsletterSignupForm />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
