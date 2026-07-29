import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[var(--ploy-text-secondary)]"
    >
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          "mt-0.5 size-4 shrink-0 rounded border-[var(--ploy-border-default)] accent-[var(--ploy-background-accent)]",
          className,
        )}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
