import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Set on LCP hero images. */
  priority?: boolean;
};

export function OptimizedImage({
  priority = false,
  loading,
  decoding = "async",
  fetchPriority,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <img
      alt={alt}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding}
      fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
      className={cn(className)}
      {...props}
    />
  );
}
