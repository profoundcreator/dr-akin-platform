import { HelpCircle } from "lucide-react";

interface AdminHelpTipProps {
  text: string;
}

/** Short hover/focus explanation for non-technical admin users. */
export function AdminHelpTip({ text }: AdminHelpTipProps) {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 rounded-full text-[var(--ploy-text-tertiary)] transition-colors hover:text-[var(--ploy-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ploy-accent-primary)]"
      aria-label={text}
      title={text}
    >
      <HelpCircle className="size-3.5" aria-hidden="true" />
    </button>
  );
}
