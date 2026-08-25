import { cn } from "@/lib/utils";
import { BRAND_ASSETS } from "@/lib/brand/assets";

type BrandLogoProps = {
  /** Header uses compact sizing; footer slightly larger; mark is icon-only. */
  variant?: "header" | "footer" | "footerMark" | "mark";
  className?: string;
  /** Set on the header home link for LCP. */
  priority?: boolean;
};

const LOCKUP_HEIGHT = {
  /** ~35–40% of the 80px header bar — wide lockup width scales from height. */
  header: "h-7 sm:h-8",
  footer: "h-8 sm:h-9",
  /** Footer brand column — icon only, aligned with link columns. */
  footerMark: "h-8 w-8",
  mark: "h-9 w-9",
} as const;

/** Wide lockup ~6.7:1 — width follows height via w-auto. */
const LOCKUP_WIDTH = {
  header: { width: 187, height: 28 },
  footer: { width: 220, height: 36 },
  footerMark: { width: 32, height: 32 },
  mark: { width: 36, height: 36 },
} as const;

export function BrandLogo({ variant = "header", className, priority = false }: BrandLogoProps) {
  if (variant === "mark" || variant === "footerMark") {
    const heightClass = LOCKUP_HEIGHT[variant];
    const dimensions = LOCKUP_WIDTH[variant];

    return (
      <img
        src={BRAND_ASSETS.iconmark}
        alt=""
        width={dimensions.width}
        height={dimensions.height}
        className={cn("shrink-0 object-contain", heightClass, className)}
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
      className={cn("w-auto shrink-0 object-contain object-left", heightClass, className)}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
