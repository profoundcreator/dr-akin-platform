import type { DbWorkOrg } from "@/lib/supabase/database.types";
import { mergePublishedWithStatic } from "@/lib/content/merge-published-with-static";
import { STATIC_WORK_ORG_META } from "@/lib/work-orgs/constants";
import { getWorkOrgHeroUrl } from "@/lib/work-orgs/orgs";
import type { PlatformWorkOrg, WorkOrgLink, WorkOrgSection } from "@/lib/work-orgs/types";
import { SITE_PAGES } from "@/data/site-content";
import type { EventBrand } from "@/lib/supabase/database.types";
import {
  isSupabaseBuildEnvConfigured,
  warnIfSupabaseBuildEnvMissing,
} from "@/lib/build/supabase-build-env";

function mapBuildRow(row: DbWorkOrg): PlatformWorkOrg {
  return {
    id: row.id,
    slug: row.slug,
    brandKey: row.brand_key as EventBrand,
    pageTitle: row.page_title,
    pillarTitle: row.pillar_title,
    brandLabel: row.brand_label,
    kicker: row.kicker,
    headline: row.headline,
    headlineSecondary: row.headline_secondary,
    description: row.description,
    hubCardDescription: row.hub_card_description,
    sections: Array.isArray(row.sections) ? (row.sections as WorkOrgSection[]) : [],
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    secondaryCtaLabel: row.secondary_cta_label,
    secondaryCtaHref: row.secondary_cta_href,
    relatedLinks: Array.isArray(row.related_links) ? (row.related_links as WorkOrgLink[]) : [],
    heroImagePath: row.hero_image_path,
    logoImagePath: row.logo_image_path,
    externalUrl: row.external_url,
    sortOrder: row.sort_order,
    status: row.status,
    manuallyHidden: row.manually_hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

export async function fetchPublishedWorkOrgsForBuild(): Promise<PlatformWorkOrg[]> {
  if (!isSupabaseBuildEnvConfigured()) {
    warnIfSupabaseBuildEnvMissing("work org static paths");
    return [];
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/work_orgs?select=*&status=eq.published&manually_hidden=eq.false&order=sort_order.asc,pillar_title.asc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      },
    );

    if (!response.ok) return [];
    const data = (await response.json()) as DbWorkOrg[];
    return data.map(mapBuildRow);
  } catch {
    return [];
  }
}

export function getStaticWorkOrgPaths(): PlatformWorkOrg[] {
  return STATIC_WORK_ORG_META.map(staticOrgToPlatform);
}

export async function fetchAllWorkOrgsForBuild(): Promise<PlatformWorkOrg[]> {
  const fromDb = await fetchPublishedWorkOrgsForBuild();
  const merged = mergePublishedWithStatic(fromDb, getStaticWorkOrgPaths());
  return merged.sort((a, b) => a.sortOrder - b.sortOrder || a.pillarTitle.localeCompare(b.pillarTitle));
}

export { getWorkOrgHeroUrl };
