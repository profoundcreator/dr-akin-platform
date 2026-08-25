import { ECOSYSTEM_PILLARS } from "@/data/ecosystem";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  group?: string;
  disabled?: boolean;
}

export interface NavGroup {
  label: string;
  href: string;
  links: NavLink[];
}

export const TOP_LEVEL_LINKS: NavLink[] = [
  {
    label: "Events",
    href: "/events",
    description: "Upcoming gatherings & registrations",
  },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Work",
    href: "/work",
    links: [
      { label: "Work overview", href: "/work" },
      ...ECOSYSTEM_PILLARS.flatMap((pillar) =>
        pillar.platforms.map((platform) => ({
          label: platform.id === "african-union" ? "African Union" : platform.name,
          href: platform.href,
          group: pillar.name,
        })),
      ),
    ],
  },
  {
    label: "Meet Akin",
    href: "/meet-akin",
    links: [
      { label: "Meet overview", href: "/meet-akin", description: "Governance · Enterprise · Education" },
      { label: "Profile", href: "/meet-akin/profile", description: "Biography & credentials" },
      { label: "Continental Mandate", href: "/meet-akin/au-ambassador", description: "Special Emissary, African Union" },
      { label: "Board Governance", href: "/meet-akin/edu-governance", description: "Boards & advisory" },
      { label: "Keynote Speaking", href: "/meet-akin/speaking", description: "Stages & engagements" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    links: [
      { label: "Library overview", href: "/resources", description: "Nine published titles" },
      { label: "Insights & Writing", href: "/insights", description: "Articles, essays & papers" },
      { label: "Marketplace Ministry", href: "/resources#marketplace-ministry", description: "Faith & influence" },
      { label: "High Performance", href: "/resources#high-performance", description: "Process & execution" },
      { label: "Academic Excellence", href: "/resources#academic", description: "Students & educators" },
      { label: "Audio Archives", href: "/resources/audio", description: "Keynotes & conversations" },
    ],
  },
];

export interface FooterLink {
  label: string;
  href?: string;
  external?: boolean;
  action?: "newsletter";
  /** Invisible row to keep footer link columns aligned */
  spacer?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Pillars",
    links: [
      { label: "Governance", href: "/work#governance" },
      { label: "Enterprise", href: "/work#enterprise" },
      { label: "Education", href: "/work#education" },
      { label: "", spacer: true },
    ],
  },
  {
    title: "Meet Akin",
    links: [
      { label: "Profile", href: "/meet-akin/profile" },
      { label: "Continental Mandate", href: "/meet-akin/au-ambassador" },
      { label: "Board Governance", href: "/meet-akin/edu-governance" },
      { label: "Keynote Speaking", href: "/meet-akin/speaking" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Insights & Writing", href: "/insights" },
      { label: "The Library", href: "/resources" },
      { label: "Marketplace Ministry", href: "/resources#marketplace-ministry" },
      { label: "Audio Archives", href: "/resources/audio" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Events", href: "/events" },
      { label: "Contact", href: "/contact" },
      { label: "Stay connected", action: "newsletter" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];
