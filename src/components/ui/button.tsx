import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ploy-border-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)] hover:bg-[var(--ploy-interactive-primary-hover)]",
        secondary:
          "bg-[var(--ploy-interactive-secondary)] text-[var(--ploy-text-primary)] border border-[var(--ploy-border-default)] hover:bg-[var(--ploy-interactive-secondary-hover)]",
        ghost:
          "text-[var(--ploy-text-primary)] hover:bg-[var(--ploy-interactive-secondary)]",
        accent:
          "bg-[var(--ploy-background-accent)] text-[var(--ploy-text-inverse)] hover:opacity-90",
        link: "text-[var(--ploy-text-link)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--ploy-radius-md)]",
        md: "h-11 px-6 text-sm rounded-[var(--ploy-radius-md)]",
        lg: "h-12 px-8 text-base rounded-[var(--ploy-radius-lg)]",
        icon: "h-10 w-10 rounded-[var(--ploy-radius-md)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  showArrow?: boolean;
  href?: string;
}

export function Button({
  className,
  variant,
  size,
  showArrow = false,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), "group", className);
  const arrow = showArrow ? (
    <ArrowRight
      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  ) : null;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
        {arrow}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = props;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
      {arrow}
    </button>
  );
}

export { buttonVariants };
