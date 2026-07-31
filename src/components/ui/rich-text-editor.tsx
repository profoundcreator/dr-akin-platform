"use client";

import { useEffect, useRef } from "react";
import { Bold, Heading2, Heading3, Link2, Pilcrow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write the article body…",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isFocusedRef.current) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  function syncValue() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncValue();
  }

  function handleLink() {
    const url = window.prompt("Link URL (https://…)");
    if (!url?.trim()) return;
    runCommand("createLink", url.trim());
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("bold")}>
          <Bold className="size-4" />
          Bold
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("formatBlock", "h2")}>
          <Heading2 className="size-4" />
          H2
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("formatBlock", "h3")}>
          <Heading3 className="size-4" />
          H3
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("formatBlock", "p")}>
          <Pilcrow className="size-4" />
          Paragraph
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleLink}>
          <Link2 className="size-4" />
          Link
        </Button>
      </div>

      <div
        id={id}
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          syncValue();
        }}
        onInput={syncValue}
        className={cn(
          "min-h-48 w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)]",
          "bg-[var(--ploy-background-primary)] px-3 py-3 text-sm leading-relaxed",
          "focus:outline-none focus:ring-2 focus:ring-[var(--ploy-accent-primary)]/20",
          "[&:empty::before]:text-[var(--ploy-text-tertiary)] [&:empty::before]:content-[attr(data-placeholder)]",
          "[&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_p]:mt-4 [&_p:first-child]:mt-0",
          "[&_a]:underline [&_a]:underline-offset-4",
        )}
      />
    </div>
  );
}
