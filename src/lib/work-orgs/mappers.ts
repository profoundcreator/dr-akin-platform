import type { PageContent } from "@/data/site-content";
import type { PlatformWorkOrg } from "@/lib/work-orgs/types";

export function workOrgToPageContent(org: PlatformWorkOrg): PageContent {
  return {
    slug: `work/${org.slug}`,
    title: org.pageTitle,
    kicker: org.kicker,
    headline: org.headline,
    headlineSecondary: org.headlineSecondary ?? undefined,
    description: org.description,
    sections: org.sections,
    cta:
      org.ctaLabel && org.ctaHref
        ? { label: org.ctaLabel, href: org.ctaHref }
        : undefined,
    secondaryCta:
      org.secondaryCtaLabel && org.secondaryCtaHref
        ? { label: org.secondaryCtaLabel, href: org.secondaryCtaHref }
        : undefined,
    relatedLinks: org.relatedLinks.length > 0 ? org.relatedLinks : undefined,
  };
}

export function formatWorkOrgNumber(sortOrder: number): string {
  return String(sortOrder).padStart(2, "0");
}
