import { AALD_PERFORMX_PLAN_SEED } from "@/lib/content-plans/aald-performx-seed";
import type { ContentPlanData } from "@/lib/content-plans/types";
import type { WorkOrgSection } from "@/lib/work-orgs/types";

export function planToWorkOrgContent(plan: ContentPlanData = AALD_PERFORMX_PLAN_SEED) {
  const aaldPage = plan.pages.find((p) => p.id === "work-aald");
  const performxPage = plan.pages.find((p) => p.id === "work-performx");

  if (!aaldPage || !performxPage) {
    throw new Error("Plan is missing required work page definitions");
  }

  const mapSections = (sections: typeof aaldPage.sections): WorkOrgSection[] =>
    sections.map(({ title, body, bullets }) => ({ title, body, bullets }));

  return {
    aald: {
      slug: "aald",
      brandKey: "aald" as const,
      pageTitle: aaldPage.title,
      pillarTitle: "Enterprise",
      brandLabel: "AALD",
      kicker: aaldPage.hero.kicker,
      headline: aaldPage.hero.headline,
      headlineSecondary: aaldPage.hero.headlineSecondary ?? "",
      description: aaldPage.hero.description,
      hubCardDescription:
        "Consulting, training and research for African corporates and diaspora institutions building stronger leadership and performance.",
      sections: mapSections(aaldPage.sections),
      ctaLabel: aaldPage.hero.ctaLabel ?? "",
      ctaHref: aaldPage.hero.ctaHref ?? "/contact",
      secondaryCtaLabel: aaldPage.hero.secondaryCtaLabel ?? "",
      secondaryCtaHref: aaldPage.hero.secondaryCtaHref ?? "/contact",
      relatedLinks: [
        { label: "PerformX Nexus", href: "/work/performx" },
        { label: "PerformX Summit 2026", href: "/events/performx-summit-2026" },
      ],
      sortOrder: 2,
    },
    performx: {
      slug: "performx",
      brandKey: "performx" as const,
      pageTitle: performxPage.title,
      pillarTitle: "Enterprise",
      brandLabel: "PERFORMX",
      kicker: performxPage.hero.kicker,
      headline: performxPage.hero.headline,
      headlineSecondary: performxPage.hero.headlineSecondary ?? "",
      description: performxPage.hero.description,
      hubCardDescription:
        "PerformX Nexus — a catalytic ecosystem convening leaders, institutions and sectors to perform at a higher level.",
      sections: mapSections(performxPage.sections),
      ctaLabel: performxPage.hero.ctaLabel ?? "",
      ctaHref: performxPage.hero.ctaHref ?? "/book-dr-akin",
      secondaryCtaLabel: performxPage.hero.secondaryCtaLabel ?? "",
      secondaryCtaHref: performxPage.hero.secondaryCtaHref ?? "/events/performx-summit-2026",
      relatedLinks: [
        { label: "PerformX Summit 2026", href: "/events/performx-summit-2026" },
        { label: "AALD", href: "/work/aald" },
      ],
      sortOrder: 3,
    },
  };
}

export function planToSummitEvent(plan: ContentPlanData = AALD_PERFORMX_PLAN_SEED) {
  const summitPage = plan.pages.find((p) => p.id === "event-summit-2026");
  if (!summitPage) throw new Error("Plan is missing summit event page definition");

  const description = summitPage.sections.map((s) => `${s.title}\n\n${s.body}`).join("\n\n");

  return {
    slug: "performx-summit-2026",
    title: summitPage.title,
    description,
    seoDescription:
      "PerformX Summit 2026 — Leading Frontiers: Innovate, Integrate, Impact. 20–21 November at Landmark Event Centre, Lagos.",
    eventType: "org_brand" as const,
    brand: "performx" as const,
    startsAt: "2026-11-20T09:00:00+01:00",
    endsAt: "2026-11-21T18:00:00+01:00",
    timezone: "Africa/Lagos",
    location: plan.variables["summit.venue"]?.value ?? "Landmark Event Centre, Lagos",
    locationType: "in_person",
  };
}

export function planToSiteContentKeys(plan: ContentPlanData = AALD_PERFORMX_PLAN_SEED) {
  const work = planToWorkOrgContent(plan);
  return {
    "work-aald": work.aald,
    "work-performx": work.performx,
  };
}
