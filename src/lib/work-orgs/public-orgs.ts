import { SITE_PAGES } from "@/data/site-content";
import { mergePublishedWithStatic } from "@/lib/content/merge-published-with-static";
import { STATIC_WORK_ORG_META } from "@/lib/work-orgs/constants";
import {
  getPublishedWorkOrgsFromDb,
  getWorkOrgBySlugFromDb,
} from "@/lib/work-orgs/orgs";
import type { PlatformWorkOrg } from "@/lib/work-orgs/types";

function staticOrgToPlatform(meta: (typeof STATIC_WORK_ORG_META)[number]): PlatformWorkOrg {
  const content = SITE_PAGES[meta.siteKey];

  return {
    id: `static-${meta.slug}`,
    slug: meta.slug,
    brandKey: meta.brandKey,
    pageTitle: content.title,
    pillarTitle: meta.pillarTitle,
    brandLabel: meta.brandLabel,
    kicker: content.kicker,
    headline: content.headline,
    headlineSecondary: content.headlineSecondary ?? null,
    description: content.description,
    hubCardDescription: meta.hubCardDescription,
    sections: content.sections,
    ctaLabel: content.cta?.label ?? null,
    ctaHref: content.cta?.href ?? null,
    secondaryCtaLabel: content.secondaryCta?.label ?? null,
    secondaryCtaHref: content.secondaryCta?.href ?? null,
    relatedLinks: content.relatedLinks ?? [],
    heroImagePath: null,
    logoImagePath: null,
    externalUrl: null,
    sortOrder: meta.sortOrder,
    status: "published",
    manuallyHidden: false,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}

const STATIC_ORGS = STATIC_WORK_ORG_META.map(staticOrgToPlatform);

export async function getPublicWorkOrgs(): Promise<PlatformWorkOrg[]> {
  const fromDb = await getPublishedWorkOrgsFromDb();
  const merged = mergePublishedWithStatic(fromDb, STATIC_ORGS);
  return merged.sort((a, b) => a.sortOrder - b.sortOrder || a.pillarTitle.localeCompare(b.pillarTitle));
}

export async function getPublicWorkOrgBySlug(slug: string): Promise<PlatformWorkOrg | null> {
  const fromDb = await getWorkOrgBySlugFromDb(slug);
  if (fromDb) return fromDb;
  return STATIC_ORGS.find((org) => org.slug === slug) ?? null;
}
