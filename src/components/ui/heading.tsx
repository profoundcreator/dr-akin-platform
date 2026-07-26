import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-semibold tracking-[var(--ploy-tracking-tight)] text-[var(--ploy-text-primary)]", {
  variants: {
    size: {
      display:
        "text-[clamp(2.5rem,5vw,var(--ploy-text-5xl))] leading-[var(--ploy-leading-tight)]",
      section:
        "text-[clamp(2rem,3.5vw,var(--ploy-text-4xl))] leading-[var(--ploy-leading-snug)]",
      card:
        "text-[clamp(1.25rem,2vw,var(--ploy-text-2xl))] leading-[var(--ploy-leading-snug)]",
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
