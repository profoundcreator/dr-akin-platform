import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ploy-border-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)] hover:bg-[var(--ploy-interactive-primary-hover)] hover:shadow-[0_10px_28px_oklch(0.21_0.005_70/0.22)] active:scale-[0.99]",
        secondary:
          "bg-[var(--ploy-background-primary)] text-[var(--ploy-text-primary)] border border-[var(--ploy-border-primary)] hover:bg-[var(--ploy-interactive-secondary)] active:scale-[0.99]",
        ghost:
          "text-[var(--ploy-text-primary)] hover:bg-[var(--ploy-interactive-secondary)]",
        accent:
          "bg-[var(--ploy-background-accent)] text-[var(--ploy-text-inverse)] hover:opacity-90 active:scale-[0.99]",
        link: "h-auto p-0 text-[var(--ploy-text-primary)] underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:decoration-[var(--ploy-text-primary)]",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--ploy-radius-button)]",
        md: "h-11 px-5 text-sm rounded-[var(--ploy-radius-button)]",
        lg: "h-12 px-6 text-sm rounded-[var(--ploy-radius-button)]",
        icon: "h-10 w-10 rounded-[var(--ploy-radius-button)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function ButtonArrowBadge({
  size,
  variant,
}: {
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  const boxSize = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-9";
  const iconSize = size === "sm" ? "size-3.5" : size === "lg" ? "size-[1.125rem]" : "size-4";
  const isFilled = variant === "primary" || variant === "accent";

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem]",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "group-hover:scale-[1.06] group-active:scale-[0.96]",
        boxSize,
        isFilled
          ? "bg-[oklch(0.34_0.01_68)] shadow-[inset_0_1px_0_oklch(1_0_0/0.1)]"
          : "bg-[var(--ploy-background-secondary)] shadow-[inset_0_0_0_1px_var(--ploy-border-primary)]",
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          isFilled ? "bg-[oklch(1_0_0/0.08)]" : "bg-[oklch(0_0_0/0.04)]",
        )}
      />
      <ArrowUpRight
        className={cn(
          iconSize,
          "relative z-[1] stroke-[2]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:translate-x-[3px] group-hover:-translate-y-[3px]",
          "group-active:translate-x-[1px] group-active:-translate-y-[1px]",
          isFilled ? "text-[var(--ploy-text-inverse)]" : "text-[var(--ploy-text-primary)]",
        )}
      />
    </span>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  showArrow?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({
  className,
  variant,
  size,
  showArrow = false,
  href,
  target,
  rel,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    buttonVariants({ variant, size }),
    "group",
    showArrow && "gap-3",
    showArrow &&
      (size === "lg" ? "py-1.5 pl-1.5 pr-6" : size === "sm" ? "py-1 pl-1 pr-4" : "py-1 pl-1 pr-5"),
    className,
  );

  const content = (
    <>
      {showArrow && <ButtonArrowBadge size={size} variant={variant} />}
      <span className="relative">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} target={target} rel={rel}>
        {content}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = props;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}

export { buttonVariants };
