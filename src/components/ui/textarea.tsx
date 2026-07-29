import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-[6rem] w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-[var(--ploy-background-elevated)] px-3 py-2 text-sm text-[var(--ploy-text-primary)] placeholder:text-[var(--ploy-text-tertiary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ploy-border-accent)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
