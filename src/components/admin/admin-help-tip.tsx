"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

interface AdminHelpTipProps {
  text: string;
}

/** Click (or hover) to reveal a short explanation for non-technical admin users. */
export function AdminHelpTip({ text }: AdminHelpTipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className="inline-flex shrink-0 rounded-full text-[var(--ploy-text-tertiary)] transition-colors hover:text-[var(--ploy-accent-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ploy-accent-primary)] data-[open=true]:text-[var(--ploy-accent-primary)]"
        aria-expanded={open}
        aria-controls={tipId}
        aria-label="Show help"
        data-open={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <HelpCircle className="size-3.5" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={tipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-72 max-w-[min(18rem,calc(100vw-3rem))] -translate-x-1/2 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-3 text-left text-xs leading-relaxed text-[var(--ploy-text-secondary)] shadow-lg"
        >
          {text}
        </div>
      )}
    </div>
  );
}
