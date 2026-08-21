import { PERSON_IDENTITY, PUBLIC_NAME } from "@/data/person-identity";
import type { ContentPlanData } from "@/lib/content-plans/types";

export const AALD_PERFORMX_PLAN_SLUG = "aald-performx";

export const AALD_PERFORMX_PLAN_SEED: ContentPlanData = {
  slug: AALD_PERFORMX_PLAN_SLUG,
  title: "AALD + PerformX Nexus + Summit 2026",
  status: "draft",
  approvalNote: "",
  variables: {
    "summit.dates": {
      key: "summit.dates",
      label: "Summit dates",
      recommended: "20–21 November 2026",
      alternate: "21–22 November 2025 (Nexus brochure)",
      source: "PerformX Summit 2026 concept note",
      value: "20–21 November 2026",
      status: "recommended",
    },
    "summit.theme": {
      key: "summit.theme",
      label: "Summit theme",
      recommended: "Leading Frontiers: Innovate, Integrate, Impact",
      alternate: "Building Bold. Executing Smart. Performing Beyond. (Nexus brochure)",
      source: "PerformX Summit 2026 concept note",
      value: "Leading Frontiers: Innovate, Integrate, Impact",
      status: "recommended",
    },
    "summit.venue": {
      key: "summit.venue",
      label: "Summit venue",
      recommended: "Landmark Event Centre, Lagos",
      source: "PerformX Summit 2026 concept note",
      value: "Landmark Event Centre, Lagos",
      status: "recommended",
    },
    "performx.positioning": {
      key: "performx.positioning",
      label: "PerformX positioning",
      recommended: "PerformX Nexus — The Catalytic Ecosystem",
      alternate: "Execution Think Tank (current site)",
      source: "PerformX Nexus brochure",
      value: "PerformX Nexus — The Catalytic Ecosystem",
      status: "recommended",
    },
    "reach.metric": {
      key: "reach.metric",
      label: "Reach metric",
      recommended: PERSON_IDENTITY.metrics.peopleReached,
      alternate: "700,000+ (brochure)",
      source: "continental-copy-deck.md / corporate profile",
      value: PERSON_IDENTITY.metrics.peopleReached,
      status: "recommended",
    },
    "experience.years": {
      key: "experience.years",
      label: "Years of experience",
      recommended: `${PERSON_IDENTITY.metrics.yearsExperience} years`,
      alternate: "5 years (brochure)",
      source: "continental-copy-deck.md / client instruction",
      value: `${PERSON_IDENTITY.metrics.yearsExperience} years`,
      status: "recommended",
    },
    "identity.name": {
      key: "identity.name",
      label: "Public name",
      recommended: PUBLIC_NAME,
      source: "person-identity.ts",
      value: PUBLIC_NAME,
      status: "recommended",
    },
    "sponsor.pricing.public": {
      key: "sponsor.pricing.public",
      label: "Public sponsor pricing",
      recommended: "Hidden — Request partnership deck",
      alternate: "₦50M sector ownership (concept note — internal only)",
      source: "Editorial policy",
      value: "Hidden — Request partnership deck",
      status: "recommended",
    },
    "horizon.council.depth": {
      key: "horizon.council.depth",
      label: "Horizon Council on work page",
      recommended: "Teaser + CTA (v1)",
      alternate: "Full programme section",
      source: "PerformX Nexus brochure",
      value: "Teaser + CTA (v1)",
      status: "recommended",
    },
    "primary.cta": {
      key: "primary.cta",
      label: "Primary CTAs",
      recommended: "/contact and /book-dr-akin",
      alternate: "Brand emails (performx@aaldcompany.org)",
      source: "Site routing policy",
      value: "/contact and /book-dr-akin",
      status: "recommended",
    },
  },
  decisions: {
    summit_theme_2026: {
      id: "summit_theme_2026",
      title: "Use 2026 concept note theme on the summit event page",
      context:
        "The Nexus brochure references a 2025 edition with a different theme. The event page should reflect the confirmed 2026 programme.",
      options: [
        { id: "yes", label: "Yes — use Leading Frontiers: Innovate, Integrate, Impact", recommended: true },
        { id: "nexus_theme", label: "No — use Nexus brochure theme instead" },
      ],
      choice: "yes",
      notes: "",
    },
    nexus_positioning: {
      id: "nexus_positioning",
      title: 'Replace "Execution Think Tank" with PerformX Nexus positioning',
      context:
        "The work page and ecosystem hub card currently describe PERFORMX as an execution think tank. The Nexus brochure positions it as a three-pillar catalytic ecosystem.",
      options: [
        { id: "yes", label: "Yes — adopt PerformX Nexus ecosystem framing", recommended: true },
        { id: "keep", label: "No — keep Execution Think Tank positioning" },
      ],
      choice: "yes",
      notes: "",
    },
    contact_routing: {
      id: "contact_routing",
      title: "Contact routing",
      context: "Brochures list brand emails and phone numbers. The site has unified contact and booking flows.",
      options: [
        {
          id: "site_primary",
          label: "Site routes primary (/contact, /book-dr-akin); brand email secondary",
          recommended: true,
        },
        { id: "brand_primary", label: "Brand emails and phones primary on page" },
      ],
      choice: "site_primary",
      notes: "",
    },
    no_public_pricing: {
      id: "no_public_pricing",
      title: "No public sponsor pricing on the web",
      context:
        "The 2026 concept note includes internal sector ownership figures. Public pages should invite partnership conversations instead.",
      options: [
        { id: "yes", label: "Yes — hide pricing; use Request partnership deck CTA", recommended: true },
        { id: "publish", label: "No — publish sponsor tiers/pricing publicly" },
      ],
      choice: "yes",
      notes: "",
    },
    horizon_teaser: {
      id: "horizon_teaser",
      title: "Horizon Council depth on PerformX work page (v1)",
      context:
        "The Nexus brochure describes Horizon Council in detail. Version 1 can tease the pillar with a CTA or include a full section.",
      options: [
        { id: "teaser", label: "Teaser only — short summary + contact CTA", recommended: true },
        { id: "full", label: "Full Horizon Council section on work page" },
      ],
      choice: "teaser",
      notes: "",
    },
  },
  sectionApprovals: {},
  checklist: {
    all_decisions: {
      id: "all_decisions",
      label: "All five decisions recorded with a selected option",
      checked: false,
    },
    variables_reviewed: {
      id: "variables_reviewed",
      label: 'Variables register reviewed (no unresolved conflicts marked "hold")',
      checked: false,
    },
    aald_copy: {
      id: "aald_copy",
      label: "/work/aald copy map approved",
      checked: false,
    },
    performx_copy: {
      id: "performx_copy",
      label: "/work/performx copy map approved",
      checked: false,
    },
    summit_copy: {
      id: "summit_copy",
      label: "/events/performx-summit-2026 copy map approved",
      checked: false,
    },
    cross_links: {
      id: "cross_links",
      label: "Cross-links and CTA destinations approved",
      checked: false,
    },
    claims_aligned: {
      id: "claims_aligned",
      label: "Claims register aligned (reach, years, identity — no brochure conflicts published)",
      checked: false,
    },
    approver_signoff: {
      id: "approver_signoff",
      label: "Approver sign-off (super_admin / executive_assistant / admin_manager)",
      checked: false,
    },
  },
  pages: [
    {
      id: "work-aald",
      route: "/work/aald",
      title: "AALD — Learning & Development for African Enterprise",
      hero: {
        kicker: "Enterprise · Consulting · Training · Research",
        headline: "Building stronger African organisations—",
        headlineSecondary: "through consulting, training and research.",
        description:
          "Akin Akinpelu Learning & Development Company partners with corporates across Africa and African institutions in the diaspora to strengthen leadership, sharpen strategy and build cultures that perform at scale.",
        ctaLabel: "Invite Akin Akinpelu to speak",
        ctaHref: "/meet-akin/speaking",
        secondaryCtaLabel: "Discuss a partnership",
        secondaryCtaHref: "/contact?platform=aald",
      },
      sections: [
        {
          id: "aald-what-we-do",
          title: "What we do",
          body: "AALD delivers innovative consulting, executive training and applied research for organisations building across the continent and beyond.",
          bullets: [
            "Strategic consulting and organisational diagnostics",
            "Executive training and leadership development",
            "Applied research and capability building",
            "Culture, performance and transformation support",
          ],
          status: "pending",
        },
        {
          id: "aald-who-we-serve",
          title: "Who we serve",
          body: "We work with African corporates, public institutions, NGOs and diaspora organisations that need practical leadership and performance systems—not generic playbooks.",
          bullets: [
            "Corporate leadership teams and boards",
            "Public-sector and institutional leaders",
            "NGOs and social-impact organisations",
            "African institutions in the global diaspora",
          ],
          status: "pending",
        },
        {
          id: "aald-why-aald",
          title: "Why AALD",
          body: `Founded and led by ${PUBLIC_NAME}, AALD combines continental perspective with disciplined execution—helping organisations turn ambition into measurable performance.`,
          bullets: [
            "Continental reach across 20+ countries",
            `${PERSON_IDENTITY.metrics.peopleReached} people reached through leadership work`,
            `${PERSON_IDENTITY.metrics.yearsExperience} years of institutional leadership experience`,
            "Research-backed consulting and training methodologies",
          ],
          status: "pending",
        },
        {
          id: "aald-ecosystem",
          title: "Part of a broader ecosystem",
          body: "AALD sits within the Enterprise pillar alongside PerformX Nexus—connecting organisational development with high-performance leadership convenings.",
          bullets: [
            "PerformX Nexus catalytic ecosystem → /work/performx",
            "PerformX Summit 2026 → /events/performx-summit-2026",
          ],
          status: "pending",
        },
      ],
    },
    {
      id: "work-performx",
      route: "/work/performx",
      title: "PerformX Nexus — The Catalytic Ecosystem",
      hero: {
        kicker: "PerformX Nexus · Enterprise",
        headline: "Building bold.",
        headlineSecondary: "Executing smart. Performing beyond.",
        description:
          "PerformX Nexus is a catalytic ecosystem where leaders, institutions and sectors converge to turn strategy into disciplined execution and measurable impact.",
        ctaLabel: "Book an advisory session",
        ctaHref: "/book-dr-akin",
        secondaryCtaLabel: "Register interest in the summit",
        secondaryCtaHref: "/events/performx-summit-2026",
      },
      sections: [
        {
          id: "performx-pillars",
          title: "Three pillars",
          body: "PerformX Nexus integrates convening, advisory council work and impact programmes into one ecosystem.",
          bullets: [
            "PerformX Summit — flagship leadership convening (delegates, speakers, sponsors)",
            "Horizon Council — strategic advisory circle for sector and institutional leaders (teaser in v1)",
            "Impact Core — programmes that translate summit insights into sustained organisational performance",
          ],
          status: "pending",
        },
        {
          id: "performx-who",
          title: "Who it serves",
          body: "PerformX Nexus is designed for leaders and institutions ready to move from ambition to accountable execution.",
          bullets: [
            "C-suite and senior operating leaders",
            "Boards and institutional governing bodies",
            "Sector conveners across eight strategic sectors",
            "Partners seeking catalytic sponsorship and collaboration",
          ],
          status: "pending",
        },
        {
          id: "performx-summit-teaser",
          title: "PerformX Summit 2026",
          body: "The next edition convenes 20–21 November 2026 at Landmark Event Centre, Lagos, under the theme Leading Frontiers: Innovate, Integrate, Impact.",
          bullets: [
            "Eight sectors · Power Room sessions · Nexus Honors",
            "Delegate, speaker and partnership pathways",
            "Full event details → /events/performx-summit-2026",
          ],
          status: "pending",
        },
        {
          id: "performx-partnership",
          title: "Partnerships",
          body: "Sector ownership and sponsorship packages are available on request. Public pages do not list pricing—start a conversation with the team.",
          bullets: [
            "Request partnership deck → /contact",
            "Parent brand: AALD → /work/aald",
          ],
          status: "pending",
        },
      ],
    },
    {
      id: "event-summit-2026",
      route: "/events/performx-summit-2026",
      title: "PerformX Summit 2026",
      hero: {
        kicker: "PerformX Summit · 20–21 November 2026",
        headline: "Leading Frontiers:",
        headlineSecondary: "Innovate, Integrate, Impact.",
        description:
          "A two-day leadership convening at Landmark Event Centre, Lagos—where sector leaders, institutions and partners converge to perform at a higher level.",
        ctaLabel: "Register interest",
        ctaHref: "/contact",
        secondaryCtaLabel: "Explore PerformX Nexus",
        secondaryCtaHref: "/work/performx",
      },
      sections: [
        {
          id: "summit-about",
          title: "About the summit",
          body: "PerformX Summit 2026 brings together delegates, speakers and sponsors across eight strategic sectors for keynotes, Power Room sessions and the Nexus Honors.",
          bullets: [
            "Theme: Leading Frontiers — Innovate, Integrate, Impact",
            "Venue: Landmark Event Centre, Lagos",
            "Dates: 20–21 November 2026 · Africa/Lagos timezone",
            "Part of PerformX Nexus and AALD",
          ],
          status: "pending",
        },
        {
          id: "summit-audiences",
          title: "Delegates, speakers and sponsors",
          body: "Each audience pathway is coordinated through the team. Registration URLs will be added when available.",
          bullets: [
            "Delegates — leadership teams and sector professionals",
            "Speakers — practitioners with proven execution track records",
            "Sponsors — sector ownership and partnership opportunities (deck on request)",
          ],
          status: "pending",
        },
        {
          id: "summit-sectors",
          title: "Eight sectors",
          body: "The summit spans sectors where execution discipline and institutional leadership intersect—details confirmed in the partnership deck.",
          bullets: [
            "Cross-sector Power Room convenings",
            "Nexus Honors recognition programme",
            "Practical tools for strategy-to-execution alignment",
          ],
          status: "pending",
        },
        {
          id: "summit-lineage",
          title: "Brand lineage",
          body: "PerformX Summit is the flagship convening of PerformX Nexus, an Enterprise pillar platform alongside AALD.",
          bullets: [
            "PerformX Nexus ecosystem → /work/performx",
            "AALD parent brand → /work/aald",
            "Book Dr Akin for advisory → /book-dr-akin",
          ],
          status: "pending",
        },
      ],
    },
  ],
};
