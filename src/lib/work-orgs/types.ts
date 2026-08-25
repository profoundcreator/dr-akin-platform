import type { EventBrand } from "@/lib/supabase/database.types";

export interface WorkOrgSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface WorkOrgLink {
  label: string;
  href: string;
}

export interface PlatformWorkOrg {
  id: string;
  slug: string;
  brandKey: EventBrand;
  pageTitle: string;
  pillarTitle: string;
  brandLabel: string;
  kicker: string;
  headline: string;
  headlineSecondary: string | null;
  description: string;
  hubCardDescription: string;
  sections: WorkOrgSection[];
  ctaLabel: string | null;
  ctaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  relatedLinks: WorkOrgLink[];
  heroImagePath: string | null;
  heroImageHidden: boolean;
  logoImagePath: string | null;
  externalUrl: string | null;
  sortOrder: number;
  status: "draft" | "pending_approval" | "published" | "hidden";
  manuallyHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrgInput {
  slug: string;
  brandKey: EventBrand;
  pageTitle: string;
  pillarTitle: string;
  brandLabel: string;
  kicker: string;
  headline: string;
  headlineSecondary?: string;
  description: string;
  hubCardDescription: string;
  sections?: WorkOrgSection[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  relatedLinks?: WorkOrgLink[];
  heroImagePath?: string | null;
  heroImageHidden?: boolean;
  logoImagePath?: string | null;
  externalUrl?: string;
  sortOrder?: number;
  status?: PlatformWorkOrg["status"];
  manuallyHidden?: boolean;
}
