import { readEnv } from "./env";

/** Platforms whose contact enquiries go to a dedicated brand inbox — not ea@. */
export const BRAND_ROUTED_PLATFORMS = ["aald", "erudio-hub", "auctus-africa", "future-africa"] as const;
export type BrandRoutedPlatform = (typeof BRAND_ROUTED_PLATFORMS)[number];

/** All platforms we detect on contact submissions (for context + admin email labels). */
export const CONTACT_PLATFORMS = [...BRAND_ROUTED_PLATFORMS, "performx"] as const;
export type ContactPlatform = (typeof CONTACT_PLATFORMS)[number];

export interface BrandInboxes {
  admin: string;
  aald: string | null;
  erudio: string | null;
  auctus: string | null;
  futureAfrica: string | null;
}

const PLATFORM_PATH_PREFIXES: { platform: ContactPlatform; prefixes: string[] }[] = [
  { platform: "aald", prefixes: ["/work/aald"] },
  { platform: "performx", prefixes: ["/work/performx", "/events/performx"] },
  { platform: "erudio-hub", prefixes: ["/work/erudio-hub"] },
  { platform: "auctus-africa", prefixes: ["/work/auctus-africa"] },
  { platform: "future-africa", prefixes: ["/work/future-africa"] },
];

/** Enquiry topics that always route to ea@ regardless of platform context. */
const EA_ONLY_SUBJECTS = new Set([
  "Organizer support",
  "Privacy or data request",
  "Media enquiry",
  "General enquiry",
]);

function normalizePlatform(value: string | null | undefined): ContactPlatform | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) return null;
  return CONTACT_PLATFORMS.includes(trimmed as ContactPlatform) ? (trimmed as ContactPlatform) : null;
}

export function isBrandRoutedPlatform(platform: ContactPlatform | null): platform is BrandRoutedPlatform {
  return platform !== null && (BRAND_ROUTED_PLATFORMS as readonly string[]).includes(platform);
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

export function resolveContactPlatform(input: {
  platform?: string | null;
  referrerPath?: string | null;
}): ContactPlatform | null {
  return normalizePlatform(input.platform) ?? inferPlatformFromPath(input.referrerPath);
}

export function getBrandInboxes(): BrandInboxes {
  return {
    admin: readEnv("ADMIN_NOTIFICATION_EMAIL"),
    aald: readEnv("NOTIFY_AALD") || null,
    erudio: readEnv("NOTIFY_ERUDIO") || null,
    auctus: readEnv("NOTIFY_AUCTUS") || null,
    futureAfrica: readEnv("NOTIFY_FUTURE_AFRICA") || null,
  };
}

function inboxForBrandPlatform(platform: BrandRoutedPlatform, inboxes: BrandInboxes): string | null {
  switch (platform) {
    case "aald":
      return inboxes.aald;
    case "erudio-hub":
      return inboxes.erudio;
    case "auctus-africa":
      return inboxes.auctus;
    case "future-africa":
      return inboxes.futureAfrica;
    default:
      return null;
  }
}

export function resolveEnquiryNotificationRecipients(input: {
  platform: ContactPlatform | null;
  subject: string | null;
  inboxes: BrandInboxes;
}): string[] {
  const admin = input.inboxes.admin.trim();
  if (!admin) return [];

  const subject = (input.subject ?? "").trim();

  if (EA_ONLY_SUBJECTS.has(subject)) {
    return [admin];
  }

  if (input.platform && isBrandRoutedPlatform(input.platform)) {
    const brandInbox = inboxForBrandPlatform(input.platform, input.inboxes)?.trim();
    if (brandInbox) return [brandInbox];
    return [];
  }

  return [admin];
}

export function resolveBookingNotificationRecipients(inboxes: BrandInboxes): string[] {
  const admin = inboxes.admin.trim();
  return admin ? [admin] : [];
}

export function platformLabel(platform: ContactPlatform | null): string | null {
  if (!platform) return null;
  switch (platform) {
    case "aald":
      return "AALD";
    case "performx":
      return "PerformX Nexus";
    case "erudio-hub":
      return "Erudio Hub";
    case "auctus-africa":
      return "Auctus Africa";
    case "future-africa":
      return "Future Africa";
    default:
      return platform;
  }
}
