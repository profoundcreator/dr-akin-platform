/** Platforms whose contact enquiries go to a dedicated brand inbox — not ea@. */
export const BRAND_ROUTED_PLATFORMS = [
  "aald",
  "performx",
  "erudio-hub",
  "auctus-africa",
  "future-africa",
] as const;
export type BrandRoutedPlatform = (typeof BRAND_ROUTED_PLATFORMS)[number];

export const CONTACT_PLATFORMS = BRAND_ROUTED_PLATFORMS;
export type ContactPlatform = BrandRoutedPlatform;

const PLATFORM_PATH_PREFIXES: { platform: ContactPlatform; prefixes: string[] }[] = [
  { platform: "aald", prefixes: ["/work/aald"] },
  { platform: "performx", prefixes: ["/work/performx", "/events/performx"] },
  { platform: "erudio-hub", prefixes: ["/work/erudio-hub"] },
  { platform: "auctus-africa", prefixes: ["/work/auctus-africa"] },
  { platform: "future-africa", prefixes: ["/work/future-africa"] },
];

function normalizePlatform(value: string | null | undefined): ContactPlatform | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) return null;
  return CONTACT_PLATFORMS.includes(trimmed as ContactPlatform) ? (trimmed as ContactPlatform) : null;
}

export function isBrandRoutedPlatform(platform: ContactPlatform | null): platform is BrandRoutedPlatform {
  return platform !== null && (BRAND_ROUTED_PLATFORMS as readonly string[]).includes(platform);
}

export function contactPathForPlatform(platform: BrandRoutedPlatform): string {
  return `/contact?platform=${encodeURIComponent(platform)}`;
}

export function bookingPathForPlatform(platform: BrandRoutedPlatform): string {
  return `/book-dr-akin?platform=${encodeURIComponent(platform)}`;
}

/** Stored on booking form submissions — speaking office or a brand platform slug. */
export type BookingRequestArea = "speaking-office" | BrandRoutedPlatform;

export const BOOKING_REQUEST_AREAS: { value: BookingRequestArea; label: string }[] = [
  { value: "speaking-office", label: "Dr. Akin Akinpelu — speaking & advisory" },
  { value: "aald", label: "AALD" },
  { value: "performx", label: "PerformX Nexus" },
  { value: "erudio-hub", label: "Erudio Hub" },
  { value: "auctus-africa", label: "Auctus Africa" },
  { value: "future-africa", label: "Future Africa" },
];

export function normalizeBookingRequestArea(
  value: string | null | undefined,
): BookingRequestArea {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed || trimmed === "speaking-office") return "speaking-office";
  return CONTACT_PLATFORMS.includes(trimmed as ContactPlatform)
    ? (trimmed as BrandRoutedPlatform)
    : "speaking-office";
}

export function bookingPlatformFromArea(
  area: BookingRequestArea,
): ContactPlatform | null {
  return area === "speaking-office" ? null : area;
}

export function inferPlatformFromPath(path: string | null | undefined): ContactPlatform | null {
  const normalized = (path ?? "").trim().replace(/\/$/, "");
  if (!normalized) return null;

  for (const entry of PLATFORM_PATH_PREFIXES) {
    if (entry.prefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
      return entry.platform;
    }
  }

  return null;
}

export function readContactSubmissionContext(): {
  platform: ContactPlatform | null;
  referrerPath: string | null;
} {
  if (typeof window === "undefined") {
    return { platform: null, referrerPath: null };
  }

  const params = new URLSearchParams(window.location.search);
  const queryPlatform = normalizePlatform(params.get("platform"));
  let referrerPath: string | null = null;

  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.origin === window.location.origin) {
        referrerPath = referrerUrl.pathname;
      }
    } catch {
      referrerPath = null;
    }
  }

  const platform = queryPlatform ?? inferPlatformFromPath(referrerPath);
  return { platform, referrerPath };
}
