import { readEnv, readEnvBool } from "./env";

export const CONTACT_PLATFORMS = ["aald", "performx", "erudio-hub", "auctus-africa"] as const;
export type ContactPlatform = (typeof CONTACT_PLATFORMS)[number];

export interface BrandInboxes {
  admin: string;
  general: string | null;
  aald: string | null;
  performx: string | null;
  erudio: string | null;
  auctus: string | null;
}

const PLATFORM_PATH_PREFIXES: { platform: ContactPlatform; prefixes: string[] }[] = [
  { platform: "aald", prefixes: ["/work/aald"] },
  { platform: "performx", prefixes: ["/work/performx", "/events/performx"] },
  { platform: "erudio-hub", prefixes: ["/work/erudio-hub"] },
  { platform: "auctus-africa", prefixes: ["/work/auctus-africa"] },
];

const OPERATIONS_SUBJECTS = new Set(["Organizer support", "Privacy or data request"]);
const GENERAL_SITE_SUBJECTS = new Set(["Media enquiry", "General enquiry"]);

function normalizePlatform(value: string | null | undefined): ContactPlatform | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) return null;
  return CONTACT_PLATFORMS.includes(trimmed as ContactPlatform) ? (trimmed as ContactPlatform) : null;
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
    general: readEnv("NOTIFY_GENERAL") || null,
    aald: readEnv("NOTIFY_AALD") || null,
    performx: readEnv("NOTIFY_PERFORMX") || null,
    erudio: readEnv("NOTIFY_ERUDIO") || null,
    auctus: readEnv("NOTIFY_AUCTUS") || null,
  };
}

export function shouldCcAdminOnBrandEnquiry(): boolean {
  return readEnvBool("NOTIFY_EA_COPY_ON_BRAND", false);
}

function inboxForPlatform(platform: ContactPlatform, inboxes: BrandInboxes): string | null {
  switch (platform) {
    case "aald":
      return inboxes.aald;
    case "performx":
      return inboxes.performx;
    case "erudio-hub":
      return inboxes.erudio;
    case "auctus-africa":
      return inboxes.auctus;
    default:
      return null;
  }
}

function uniqueRecipients(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const recipients: string[] = [];
  for (const value of values) {
    const trimmed = (value ?? "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    recipients.push(trimmed);
  }
  return recipients;
}

export function resolveEnquiryNotificationRecipients(input: {
  platform: ContactPlatform | null;
  subject: string | null;
  inboxes: BrandInboxes;
  ccAdminOnBrand: boolean;
}): string[] {
  const subject = (input.subject ?? "").trim();
  const admin = input.inboxes.admin.trim();

  if (!admin) return [];

  if (OPERATIONS_SUBJECTS.has(subject)) {
    return [admin];
  }

  if (GENERAL_SITE_SUBJECTS.has(subject)) {
    return uniqueRecipients([input.inboxes.general, admin]);
  }

  if (input.platform) {
    const brandInbox = inboxForPlatform(input.platform, input.inboxes);
    const primary = brandInbox || admin;
    if (input.ccAdminOnBrand && brandInbox && brandInbox.toLowerCase() !== admin.toLowerCase()) {
      return uniqueRecipients([primary, admin]);
    }
    return [primary];
  }

  return uniqueRecipients([input.inboxes.general, admin]);
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
    default:
      return platform;
  }
}
