export const CONTACT_PLATFORMS = ["aald", "performx", "erudio-hub", "auctus-africa"] as const;
export type ContactPlatform = (typeof CONTACT_PLATFORMS)[number];

const PLATFORM_PATH_PREFIXES: { platform: ContactPlatform; prefixes: string[] }[] = [
  { platform: "aald", prefixes: ["/work/aald"] },
  { platform: "performx", prefixes: ["/work/performx", "/events/performx"] },
  { platform: "erudio-hub", prefixes: ["/work/erudio-hub"] },
  { platform: "auctus-africa", prefixes: ["/work/auctus-africa"] },
];

function normalizePlatform(value: string | null | undefined): ContactPlatform | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) return null;
  return CONTACT_PLATFORMS.includes(trimmed as ContactPlatform) ? (trimmed as ContactPlatform) : null;
}

export function contactPathForPlatform(platform: ContactPlatform): string {
  return `/contact?platform=${encodeURIComponent(platform)}`;
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
