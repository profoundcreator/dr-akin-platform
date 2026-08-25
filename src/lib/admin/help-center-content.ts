import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  FileText,
  Headphones,
  Home,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  PackageOpen,
  ScrollText,
  Users,
} from "lucide-react";
import helpCenterMarkdown from "../../../docs/admin-help-center.md?raw";
import {
  filterSectionsByQuery,
  parseHelpCenterMarkdown,
  searchHelpSections,
  type HelpSection,
  type HelpSearchMatch,
} from "@/lib/admin/help-center-parser";

export type AdminQuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  sectionId: string;
  description: string;
};

export const ADMIN_QUICK_LINKS: AdminQuickLink[] = [
  {
    label: "Requests",
    href: "/admin/requests",
    icon: LayoutDashboard,
    sectionId: "2-requests-booking-pipeline",
    description: "Booking invitations",
  },
  {
    label: "Inbox",
    href: "/admin/inbox",
    icon: Inbox,
    sectionId: "3-inbox-enquiries",
    description: "Contact & enquiries",
  },
  {
    label: "Homepage",
    href: "/admin/homepage",
    icon: Home,
    sectionId: "4-homepage",
    description: "Hero & events strip",
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: CalendarDays,
    sectionId: "5-events",
    description: "Public events",
  },
  {
    label: "Books",
    href: "/admin/books",
    icon: BookOpen,
    sectionId: "6-books",
    description: "Library titles",
  },
  {
    label: "Insights",
    href: "/admin/insights",
    icon: FileText,
    sectionId: "7-insights-articles",
    description: "Articles",
  },
  {
    label: "Work",
    href: "/admin/work",
    icon: Briefcase,
    sectionId: "8-work-platform-pages",
    description: "Platform pages",
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: PackageOpen,
    sectionId: "10-organizer-resources",
    description: "Organizer files",
  },
  {
    label: "Audience",
    href: "/admin/audience",
    icon: Megaphone,
    sectionId: "11-audience",
    description: "Newsletter opt-ins",
  },
  {
    label: "Email preview",
    href: "/admin/settings/email-preview",
    icon: Mail,
    sectionId: "14-email-preview",
    description: "Transactional emails",
  },
  {
    label: "Team",
    href: "/admin/team",
    icon: Users,
    sectionId: "12-team",
    description: "Invites & roles",
  },
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    icon: ScrollText,
    sectionId: "16-audit-log",
    description: "Activity history",
  },
  {
    label: "Featured Episodes",
    href: "/admin/audio",
    icon: Headphones,
    sectionId: "15-featured-episodes-audio",
    description: "Podcast list",
  },
];

export const HELP_CENTER_SECTIONS: HelpSection[] = parseHelpCenterMarkdown(helpCenterMarkdown);

export function getHelpSectionById(id: string): HelpSection | undefined {
  return HELP_CENTER_SECTIONS.find((section) => section.id === id);
}

export function searchHelp(query: string): HelpSearchMatch[] {
  return searchHelpSections(HELP_CENTER_SECTIONS, query);
}

export function filterHelpSections(query: string): HelpSection[] {
  return filterSectionsByQuery(HELP_CENTER_SECTIONS, query);
}

export const POPULAR_HELP_SECTION_IDS = [
  "how-to-use-this-document",
  "1-getting-started",
  "9-working-with-images",
  "13-publishing-workflow-draft-approve-publish",
  "17-troubleshooting",
  "18-quick-reference-cards",
] as const;
