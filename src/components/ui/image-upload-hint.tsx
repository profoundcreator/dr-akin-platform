import { Info } from "lucide-react";

interface ImageUploadHintProps {
  hint: string;
}

export function ImageUploadHint({ hint }: ImageUploadHintProps) {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-[var(--ploy-text-tertiary)]">
      <Info className="mt-0.5 size-3.5 shrink-0 text-[var(--ploy-accent-primary)]" aria-hidden="true" />
      <span title={hint}>{hint}</span>
    </p>
  );
}
