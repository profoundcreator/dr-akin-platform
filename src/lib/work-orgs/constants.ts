import type { EventBrand } from "@/lib/supabase/database.types";

export const WORK_ORG_BRAND_OPTIONS: { value: EventBrand; label: string }[] = [
  { value: "aald", label: "AALD" },
  { value: "erudio", label: "Erudio Hub" },
  { value: "performx", label: "PERFORMX" },
  { value: "dr_akin", label: "Akin Akinpelu" },
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
    siteKey: "work-future-africa",
    slug: "future-africa",
    brandKey: "other" as EventBrand,
    sortOrder: 1,
    pillarTitle: "Governance",
    brandLabel: "Future Africa",
    hubCardDescription:
      "A continental platform mobilising institutions and citizens around practical action for Agenda 2063.",
  },
  {
    siteKey: "work-aald",
    slug: "aald",
    brandKey: "aald" as EventBrand,
    sortOrder: 2,
    pillarTitle: "Enterprise",
    brandLabel: "AALD",
    hubCardDescription:
      "Leadership and institutional development for stronger systems, capable leaders and sustainable performance.",
  },
  {
    siteKey: "work-erudio-hub",
    slug: "erudio-hub",
    brandKey: "erudio" as EventBrand,
    sortOrder: 4,
    pillarTitle: "Education",
    brandLabel: "Erudio Hub",
    hubCardDescription:
      "Educational reform, educator development and institutional capacity for schools and systems.",
  },
  {
    siteKey: "work-auctus-africa",
    slug: "auctus-africa",
    brandKey: "other" as EventBrand,
    sortOrder: 5,
    pillarTitle: "Education",
    brandLabel: "Auctus Africa",
    hubCardDescription:
      "Social transformation connecting education, youth empowerment and economic opportunity.",
  },
] as const;
