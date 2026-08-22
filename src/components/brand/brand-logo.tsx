import { cn } from "@/lib/utils";
import { BRAND_ASSETS } from "@/lib/brand/assets";

type BrandLogoProps = {
  /** Header uses compact sizing; footer slightly larger; mark is icon-only. */
  variant?: "header" | "footer" | "mark";
  className?: string;
  /** Set on the header home link for LCP. */
  priority?: boolean;
};

const LOCKUP_HEIGHT = {
  header: "h-8 sm:h-9",
  footer: "h-10 sm:h-11",
  mark: "h-9 w-9",
} as const;

const LOCKUP_WIDTH = {
  header: { width: 200, height: 36 },
  footer: { width: 240, height: 44 },
  mark: { width: 36, height: 36 },
} as const;

export function BrandLogo({ variant = "header", className, priority = false }: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <img
        src={BRAND_ASSETS.iconmark}
        alt=""
        width={36}
        height={36}
        className={cn("shrink-0 object-contain", LOCKUP_HEIGHT.mark, className)}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  const heightClass = LOCKUP_HEIGHT[variant];
  const dimensions = LOCKUP_WIDTH[variant];

  return (
    <img
      src={BRAND_ASSETS.wordmarkLight}
      alt=""
      width={dimensions.width}
      height={dimensions.height}
      className={cn("w-auto max-w-[min(100%,12.5rem)] shrink-0 object-contain object-left sm:max-w-none", heightClass, className)}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
