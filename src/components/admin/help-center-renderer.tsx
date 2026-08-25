"use client";

import type { HelpBlock } from "@/lib/admin/help-center-parser";
import { HelpInlineMarkdown } from "@/components/admin/help-center-inline-markdown";
import { cn } from "@/lib/utils";

interface HelpCenterRendererProps {
  blocks: HelpBlock[];
  onNavigate: (sectionId: string) => void;
  highlight?: string;
}

export function HelpCenterRenderer({ blocks, onNavigate, highlight }: HelpCenterRendererProps) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            if (block.level === 3) {
              return (
                <h3
                  key={`${block.id}-${index}`}
                  id={block.id}
                  className="scroll-mt-28 pt-2 text-base font-semibold text-[var(--ploy-text-primary)]"
                >
                  <HelpInlineMarkdown text={block.text} onNavigate={onNavigate} highlight={highlight} />
                </h3>
              );
            }
            return (
              <h4
                key={`${block.id}-${index}`}
                id={block.id}
                className="scroll-mt-28 pt-1 text-sm font-semibold text-[var(--ploy-text-primary)]"
              >
                <HelpInlineMarkdown text={block.text} onNavigate={onNavigate} highlight={highlight} />
              </h4>
            );

          case "paragraph":
            return (
              <p key={index}>
                <HelpInlineMarkdown text={block.text} onNavigate={onNavigate} highlight={highlight} />
              </p>
            );

          case "blockquote":
            return (
              <blockquote
                key={index}
                className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] px-4 py-3 text-[var(--ploy-text-secondary)]"
              >
                <HelpInlineMarkdown text={block.text} onNavigate={onNavigate} highlight={highlight} />
              </blockquote>
            );

          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] p-4 font-mono text-xs text-[var(--ploy-text-primary)]"
              >
                {block.text}
              </pre>
            );

          case "list":
            if (block.ordered) {
              return (
                <ol key={index} className="list-decimal space-y-2 pl-5">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <HelpInlineMarkdown text={item} onNavigate={onNavigate} highlight={highlight} />
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={index} className="list-disc space-y-2 pl-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <HelpInlineMarkdown text={item} onNavigate={onNavigate} highlight={highlight} />
                  </li>
                ))}
              </ul>
            );

          case "table":
            return (
              <div
                key={index}
                className="overflow-x-auto rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)]"
              >
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--ploy-background-elevated)]">
                    <tr>
                      {block.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className="border-b border-[var(--ploy-border-subtle)] px-3 py-2 font-semibold text-[var(--ploy-text-primary)]"
                        >
                          <HelpInlineMarkdown text={header} onNavigate={onNavigate} highlight={highlight} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={cn(rowIndex % 2 === 1 && "bg-[var(--ploy-background-elevated)]/60")}
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-b border-[var(--ploy-border-subtle)] px-3 py-2 align-top"
                          >
                            <HelpInlineMarkdown text={cell} onNavigate={onNavigate} highlight={highlight} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
