"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { buildShareLinks } from "@/lib/marketing/share-links";
import { cn } from "@/lib/utils";

interface ContentShareBarProps {
  title: string;
  summary?: string;
  /** Defaults to current page URL in the browser. */
  url?: string;
  className?: string;
}

export function ContentShareBar({ title, summary, url, className }: ContentShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [url]);

  const links = useMemo(
    () => (shareUrl ? buildShareLinks({ title, summary, url: shareUrl }) : []),
    [title, summary, shareUrl],
  );

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareError(null);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Copy failed — select the link from your browser bar.");
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!canNativeShare || !shareUrl) return;
    try {
      await navigator.share({ title, text: summary, url: shareUrl });
      setShareError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setShareError("Share unavailable on this device.");
    }
  }, [canNativeShare, shareUrl, title, summary]);

  if (!shareUrl) return null;

  return (
    <aside
      className={cn(
        "rounded-xl border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-secondary)] px-5 py-4",
        className,
      )}
      aria-label="Share this page"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
          Share
        </p>
        {canNativeShare && (
          <button
            type="button"
            onClick={() => void handleNativeShare()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ploy-text-link)] hover:underline"
          >
            <Share2 className="size-3.5" aria-hidden="true" />
            Share…
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-1.5 text-xs font-medium text-[var(--ploy-text-secondary)] transition-colors hover:border-[var(--ploy-text-primary)] hover:text-[var(--ploy-text-primary)]"
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-1.5 text-xs font-medium text-[var(--ploy-text-secondary)] transition-colors hover:border-[var(--ploy-text-primary)] hover:text-[var(--ploy-text-primary)]"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      {shareError && (
        <p className="mt-2 text-xs text-[var(--ploy-status-error)]">{shareError}</p>
      )}
    </aside>
  );
}
