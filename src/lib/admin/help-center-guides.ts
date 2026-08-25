import type { AdminRole } from "@/lib/supabase/database.types";
import { ADMIN_ROLE_LABELS } from "@/lib/auth/permissions";

export type HelpGuideCategory =
  | "start"
  | "daily"
  | "content"
  | "tools"
  | "reference";

export type HelpGuideCategoryMeta = {
  id: HelpGuideCategory;
  label: string;
  description: string;
};

export const HELP_GUIDE_CATEGORIES: HelpGuideCategoryMeta[] = [
  {
    id: "start",
    label: "Start here",
    description: "Sign-in, navigation, and roles",
  },
  {
    id: "daily",
    label: "Daily work",
    description: "Bookings and enquiries",
  },
  {
    id: "content",
    label: "Website content",
    description: "Pages visitors see publicly",
  },
  {
    id: "tools",
    label: "Tools & admin",
    description: "Files, audience, team, audit",
  },
  {
    id: "reference",
    label: "Reference",
    description: "Images, publishing rules, fixes",
  },
];

export type HelpRoleNote = {
  headline: string;
  canDo: string[];
  cannotDo?: string[];
  tip?: string;
};

export type HelpGuide = {
  id: string;
  title: string;
  shortTitle: string;
  category: HelpGuideCategory;
  summary: string;
  adminHref?: string;
  adminLabel?: string;
  mustKnow: string[];
  steps: { title: string; detail: string }[];
  commonMistakes?: string[];
  essentialForRoles: AdminRole[];
  relevantRoles: AdminRole[] | "all";
  roleNotes: Partial<Record<AdminRole | "all", HelpRoleNote>>;
  relatedSectionIds: string[];
};

export const HELP_ROLE_OPTIONS: { value: AdminRole | "all"; label: string }[] = [
  { value: "all", label: "All roles (compare)" },
  ...(
    Object.entries(ADMIN_ROLE_LABELS) as [AdminRole, string][]
  ).map(([value, label]) => ({ value, label })),
];

function note(
  headline: string,
  canDo: string[],
  cannotDo?: string[],
  tip?: string,
): HelpRoleNote {
  return { headline, canDo, cannotDo, tip };
}

const APPROVER_ROLES: AdminRole[] = ["super_admin", "admin_manager", "executive_assistant"];
const CONTENT_WRITERS: AdminRole[] = [
  "super_admin",
  "admin_manager",
  "technical_admin",
  "executive_assistant",
  "executive_reviewer",
  "inbox_manager",
  "resource_manager",
];
const READ_ONLY: AdminRole[] = ["read_only_auditor"];

export const HELP_GUIDES: HelpGuide[] = [
  {
    id: "how-to-use-this-document",
    title: "How to use this guide",
    shortTitle: "How to use",
    category: "start",
    summary:
      "Pick a topic on the left. Read the highlighted boxes first — they tell you exactly what matters for your role before you touch anything in the back office.",
    mustKnow: [
      "Use the search bar or press / to find a topic instantly.",
      "Set **View guide as** to your role (or compare all roles) before reading a section.",
      "Every topic opens in this panel — you never need to scroll one long page.",
      "Topics marked **Key for you** are the ones your role uses most often.",
    ],
    steps: [
      {
        title: "Choose your role lens",
        detail:
          "At the top of Help, open **View guide as** and pick your role. The yellow and blue boxes change to show what you can and cannot do.",
      },
      {
        title: "Pick a topic",
        detail:
          "Click any topic in the left list. The full instructions open here on the right.",
      },
      {
        title: "Open the tool",
        detail:
          "When a topic matches a back-office page, use **Open [page]** at the top of the panel to go straight there.",
      },
    ],
    essentialForRoles: [
      "super_admin",
      "admin_manager",
      "technical_admin",
      "executive_assistant",
      "executive_reviewer",
      "inbox_manager",
      "resource_manager",
      "read_only_auditor",
    ],
    relevantRoles: "all",
    roleNotes: {
      all: note(
        "Everyone with back-office access can read every guide.",
        [
          "Search and browse all topics",
          "Switch the role lens to see another colleague's permissions",
          "Jump to admin pages from guide links",
        ],
        undefined,
        "If something in the admin looks different from the guide, your role is the first thing to check.",
      ),
    },
    relatedSectionIds: ["1-getting-started"],
  },
  {
    id: "1-getting-started",
    title: "Getting started",
    shortTitle: "Getting started",
    category: "start",
    summary:
      "The back office is the private workspace for running the website and booking operations. It is not the public site — visitors never see it.",
    adminHref: "/admin/login",
    adminLabel: "Admin login",
    mustKnow: [
      "Sign in at **/admin/login** with the email you were invited on.",
      "After sign-in you usually land on **Requests** — the booking pipeline.",
      "Your **name and role** appear under every page title. That role controls which buttons you see.",
      "Some sidebar items are hidden if your role does not include access — that is normal, not a bug.",
      "If you were invited but the link opens localhost, ask a Super Admin to fix Supabase Auth URLs and resend the invite.",
    ],
    steps: [
      {
        title: "Accept your invite",
        detail:
          "Open the email invite, set your password, then sign in at /admin/login.",
      },
      {
        title: "Find your role",
        detail:
          "Look under the page header: “Your Name · Executive Assistant” (for example). That label is your permission level.",
      },
      {
        title: "Learn the sidebar",
        detail:
          "Requests and Inbox are daily EA work. Events, Books, Insights, and Work are public content. Help is always at the bottom.",
      },
      {
        title: "When in doubt",
        detail:
          "Open Help, set the role lens to your role, and read the **Must know** box on any topic before clicking buttons in the admin.",
      },
    ],
    commonMistakes: [
      "Assuming a missing button means the site is broken — usually it means your role cannot perform that action.",
      "Editing the homepage without realising changes go live immediately (no draft step).",
      "Using the public website URL instead of /admin/login.",
    ],
    essentialForRoles: [
      "super_admin",
      "admin_manager",
      "technical_admin",
      "executive_assistant",
      "executive_reviewer",
      "inbox_manager",
      "resource_manager",
      "read_only_auditor",
    ],
    relevantRoles: "all",
    roleNotes: {
      super_admin: note(
        "You have full back-office control.",
        [
          "Access every sidebar item including Team and Audit Log",
          "Approve and publish all content",
          "Invite team members and permanently delete content",
        ],
        undefined,
        "Mark the primary account as **founder** once for extra protection.",
      ),
      technical_admin: note(
        "You handle platform and technical setup.",
        [
          "Access Team and Audit Log",
          "Fix migration and Supabase configuration issues",
          "Export audit logs",
        ],
        ["Approve marketing content unless also given an approver role"],
      ),
      admin_manager: note(
        "You run operations and approve content.",
        [
          "Approve and publish events, books, insights, and work pages",
          "Manage inbox, resources, and operational team roles",
          "Permanently delete managed content",
        ],
      ),
      executive_assistant: note(
        "You are the primary daily operator.",
        [
          "Manage Requests and Inbox end to end",
          "Approve and publish content",
          "Grant organizer materials on confirmed bookings",
        ],
        ["Invite new team members or change Super Admin roles"],
        "Start each day on Requests, then Inbox.",
      ),
      executive_reviewer: note(
        "You review bookings without editing public content.",
        [
          "View and update booking request statuses",
          "Read inbox and request details",
        ],
        [
          "Publish events, books, insights, or work pages",
          "Edit homepage settings",
        ],
      ),
      inbox_manager: note(
        "You focus on enquiries.",
        [
          "Read and update inbox statuses",
          "Convert suitable enquiries to booking requests",
        ],
        ["Approve or publish public website content"],
      ),
      resource_manager: note(
        "You maintain the organizer file library.",
        [
          "Upload and retire resource files",
          "View the Resources catalog",
        ],
        [
          "Assign grants to bookings (Executive Assistant does this)",
          "Publish public content",
        ],
      ),
      read_only_auditor: note(
        "You have view-only access for oversight.",
        [
          "View Requests, Inbox, content lists, and Audit Log",
          "Search and export audit history is limited to Super Admin / Technical Admin",
        ],
        [
          "Save any changes — all edit and publish buttons are hidden or disabled",
        ],
        "If you need to test a workflow, ask an EA to walk you through on a call.",
      ),
      all: note(
        "Every active team member can sign in and open Help.",
        [
          "Browse all help topics",
          "Use the role lens to compare permissions",
        ],
      ),
    },
    relatedSectionIds: ["2-requests-booking-pipeline", "13-publishing-workflow-draft-approve-publish"],
  },
  {
    id: "2-requests-booking-pipeline",
    title: "Requests (booking pipeline)",
    shortTitle: "Requests",
    category: "daily",
    summary:
      "Every invitation to speak or appear — from the public Book Dr. Akin form — lands here. This is the Executive Assistant command centre.",
    adminHref: "/admin/requests",
    adminLabel: "Requests",
    mustKnow: [
      "This is usually your **first stop** after sign-in.",
      "Use **Quick review** for a fast screening modal; open **Detail** for the full workflow.",
      "Two statuses matter: **Organizer status** (what the organizer sees on their tracker) and **Internal EA status** (team-only).",
      "Messages to the organizer appear on their **public booking tracker** — write professionally.",
      "Grant **Organizer materials** on the detail page once a booking is confirmed.",
    ],
    steps: [
      { title: "Scan the dashboard", detail: "Check New and Under review counts. Use filters for conflicts or pending info." },
      { title: "Quick review or open detail", detail: "Quick review for triage; detail for status changes, notes, and file grants." },
      { title: "Update both statuses", detail: "Set internal workflow status for the team and organizer-facing status for the client." },
      { title: "Add a tracker message when needed", detail: "Optional message to organizer — they see this on their tracking link." },
      { title: "Attach materials", detail: "On confirmed bookings, grant PDFs/ZIPs from Resources (see Organizer resources guide)." },
    ],
    commonMistakes: [
      "Updating internal status but forgetting organizer status — the client sees stale info on their tracker.",
      "Writing internal notes with language not suitable for external eyes — keep internal notes team-only.",
    ],
    essentialForRoles: ["super_admin", "admin_manager", "executive_assistant", "executive_reviewer"],
    relevantRoles: ["super_admin", "admin_manager", "executive_assistant", "executive_reviewer", "read_only_auditor"],
    roleNotes: {
      executive_assistant: note(
        "You own this pipeline day to day.",
        ["Change all statuses", "Send organizer messages", "Grant and revoke materials on your bookings"],
      ),
      executive_reviewer: note(
        "You can review and update booking workflow.",
        ["View all request details", "Update statuses"],
        ["Grant organizer materials unless also given resource assign rights"],
      ),
      read_only_auditor: note(
        "View only.",
        ["Read all request details and history"],
        ["Save status changes or grant files"],
      ),
    },
    relatedSectionIds: ["3-inbox-enquiries", "10-organizer-resources"],
  },
  {
    id: "3-inbox-enquiries",
    title: "Inbox (enquiries)",
    shortTitle: "Inbox",
    category: "daily",
    summary:
      "All contact forms, newsletter signups, summit interest, and similar messages arrive here in one unified inbox.",
    adminHref: "/admin/inbox",
    adminLabel: "Inbox",
    mustKnow: [
      "Sources include contact form, booking form, footer newsletter, and summit interest.",
      "Move items through statuses: **New → Open → Awaiting Reply → Resolved** (or Spam / Archived).",
      "**Convert to booking request** turns a suitable enquiry into a structured request with missing fields marked pending.",
      "Search works across subject lines and contact details.",
    ],
    steps: [
      { title: "Filter to New", detail: "Start with unread items each session." },
      { title: "Open detail for full context", detail: "Read the complete message before changing status." },
      { title: "Reply outside the system if needed", detail: "Then mark Awaiting Reply or Resolved to match reality." },
      { title: "Convert when appropriate", detail: "Use Convert to booking request — you will land on the new Requests detail page." },
    ],
    essentialForRoles: ["super_admin", "admin_manager", "executive_assistant", "inbox_manager"],
    relevantRoles: ["super_admin", "admin_manager", "executive_assistant", "inbox_manager", "executive_reviewer", "read_only_auditor"],
    roleNotes: {
      inbox_manager: note(
        "Inbox is your primary workspace.",
        ["Change all inbox statuses", "Convert enquiries to bookings"],
      ),
      executive_reviewer: note(
        "You can view inbox items.",
        ["Read messages and statuses"],
        ["Change statuses unless your role was expanded"],
      ),
      read_only_auditor: note("View only.", ["Read inbox items"], ["Change statuses"]),
    },
    relatedSectionIds: ["2-requests-booking-pipeline"],
  },
  {
    id: "4-homepage",
    title: "Homepage",
    shortTitle: "Homepage",
    category: "content",
    summary:
      "Controls the public homepage hero and whether the events strip appears. Changes save **immediately** — there is no draft step.",
    adminHref: "/admin/homepage",
    adminLabel: "Homepage",
    mustKnow: [
      "**Every save goes live instantly.** Double-check before clicking save.",
      "Hero layout: Portrait (default), Full-width banner, or Minimal (text only).",
      "The **featured event** is chosen in Events admin — here you only toggle whether the events section shows.",
      "Banner and portrait images are optional — use Hide image / Remove image like other admin pages.",
    ],
    steps: [
      { title: "Pick hero layout", detail: "Portrait keeps Dr. Akinpelu’s portrait on the right. Banner uses a wide image. Minimal is headline only." },
      { title: "Upload or hide images if needed", detail: "See Working with images for exact pixel sizes." },
      { title: "Toggle events section", detail: "Enable the strip, then set which event is featured in Events admin." },
      { title: "Save once", detail: "Refresh the public homepage in a new tab to confirm." },
    ],
    commonMistakes: [
      "Expecting a draft/publish flow — homepage does not have one.",
      "Enabling the events strip but forgetting to pick a featured event in Events admin.",
    ],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: APPROVER_ROLES,
    roleNotes: {
      executive_assistant: note(
        "You can edit and save homepage settings.",
        ["Change hero layout", "Upload, hide, or remove banner/portrait images", "Toggle events section"],
      ),
      executive_reviewer: note(
        "Homepage editing is not part of your role.",
        ["View the public homepage"],
        ["Access Homepage admin or save changes"],
      ),
    },
    relatedSectionIds: ["5-events", "9-working-with-images"],
  },
  {
    id: "5-events",
    title: "Events",
    shortTitle: "Events",
    category: "content",
    summary:
      "Create and manage public event pages at /events/{slug}. One event can be featured on the homepage.",
    adminHref: "/admin/events",
    adminLabel: "Events",
    mustKnow: [
      "Workflow: **Save draft → Submit for approval → Publish** (approvers can publish directly).",
      "**Hide** removes a published event from the public site without deleting it.",
      "Cover image is optional — 1600×900 px recommended.",
      "Set **Feature on homepage** here; enable the events strip on Homepage admin first.",
      "Approvers see a **pending approval queue** with Approve & publish or Send back.",
    ],
    steps: [
      { title: "Fill required fields", detail: "Title, slug, dates, timezone (default Africa/Lagos), location, description." },
      { title: "Save draft while editing", detail: "Drafts are never visible on the public site." },
      { title: "Submit or publish", detail: "Non-approvers submit; Super Admin, Admin Manager, and EA publish." },
      { title: "Set homepage featured if needed", detail: "Only one event occupies the homepage slot." },
    ],
    essentialForRoles: [...APPROVER_ROLES, ...CONTENT_WRITERS.filter((r) => !READ_ONLY.includes(r))],
    relevantRoles: "all",
    roleNotes: {
      executive_assistant: note("Full create, approve, publish.", ["Publish directly", "Set homepage featured", "Hide/show events"]),
      executive_reviewer: note("No content publishing.", ["View events list"], ["Create, edit, or publish events"]),
      read_only_auditor: note("View only.", ["View events"], ["Save changes"]),
    },
    relatedSectionIds: ["13-publishing-workflow-draft-approve-publish", "4-homepage"],
  },
  {
    id: "6-books",
    title: "Books",
    shortTitle: "Books",
    category: "content",
    summary:
      "Manage the public library. Pre-loaded titles shipped with the site; use **Start managing** to take over editing one.",
    adminHref: "/admin/books",
    adminLabel: "Books",
    mustKnow: [
      "**Pre-loaded books** are already live — Start managing copies one into the admin for you to edit.",
      "**Remove from site** hides a pre-loaded title without deleting it; Restore brings it back.",
      "Only **one featured book** site-wide at a time.",
      "Cover image optional — 1200×1800 px (2:3) recommended.",
      "Permanent delete: Super Admin and Admin Manager only.",
    ],
    steps: [
      { title: "Review Live on website", detail: "See what visitors see today." },
      { title: "Start managing or create new", detail: "Pre-loaded titles need Start managing before you can edit them." },
      { title: "Save draft → submit or publish", detail: "Same approval flow as Events." },
    ],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: "all",
    roleNotes: {
      executive_assistant: note("Create, approve, publish.", ["Publish books", "Set featured book", "Hide/show"]),
      resource_manager: note("Your role focuses on organizer files, not books.", ["View public library"], ["Publish books unless also an approver"]),
      read_only_auditor: note("View only.", ["View book lists"], ["Edit or publish"]),
    },
    relatedSectionIds: ["13-publishing-workflow-draft-approve-publish", "9-working-with-images"],
  },
  {
    id: "7-insights-articles",
    title: "Insights (articles)",
    shortTitle: "Insights",
    category: "content",
    summary:
      "Articles at /insights/{slug}. Edit on the separate editor page. Up to **3 homepage featured** articles.",
    adminHref: "/admin/insights",
    adminLabel: "Insights",
    mustKnow: [
      "List page for status; **editor** at /admin/insights/edit for writing.",
      "Same pre-loaded / Start managing pattern as Books.",
      "Preview requires title and body.",
      "SEO description max 320 characters.",
      "Hero image optional — 1600×900 px.",
    ],
    steps: [
      { title: "Pick or create an article", detail: "New article opens the Medium-style editor." },
      { title: "Write title, summary, body", detail: "Use Preview before publishing." },
      { title: "Submit or publish", detail: "Approvers publish; others submit for approval." },
    ],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: "all",
    roleNotes: {
      executive_assistant: note("Full editorial access.", ["Publish", "Set homepage featured (max 3)", "Hide/show"]),
      read_only_auditor: note("View only.", ["View article lists"], ["Edit or publish"]),
    },
    relatedSectionIds: ["13-publishing-workflow-draft-approve-publish"],
  },
  {
    id: "8-work-platform-pages",
    title: "Work (platform pages)",
    shortTitle: "Work",
    category: "content",
    summary:
      "Ecosystem pages — AALD, Erudio Hub, PERFORMX, Auctus Africa, etc. — at /work/{slug}. Use repeatable **sections** for long-form content.",
    adminHref: "/admin/work",
    adminLabel: "Work",
    mustKnow: [
      "Hero image optional — **1600×1200 px (4:3)** for landscape illustrations.",
      "Use **Hide image** to temporarily remove hero; **Remove image** clears it permanently.",
      "Primary and secondary CTAs drive buttons on the public page.",
      "Sort order controls placement on the /work hub.",
    ],
    steps: [
      { title: "Select the org to edit", detail: "Or create a new platform page with a unique slug." },
      { title: "Fill hero and hub card copy", detail: "Headline, description, and hub card teaser appear on /work." },
      { title: "Add content sections", detail: "Each section has title, body, and optional bullet list." },
      { title: "Upload hero → Save draft → Publish", detail: "Spot-check on the public /work/{slug} page." },
    ],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: "all",
    roleNotes: {
      executive_assistant: note("You manage platform pages.", ["Publish work orgs", "Hide/show hero images", "Hide/show pages"]),
      read_only_auditor: note("View only.", ["View work org list"], ["Edit or publish"]),
    },
    relatedSectionIds: ["9-working-with-images", "13-publishing-workflow-draft-approve-publish"],
  },
  {
    id: "9-working-with-images",
    title: "Working with images",
    shortTitle: "Images",
    category: "reference",
    summary:
      "Every optional image uses the same control panel: Upload, Hide image, Show image, Remove image. Know the difference before you click.",
    mustKnow: [
      "**Hide image** = temporary. File stays stored; public page shows no image. Click Show image + Save to restore.",
      "**Remove image** = permanent. Clears the path; you must re-upload to get an image back.",
      "Always click **Save draft** or **Publish changes** after hide/remove — otherwise nothing changes publicly.",
      "JPG or WebP under the size limit gives best results.",
    ],
    steps: [
      { title: "Export at the recommended size", detail: "See the size table in the full guide below." },
      { title: "Upload and check the thumbnail", detail: "Wrong crop? Hide, re-export, upload again." },
      { title: "Hide vs Remove", detail: "Hide for tests; Remove when starting fresh." },
      { title: "Save or publish", detail: "Draft saves do not affect published pages until you publish." },
    ],
    commonMistakes: [
      "Clicking Hide but not saving — the public site still shows the image.",
      "Using Remove when you meant Hide — you must re-upload.",
    ],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: "all",
    roleNotes: {
      all: note(
        "Same image controls on Events, Books, Insights, Work, and Homepage.",
        ["Upload, hide, show, and remove optional images on pages you can edit"],
        ["Edit images on pages your role cannot access"],
      ),
    },
    relatedSectionIds: ["8-work-platform-pages", "4-homepage"],
  },
  {
    id: "10-organizer-resources",
    title: "Organizer resources",
    shortTitle: "Resources",
    category: "tools",
    summary:
      "Private PDFs and files shared with individual booking organizers — not public downloads. Upload here; grant on Request detail.",
    adminHref: "/admin/resources",
    adminLabel: "Resources",
    mustKnow: [
      "Max file size **25 MB**. Formats: PDF, ZIP, DOCX, JPEG, PNG, WebP.",
      "Reusing a **resource key** creates a new version — old versions stay in history.",
      "Grants happen on **Requests → detail → Organizer materials**, not on this page alone.",
      "Sidebar Resources link is hidden if your role lacks access.",
    ],
    steps: [
      { title: "Upload to catalog", detail: "Title, category, audience, resource key, file." },
      { title: "Open the booking", detail: "Requests → detail for the confirmed event." },
      { title: "Grant with optional expiry", detail: "Organizer downloads via their private tracker link." },
      { title: "Revoke when done", detail: "EA can revoke own grants; Admin Manager can override any grant." },
    ],
    essentialForRoles: ["super_admin", "admin_manager", "executive_assistant", "resource_manager"],
    relevantRoles: ["super_admin", "admin_manager", "executive_assistant", "resource_manager"],
    roleNotes: {
      resource_manager: note("You maintain the file catalog.", ["Upload and retire files"], ["Assign grants to bookings"]),
      executive_assistant: note("You grant files to organizers.", ["Assign and revoke grants on your bookings"], ["Upload new catalog files unless also Resource Manager"]),
      executive_reviewer: note("Not part of your role.", [], ["Access Resources menu"]),
    },
    relatedSectionIds: ["2-requests-booking-pipeline"],
  },
  {
    id: "11-audience",
    title: "Audience",
    shortTitle: "Audience",
    category: "tools",
    summary:
      "Read-only list of marketing opt-ins from forms across the site. Export CSV for mailings — you do not edit records here.",
    adminHref: "/admin/audience",
    adminLabel: "Audience",
    mustKnow: [
      "Sources: contact form, booking form, footer newsletter, summit interest.",
      "Shows active count, ESP-synced count, and breakdown by source.",
      "**Export CSV** for external mailings or review.",
    ],
    steps: [
      { title: "Review counts", detail: "Check active subscribers and source breakdown." },
      { title: "Export if needed", detail: "CSV includes email, name, source, status, consent date." },
    ],
    essentialForRoles: ["super_admin", "admin_manager", "executive_assistant"],
    relevantRoles: "all",
    roleNotes: {
      all: note("All roles can view Audience.", ["View opt-in table", "Export CSV"]),
    },
    relatedSectionIds: [],
  },
  {
    id: "12-team",
    title: "Team",
    shortTitle: "Team",
    category: "tools",
    summary:
      "Invite colleagues and assign roles. Visible to Super Admin, Technical Admin, and Admin Manager only.",
    adminHref: "/admin/team",
    adminLabel: "Team",
    mustKnow: [
      "Invites send email to set password at /admin/login.",
      "Roles control every button in the back office — pick the smallest role that fits.",
      "**Founder** protects one Super Admin from demotion or removal.",
      "Resend invite if the link expired or pointed to localhost.",
    ],
    steps: [
      { title: "Invite", detail: "Email, full name, role → send invite." },
      { title: "They set password", detail: "First sign-in activates the account." },
      { title: "Adjust roles later", detail: "Change role, suspend, or remove access as needed." },
    ],
    essentialForRoles: ["super_admin", "technical_admin", "admin_manager"],
    relevantRoles: ["super_admin", "technical_admin", "admin_manager"],
    roleNotes: {
      super_admin: note("Full team control.", ["Invite any role", "Mark founder once"]),
      admin_manager: note("Operational roles only.", ["Invite EA, reviewer, inbox, resource roles"], ["Invite Super Admin or Technical Admin"]),
      executive_assistant: note("Team admin is not in your sidebar.", [], ["Access Team page"]),
    },
    relatedSectionIds: ["1-getting-started"],
  },
  {
    id: "13-publishing-workflow-draft-approve-publish",
    title: "Publishing workflow",
    shortTitle: "Publishing",
    category: "reference",
    summary:
      "Events, Books, Insights, and Work share one workflow. Homepage and Featured Episodes are the exceptions.",
    mustKnow: [
      "**Save draft** — not on public site. Safe while editing.",
      "**Submit for approval** — goes to approver queue (if you are not an approver).",
      "**Publish / Publish changes** — live immediately. Super Admin, Admin Manager, EA only.",
      "**Hide** published item = off public site, still in admin. **Permanent delete** = gone forever (admins only).",
      "Homepage saves go live instantly — no draft.",
    ],
    steps: [
      { title: "Draft while working", detail: "Never publish half-finished content." },
      { title: "Submit or publish", detail: "Know whether you are an approver (see role lens)." },
      { title: "Verify on public site", detail: "Open the public URL in a new tab." },
      { title: "Rebuild SEO if sharing links", detail: "Use Rebuild site for SEO after slug changes or social sharing." },
    ],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: "all",
    roleNotes: {
      executive_assistant: note("You are an approver.", ["Publish directly", "Approve pending items", "Send back with notes"]),
      executive_reviewer: note("You cannot publish.", ["View published content"], ["Publish or submit for approval on content pages"]),
      read_only_auditor: note("View only.", ["See statuses in lists"], ["Change any content status"]),
    },
    relatedSectionIds: ["5-events", "17-troubleshooting"],
  },
  {
    id: "14-email-preview",
    title: "Email preview",
    shortTitle: "Email preview",
    category: "tools",
    summary:
      "Read-only previews of transactional emails (contact, booking, status updates). QA wording — you cannot edit templates here.",
    adminHref: "/admin/settings/email-preview",
    adminLabel: "Email preview",
    mustKnow: [
      "Shows what Resend sends for each trigger.",
      "Use before go-live to check names, links, and tone.",
      "Template changes require a developer.",
    ],
    steps: [
      { title: "Pick a template", detail: "Contact, booking, conversion, status update." },
      { title: "Review rendered preview", detail: "Check both admin and confirmation variants." },
    ],
    essentialForRoles: ["super_admin", "admin_manager", "executive_assistant"],
    relevantRoles: "all",
    roleNotes: { all: note("All roles can preview.", ["View all email templates"]) },
    relatedSectionIds: [],
  },
  {
    id: "15-featured-episodes-audio",
    title: "Featured Episodes (audio)",
    shortTitle: "Featured Episodes",
    category: "content",
    summary:
      "Curated podcast list below the Spotify embed on /resources/audio. No approval workflow — Published checkbox goes live.",
    adminHref: "/admin/audio",
    adminLabel: "Featured Episodes",
    mustKnow: [
      "Spotify URL must contain `/episode/`.",
      "Toggle published/hidden directly in the list.",
      "Sort order controls display sequence.",
    ],
    steps: [
      { title: "Add episode", detail: "Title, Spotify URL, description, date/duration labels." },
      { title: "Check Published", detail: "Save — live immediately." },
    ],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: "all",
    roleNotes: {
      executive_assistant: note("You can manage episodes.", ["Create, publish, hide, delete episodes"]),
    },
    relatedSectionIds: [],
  },
  {
    id: "16-audit-log",
    title: "Audit Log",
    shortTitle: "Audit Log",
    category: "tools",
    summary:
      "Append-only history of sign-ins and admin actions. Super Admin, Technical Admin, and Read-only Auditor can access.",
    adminHref: "/admin/audit-log",
    adminLabel: "Audit Log",
    mustKnow: [
      "Search and filter by event type.",
      "CSV export: Super Admin and Technical Admin only.",
      "Cannot delete or edit log entries.",
    ],
    steps: [
      { title: "Search or filter", detail: "Find sign-ins, content changes, team actions." },
      { title: "Export if permitted", detail: "CSV for compliance review." },
    ],
    essentialForRoles: ["super_admin", "technical_admin", "read_only_auditor"],
    relevantRoles: ["super_admin", "technical_admin", "read_only_auditor"],
    roleNotes: {
      read_only_auditor: note("Your primary oversight tool.", ["View full audit log"], ["Export CSV"]),
      technical_admin: note("Full access.", ["View and export audit log"]),
    },
    relatedSectionIds: [],
  },
  {
    id: "17-troubleshooting",
    title: "Troubleshooting",
    shortTitle: "Troubleshooting",
    category: "reference",
    summary:
      "Fix common problems: migration banners, demo mode, changes not showing, invite links, missing buttons.",
    mustKnow: [
      "Yellow **run migration** banner → Super Admin runs SQL in Supabase, then refresh.",
      "**Demo mode** = Supabase not connected; data is mock.",
      "Changes not public? Check draft vs published, hidden flag, hidden image, or browser cache.",
      "Missing button? Check your role in the header first.",
    ],
    steps: [
      { title: "Read the banner", detail: "Migration notices name the exact SQL file." },
      { title: "Hard refresh", detail: "Cmd+Shift+R / Ctrl+Shift+R on admin and public pages." },
      { title: "Check role lens", detail: "Compare what your role should see vs a colleague's." },
    ],
    essentialForRoles: ["super_admin", "technical_admin", "admin_manager", "executive_assistant"],
    relevantRoles: "all",
    roleNotes: {
      technical_admin: note("You fix platform issues.", ["Run migrations", "Fix Supabase Auth URLs", "Configure deploy hooks"]),
      executive_assistant: note("You fix content workflow issues.", ["Publish drafts", "Show hidden content", "Trigger SEO rebuild"]),
    },
    relatedSectionIds: ["1-getting-started", "13-publishing-workflow-draft-approve-publish"],
  },
  {
    id: "18-quick-reference-cards",
    title: "Quick reference",
    shortTitle: "Quick reference",
    category: "reference",
    summary: "Daily checklists for EA work, content editors, and image uploads.",
    mustKnow: [
      "EA daily: Requests → Inbox → statuses → grant materials.",
      "Content: draft → submit/publish → verify public → optional SEO rebuild.",
      "Images: export size → upload → hide or remove → save/publish.",
      "Approvers: Super Admin, Admin Manager, Executive Assistant.",
    ],
    steps: [],
    essentialForRoles: APPROVER_ROLES,
    relevantRoles: "all",
    roleNotes: {
      executive_assistant: note("Your daily checklist.", ["Requests New/Under review", "Inbox New/Awaiting Reply", "Grant materials on confirmed bookings"]),
    },
    relatedSectionIds: ["2-requests-booking-pipeline", "3-inbox-enquiries"],
  },
  {
    id: "19-glossary",
    title: "Glossary",
    shortTitle: "Glossary",
    category: "reference",
    summary: "Plain-language definitions for back-office terms.",
    mustKnow: [
      "**Back office** = private /admin workspace.",
      "**Pre-loaded content** = shipped with original site build.",
      "**Slug** = URL name (e.g. aald → /work/aald).",
      "**Grant** = permission for one organizer to download one file.",
    ],
    steps: [],
    essentialForRoles: [],
    relevantRoles: "all",
    roleNotes: { all: note("Reference for everyone.", ["Look up unfamiliar terms"]) },
    relatedSectionIds: [],
  },
  {
    id: "appendix-pages-not-in-the-admin",
    title: "Pages not in the admin",
    shortTitle: "Not in admin",
    category: "reference",
    summary:
      "About, Speaking copy, Privacy text, navigation, and footer wording live in the codebase — not the back office.",
    mustKnow: [
      "Flag copy changes to a developer or Super Admin.",
      "Do not expect to edit these from Events, Books, or Homepage admin.",
    ],
    steps: [],
    essentialForRoles: [],
    relevantRoles: "all",
    roleNotes: { all: note("Everyone should know this boundary.", ["Request code changes for static marketing pages"]) },
    relatedSectionIds: [],
  },
];

export function getHelpGuideById(id: string): HelpGuide | undefined {
  return HELP_GUIDES.find((guide) => guide.id === id);
}

export function isGuideEssentialForRole(guide: HelpGuide, role: AdminRole): boolean {
  if (guide.essentialForRoles.length === 0) return false;
  return guide.essentialForRoles.includes(role);
}

export function getGuideRoleNote(
  guide: HelpGuide,
  roleLens: AdminRole | "all",
): HelpRoleNote | null {
  if (roleLens === "all") return guide.roleNotes.all ?? null;
  return guide.roleNotes[roleLens] ?? guide.roleNotes.all ?? null;
}

export function getRelevantRoleNotes(
  guide: HelpGuide,
  roleLens: AdminRole | "all",
): { role: AdminRole | "all"; label: string; note: HelpRoleNote }[] {
  if (roleLens !== "all") {
    const noteForRole = getGuideRoleNote(guide, roleLens);
    if (!noteForRole) return [];
    return [
      {
        role: roleLens,
        label: ADMIN_ROLE_LABELS[roleLens],
        note: noteForRole,
      },
    ];
  }

  const entries: { role: AdminRole | "all"; label: string; note: HelpRoleNote }[] = [];
  if (guide.roleNotes.all) {
    entries.push({ role: "all", label: "Everyone", note: guide.roleNotes.all });
  }

  for (const [role, roleNote] of Object.entries(guide.roleNotes) as [
    AdminRole | "all",
    HelpRoleNote,
  ][]) {
    if (role === "all" || !roleNote) continue;
    if (guide.relevantRoles !== "all" && !guide.relevantRoles.includes(role)) continue;
    entries.push({ role, label: ADMIN_ROLE_LABELS[role], note: roleNote });
  }

  return entries;
}

export function filterGuidesByQuery(guides: HelpGuide[], query: string): HelpGuide[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return guides;
  const terms = normalized.split(/\s+/).filter(Boolean);

  return guides.filter((guide) => {
    const haystack = [
      guide.title,
      guide.shortTitle,
      guide.summary,
      ...guide.mustKnow,
      ...guide.steps.map((step) => `${step.title} ${step.detail}`),
      ...(guide.commonMistakes ?? []),
      ...Object.values(guide.roleNotes).flatMap((note) =>
        note ? [note.headline, ...note.canDo, ...(note.cannotDo ?? []), note.tip ?? ""] : [],
      ),
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}
