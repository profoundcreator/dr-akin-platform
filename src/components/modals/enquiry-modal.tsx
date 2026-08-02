"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import { BookingForm } from "@/components/booking/booking-form";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

interface EnquiryModalProps {
  open: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function EnquiryModal({ open, onClose, triggerRef }: EnquiryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const previousFocus = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(() => {
    if (dirty) {
      const confirmed = window.confirm(
        "You have unsaved information. Are you sure you want to close?",
      );
      if (!confirmed) return;
    }
    onClose();
  }, [dirty, onClose]);

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
    if (triggerRef?.current) {
      triggerRef.current.focus();
    } else if (previousFocus.current) {
      previousFocus.current.focus();
    }
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
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
        aria-label="Close enquiry modal"
        onClick={requestClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-title"
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-[var(--ploy-background-elevated)] shadow-[var(--ploy-shadow-overlay)]",
          "rounded-t-[var(--ploy-radius-xl)] sm:max-w-2xl sm:rounded-[var(--ploy-radius-xl)]",
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] px-6 py-5">
          <div className="space-y-1">
            <p className="ploy-kicker">Invite Akin Akinpelu</p>
            <Heading as="h2" id="enquiry-modal-title" size="card">
              Submit an engagement invitation
            </Heading>
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
          <BookingForm
            variant="modal"
            onDirtyChange={setDirty}
            onSubmitted={() => setDirty(false)}
          />
        </div>

        <div className="border-t border-[var(--ploy-border-subtle)] px-6 py-4">
          <a
            href="/book-dr-akin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ploy-text-link)] hover:text-[var(--ploy-text-accent)]"
          >
            Open full booking page
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
