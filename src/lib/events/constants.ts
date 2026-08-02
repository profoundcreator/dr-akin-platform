import type { EventBrand, EventType } from "@/lib/supabase/database.types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  hosted_by_dr_akin: "Hosted by Akin Akinpelu",
  featured_appearance: "Featured appearance",
  org_brand: "Organisation brand",
};

const PUBLIC_EVENT_BRAND_LABELS = {
  dr_akin: "Akin Akinpelu",
  aald: "AALD",
  erudio: "Erudio Hub",
  performx: "PERFORMX",
  other: "Other",
};

// Keep legacy rows readable while omitting TC Resource from Object.entries()-driven new choices.
export const EVENT_BRAND_LABELS = Object.defineProperty(
  PUBLIC_EVENT_BRAND_LABELS,
  "tc_resource",
  { value: "Legacy organisation", enumerable: false },
) as Record<EventBrand, string>;

export const EVENT_STATUS_LABELS = {
  draft: "Draft",
  pending_approval: "Pending approval",
  published: "Published",
  hidden: "Hidden",
} as const;

export const LOCATION_TYPE_OPTIONS = [
  { value: "in_person", label: "In person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
] as const;
