"use client";

import type { ReactNode } from "react";

type InlinePart =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

function parseInlineMarkdown(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const token = match[0];
    if (token.startsWith("**")) {
      parts.push({ type: "strong", value: token.slice(2, -2) });
    } else if (token.startsWith("`")) {
      parts.push({ type: "code", value: token.slice(1, -1) });
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push({ type: "link", label: linkMatch[1], href: linkMatch[2] });
      } else {
        parts.push({ type: "text", value: token });
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

interface HelpInlineMarkdownProps {
  text: string;
  onNavigate?: (sectionId: string) => void;
  highlight?: string;
}

function highlightText(text: string, highlight?: string): ReactNode {
  if (!highlight?.trim()) return text;

  const query = highlight.trim();
  const lower = text.toLowerCase();
  const index = lower.indexOf(query.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-[var(--ploy-accent-primary)]/15 px-0.5 text-[var(--ploy-text-primary)]">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function HelpInlineMarkdown({ text, onNavigate, highlight }: HelpInlineMarkdownProps) {
  const parts = parseInlineMarkdown(text);

  return (
    <>
      {parts.map((part, index) => {
        switch (part.type) {
          case "strong":
            return (
              <strong key={index} className="font-semibold text-[var(--ploy-text-primary)]">
                {highlightText(part.value, highlight)}
              </strong>
            );
          case "code":
            return (
              <code
                key={index}
                className="rounded bg-[var(--ploy-background-secondary)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--ploy-text-primary)]"
              >
                {part.value}
              </code>
            );
          case "link": {
            const isInternal = part.href.startsWith("#");
            if (isInternal) {
              const sectionId = part.href.slice(1);
              return (
                <button
                  key={index}
                  type="button"
                  className="font-medium text-[var(--ploy-accent-primary)] underline-offset-2 hover:underline"
                  onClick={() => onNavigate?.(sectionId)}
                >
                  {part.label}
                </button>
              );
            }

            const isExternal = /^https?:\/\//.test(part.href);
            return (
              <a
                key={index}
                href={part.href}
                className="font-medium text-[var(--ploy-accent-primary)] underline-offset-2 hover:underline"
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {part.label}
              </a>
            );
          }
          default:
            return <span key={index}>{highlightText(part.value, highlight)}</span>;
        }
      })}
    </>
  );
}
