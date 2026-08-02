export interface NavLink {
  label: string;
  href: string;
  description?: string;
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
      { label: "Work overview", href: "/work", description: "The four operating arms" },
      { label: "Corporate Transformation", href: "/work/aald", description: "AALD" },
      { label: "Educational Reform", href: "/work/erudio-hub", description: "Erudio Hub" },
      { label: "Execution Think Tank", href: "/work/performx", description: "PERFORMX" },
      { label: "Tech Alliances", href: "/work/tc-resource-technology", description: "TC Resource Tech" },
    ],
  },
  {
    label: "Meet Dr. Akin",
    href: "/meet-akin",
    links: [
      { label: "Meet overview", href: "/meet-akin", description: "Leadership across four spheres" },
      { label: "Profile", href: "/meet-akin/profile", description: "Biography & credentials" },
      { label: "Continental Mandate", href: "/meet-akin/au-ambassador", description: "AU Agenda 2063" },
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

export const FOOTER_COLUMNS = [
  {
    title: "Work",
    links: [
      { label: "Corporate Transformation", href: "/work/aald" },
      { label: "Educational Reform", href: "/work/erudio-hub" },
      { label: "Execution Think Tank", href: "/work/performx" },
      { label: "Tech Alliances", href: "/work/tc-resource-technology" },
    ],
  },
  {
    title: "Meet Dr. Akin",
    links: [
      { label: "Profile", href: "/meet-akin/profile" },
      { label: "AU Ambassador", href: "/meet-akin/au-ambassador" },
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
      { label: "Book Dr. Akin", href: "/book-dr-akin" },
      { label: "Track a Booking", href: "/track-booking" },
      { label: "Organizer Resources", href: "/organizer-resources" },
    ],
  },
];
