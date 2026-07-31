const RESERVED_SEGMENTS = new Set(["view"]);

/** Resolve CMS slug when Astro static props or rewrite query params are missing. */
export function resolveContentSlug(
  propSlug: string,
  segment: string,
  fallbackSlug?: string | null,
): string {
  const trimmed = propSlug.trim();
  if (trimmed) return trimmed;

  const fallback = fallbackSlug?.trim();
  if (fallback) return fallback;

  if (typeof window === "undefined") return "";

  const fromQuery = new URLSearchParams(window.location.search).get("slug")?.trim();
  if (fromQuery) return fromQuery;

  const segments = window.location.pathname.split("/").filter(Boolean);
  const segmentIndex = segments.indexOf(segment);
  if (segmentIndex >= 0) {
    const candidate = segments[segmentIndex + 1]?.trim();
    if (candidate && !RESERVED_SEGMENTS.has(candidate)) return candidate;
  }

  return "";
}
