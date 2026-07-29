import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-[var(--ploy-background-elevated)] px-3 py-2 text-sm text-[var(--ploy-text-primary)] placeholder:text-[var(--ploy-text-tertiary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ploy-border-accent)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
