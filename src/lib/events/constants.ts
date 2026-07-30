import type { EventBrand, EventType } from "@/lib/supabase/database.types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  hosted_by_dr_akin: "Hosted by Dr. Akin",
  featured_appearance: "Featured appearance",
  org_brand: "Organisation brand",
};

export const EVENT_BRAND_LABELS: Record<EventBrand, string> = {
  dr_akin: "Dr. Akin",
  aald: "AALD",
  erudio: "Erudio Hub",
  performx: "PERFORMX",
  tc_resource: "TC Resource Technology",
  other: "Other",
};

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
