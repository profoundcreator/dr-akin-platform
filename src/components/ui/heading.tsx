import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-semibold tracking-[-0.035em] text-[var(--ploy-text-primary)]", {
  variants: {
    size: {
      display:
        "text-[clamp(2.75rem,5.5vw,4.5rem)] leading-[1.02]",
      section:
        "text-[clamp(2rem,3.5vw,var(--ploy-text-4xl))] leading-[var(--ploy-leading-snug)] tracking-[-0.03em]",
      card:
        "text-[clamp(1.25rem,2vw,var(--ploy-text-2xl))] leading-[var(--ploy-leading-snug)] tracking-[-0.025em]",
      label:
        "text-[var(--ploy-text-lg)] leading-[var(--ploy-leading-snug)] font-medium",
    },
    tone: {
      default: "text-[var(--ploy-text-primary)]",
      muted: "text-[var(--ploy-text-secondary)]",
      inverse: "text-[var(--ploy-text-inverse)]",
      accent: "text-[var(--ploy-text-accent)]",
    },
  },
  defaultVariants: {
    size: "section",
    tone: "default",
  },
});

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingElement;
}

export function Heading({
  as: Component = "h2",
  className,
  size,
  tone,
  ...props
}: HeadingProps) {
  return (
    <Component
      className={cn(headingVariants({ size, tone }), className)}
      {...props}
    />
  );
}

export { headingVariants };
