export const BOOKS_ADMIN_COPY = {
  liveSectionTitle: "Live on website",
  liveSectionHelp:
    "These are the books visitors see today on the public library and homepage.",
  preloadedNotice:
    "These books are on the site from the original setup. Start managing one to edit it in the admin — other titles stay visible until you publish them too.",
  preloadedLabel: "Pre-loaded on site",
  managedLabel: "You manage this · Published",
  featuredBook: "Featured book",
  startManaging: "Start managing",
  startManagingHelp:
    "This book is already on the public website. Use this to copy it into the admin so you can edit the description, cover, purchase links, and featured status yourself.",
  startManagingReady: (title: string) =>
    `“${title}” is loaded in the form below. Review the details and publish when you are ready to manage it from the admin.`,
  edit: "Edit",
  managedSectionTitle: "Books you manage",
  managedSectionHelp:
    "Drafts, items waiting for approval, and books you have published from this admin.",
  noManagedYet:
    "No managed books yet. Tap Start managing on a live title above, or create a new book in the form.",
  preloadedSectionTitle: "Pre-loaded books",
  preloadedSectionHelp:
    "These titles shipped with the original website setup. Remove them from the public site, or start managing one to edit it yourself.",
  removeFromSite: "Remove from site",
  removeFromSiteHelp:
    "Hides this pre-loaded title from the public website. You can restore it later from this admin page.",
  restoreToSite: "Restore to site",
  hiddenPreloadedTitle: "Removed pre-loaded books",
  hiddenPreloadedHelp: "These pre-loaded titles are hidden from the public site. Restore them anytime.",
  removedFromSiteNotice: (title: string) => `“${title}” was removed from the public site.`,
  restoredToSiteNotice: (title: string) => `“${title}” is live on the public site again.`,
  notConnected:
    "The back office is not connected yet. Public visitors still see books at /resources.",
} as const;

export const INSIGHTS_ADMIN_COPY = {
  liveSectionTitle: "Live on website",
  liveSectionHelp:
    "These are the articles visitors see today on the insights page and homepage.",
  preloadedNotice:
    "These articles are on the site from the original setup. Start managing one to edit it in the admin — other articles stay visible until you publish them too.",
  preloadedLabel: "Pre-loaded on site",
  managedLabel: "You manage this · Published",
  homepageFeatured: "Homepage featured",
  defaultHomepageSlots: "Latest articles (default homepage slots)",
  startManaging: "Start managing",
  startManagingHelp:
    "This article is already on the public website. Use this to copy it into the admin so you can edit the text, summary, and homepage placement yourself.",
  startManagingReady: (title: string) =>
    `“${title}” is loaded in the form below. Review the details and publish when you are ready to manage it from the admin.`,
  edit: "Edit",
  managedSectionTitle: "Articles you manage",
  managedSectionHelp:
    "Drafts, items waiting for approval, and articles you have published from this admin.",
  noManagedYet:
    "No managed articles yet. Tap Start managing on a live article above, or create a new article in the form.",
  preloadedSectionTitle: "Pre-loaded articles",
  preloadedSectionHelp:
    "These filler articles shipped with the original website setup. Remove them from the public site, or start managing one to edit it yourself.",
  removeFromSite: "Remove from site",
  removeFromSiteHelp:
    "Hides this pre-loaded article from the public website and homepage. You can restore it later from this admin page.",
  restoreToSite: "Restore to site",
  hiddenPreloadedTitle: "Removed pre-loaded articles",
  hiddenPreloadedHelp: "These pre-loaded articles are hidden from the public site. Restore them anytime.",
  removedFromSiteNotice: (title: string) => `“${title}” was removed from the public site.`,
  restoredToSiteNotice: (title: string) => `“${title}” is live on the public site again.`,
  previewArticle: "Preview article",
  previewHelp:
    "See how this article will look on the public insights page before you publish. The summary box shows the teaser used on cards and the homepage.",
  previewMissingFields: "Add a title and body before previewing.",
  heroImageLabel: "Header image (optional)",
  sourceLabel: "Original publication",
  sourceLabelHelp:
    "Optional credit when republishing from elsewhere, e.g. Forbes Business Council. Shown on the article page — not for SEO branding.",
  sourceUrlLabel: "Original article link",
  sourceUrlHelp: "Link to the first place this was published, if applicable.",
  notConnected:
    "The back office is not connected yet. Public visitors still see articles at /insights.",
} as const;

export const ADMIN_REBUILD_SEO_COPY = {
  label: "Rebuild site for SEO",
  rebuilding: "Rebuilding…",
  help:
    "Refreshes the public website after you publish or hide content. Article pages pick up text and images from the database right away; a rebuild still helps search engines, link previews, and brand-new article URLs.",
} as const;

export const TEAM_ADMIN_COPY = {
  subtitle: "Invite colleagues, assign roles, and manage back-office access",
  inviteTitle: "Invite team member",
  inviteHelp:
    "Sends an email invite. They set a password, then sign in at /admin/login. You can resend the invite if needed.",
  teamListTitle: "Team members",
  teamListHelp: "Everyone who can access the private back office, their role, and account status.",
  founderBadge: "Founder",
  founderHelp:
    "The main protected Super Admin account. It cannot be suspended, demoted, or removed by other admins.",
  markFounder: "Mark as founder",
  markFounderHelp:
    "Designate one protected Super Admin account. Do this once for the primary account owner. Co–Super Admins cannot change or remove the founder.",
  noFounderYet: "No founder account is designated yet. Mark the primary Super Admin as founder for extra protection.",
  inviteHint:
    "They will receive an email to set a password, then sign in at the admin login page. Use “Resend invite” on the team list if they need a fresh link.",
} as const;
