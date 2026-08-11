"use client";

import { useEffect, useRef } from "react";
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Pilcrow, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediumRichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md p-2 text-[var(--ploy-text-secondary)] transition-colors hover:bg-black/5 hover:text-[var(--ploy-text-primary)]"
    >
      {children}
    </button>
  );
}

export function MediumRichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Tell your story…",
  className,
}: MediumRichTextEditorProps) {
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
    <div className={cn("relative", className)}>
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
          "min-h-[320px] w-full border-0 bg-transparent text-lg leading-[1.8] text-[var(--ploy-text-primary)]",
          "focus:outline-none",
          "[&:empty::before]:pointer-events-none [&:empty::before]:text-[var(--ploy-text-tertiary)] [&:empty::before]:content-[attr(data-placeholder)]",
          "[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-[1.75rem] [&_h2]:font-semibold [&_h2]:leading-tight",
          "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold",
          "[&_p]:mb-6 [&_p]:leading-[1.8]",
          "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--ploy-border-primary)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--ploy-text-secondary)]",
          "[&_ul]:my-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
          "[&_ol]:my-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
          "[&_li]:leading-[1.8]",
          "[&_a]:underline [&_a]:underline-offset-4",
        )}
      />

      <div className="sticky bottom-6 z-10 mx-auto mt-6 flex w-fit max-w-full items-center gap-0.5 rounded-full border border-black/10 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
        <ToolbarButton onClick={() => runCommand("bold")} label="Bold">
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => runCommand("italic")} label="Italic">
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => runCommand("formatBlock", "h2")} label="Heading">
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => runCommand("formatBlock", "h3")} label="Subheading">
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => runCommand("formatBlock", "p")} label="Paragraph">
          <Pilcrow className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => runCommand("formatBlock", "blockquote")} label="Quote">
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => runCommand("insertUnorderedList")} label="Bulleted list">
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => runCommand("insertOrderedList")} label="Numbered list">
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleLink} label="Link">
          <Link2 className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
