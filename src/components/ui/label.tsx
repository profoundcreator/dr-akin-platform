import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-[var(--ploy-text-primary)]",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-[var(--ploy-status-error)]" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
