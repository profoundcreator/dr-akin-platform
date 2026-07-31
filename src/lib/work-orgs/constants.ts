import type { EventBrand } from "@/lib/supabase/database.types";

export const WORK_ORG_BRAND_OPTIONS: { value: EventBrand; label: string }[] = [
  { value: "aald", label: "AALD" },
  { value: "erudio", label: "Erudio Hub" },
  { value: "performx", label: "PERFORMX" },
  { value: "tc_resource", label: "TC Resource Tech" },
  { value: "dr_akin", label: "Dr. Akin" },
  { value: "other", label: "Other" },
];

export const WORK_ORG_STATUS_LABELS = {
  draft: "Draft",
  pending_approval: "Pending approval",
  published: "Published",
  hidden: "Hidden",
} as const;

export const WORK_ORG_HERO_IMAGE_HINT =
  "Best results: 1600×1200 px (4:3), JPG or WebP, under 6 MB. Used on the org detail page hero.";

export const MIGRATION_011_HINT =
  "Run supabase/migrations/011_work_orgs.sql in the Supabase SQL Editor, then refresh.";

export const STATIC_WORK_ORG_META = [
  {
    siteKey: "work-aald",
    slug: "aald",
    brandKey: "aald" as EventBrand,
    sortOrder: 1,
    pillarTitle: "Corporate Transformation",
    brandLabel: "AALD",
    hubCardDescription:
      "Leadership systems and institutional capability designed to hold under pressure and compound over time.",
  },
  {
    siteKey: "work-erudio-hub",
    slug: "erudio-hub",
    brandKey: "erudio" as EventBrand,
    sortOrder: 2,
    pillarTitle: "Educational Reform",
    brandLabel: "Erudio Hub",
    hubCardDescription:
      "Systemic reform of how nations teach, govern schools, and develop the next generation of African educators.",
  },
  {
    siteKey: "work-performx",
    slug: "performx",
    brandKey: "performx" as EventBrand,
    sortOrder: 3,
    pillarTitle: "Execution Think Tank",
    brandLabel: "PERFORMX",
    hubCardDescription:
      "A high-performance practice turning strategy into disciplined execution for leaders and operating teams.",
  },
  {
    siteKey: "work-tc",
    slug: "tc-resource-technology",
    brandKey: "tc_resource" as EventBrand,
    sortOrder: 4,
    pillarTitle: "Tech Alliances",
    brandLabel: "TC Resource Tech",
    hubCardDescription:
      "Technology partnerships and infrastructure extending the reach of every other arm of the ecosystem.",
  },
] as const;
