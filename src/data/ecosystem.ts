import { AU_TITLE } from "@/data/person-identity";

export type EcosystemPillarId = "governance" | "enterprise" | "education";

export interface EcosystemPlatform {
  id: string;
  name: string;
  href: string;
  summary: string;
  externalWebsite?: string;
  isNavigable?: boolean;
}

export interface EcosystemPillar {
  id: EcosystemPillarId;
  name: "Governance" | "Enterprise" | "Education";
  summary: string;
  platforms: readonly EcosystemPlatform[];
}

export const ECOSYSTEM_PILLARS: readonly EcosystemPillar[] = [
  {
    id: "governance",
    name: "Governance",
    summary:
      "Advancing institutional capacity, continental cooperation and ethical leadership through his African Union role and Future Africa.",
    platforms: [
      {
        id: "african-union",
        name: AU_TITLE,
        href: "/meet-akin/au-ambassador",
        summary:
          "Supporting continental dialogue, institutional cooperation and leadership aligned with Africa’s long-term development ambitions.",
      },
      {
        id: "future-africa",
        name: "Future Africa",
        href: "/work/future-africa",
        summary:
          "A continental platform designed to mobilise governments, institutions, business, academia, civil society, the diaspora and citizens around practical action for Agenda 2063.",
      },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    summary:
      "Helping leaders and organisations build resilient systems, improve performance and create sustainable value through AALD and PERFORMX.",
    platforms: [
      {
        id: "aald",
        name: "AALD",
        href: "/work/aald",
        summary:
          "Consulting, training and research for African corporates and diaspora institutions building stronger leadership and performance.",
      },
      {
        id: "performx",
        name: "PERFORMX",
        href: "/work/performx",
        summary:
          "PerformX Nexus — a catalytic ecosystem where leaders, institutions and sectors converge to perform at a higher level.",
      },
    ],
  },
  {
    id: "education",
    name: "Education",
    summary:
      "Expanding access to quality learning, educator development and youth opportunity through Erudio Hub and Auctus Africa.",
    platforms: [
      {
        id: "erudio-hub",
        name: "Erudio Hub",
        href: "/work/erudio-hub",
        summary:
          "Educational reform, educator development and institutional capacity for schools and systems preparing learners for a changing world.",
      },
      {
        id: "auctus-africa",
        name: "Auctus Africa",
        href: "/work/auctus-africa",
        summary:
          "A social transformation initiative connecting quality education, youth empowerment, environmental responsibility and economic opportunity across African communities.",
        externalWebsite: "https://auctusafrica.org/",
      },
    ],
  },
] as const;

export const ECOSYSTEM_PLATFORMS = ECOSYSTEM_PILLARS.flatMap((pillar) =>
  pillar.platforms.map((platform) => ({ ...platform, pillar: pillar.name })),
);

export const PUBLIC_WORK_SLUGS = [
  "future-africa",
  "aald",
  "performx",
  "erudio-hub",
  "auctus-africa",
] as const;
