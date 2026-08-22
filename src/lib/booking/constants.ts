export const ENGAGEMENT_TYPES = [
  "Keynote",
  "Panel",
  "Workshop",
  "Advisory",
  "Fireside Conversation",
  "Executive Session",
  "Media Interview",
  "Other",
] as const;

export const FORMAT_OPTIONS = ["In-person", "Virtual", "Hybrid"] as const;

export const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 – $10,000",
  "$10,000 – $25,000",
  "$25,000 – $50,000",
  "$50,000+",
  "To be discussed",
] as const;

export const RECORDING_OPTIONS = [
  "No recording",
  "Audio only",
  "Video recording",
  "Livestream",
  "Recording + redistribution",
] as const;

export const TIMEZONE_OPTIONS = [
  "UTC",
  "GMT (London)",
  "WAT (West Africa)",
  "CAT (Central Africa)",
  "EAT (East Africa)",
  "EST (US Eastern)",
  "CST (US Central)",
  "PST (US Pacific)",
  "CET (Central Europe)",
  "GST (Gulf)",
  "IST (India)",
  "Other",
] as const;

export const AUDIENCE_SIZE_OPTIONS = [
  "Under 50",
  "50 – 200",
  "200 – 500",
  "500 – 1,000",
  "1,000 – 5,000",
  "5,000+",
] as const;

export const BOOKING_STEPS = [
  { id: 1, label: "Contact", description: "Organizer details" },
  { id: 2, label: "Engagement", description: "Engagement overview" },
  { id: 3, label: "Schedule", description: "Date & location" },
  { id: 4, label: "Requirements", description: "Terms & protocol" },
] as const;

export const ADMIN_FILTER_STATUSES = [
  { id: "all", label: "All Requests" },
  { id: "new", label: "New" },
  { id: "under-review", label: "Under Review" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending-info", label: "Pending Info" },
  { id: "conflicts", label: "Conflicts" },
] as const;

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  Received:
    "Your invitation has been successfully submitted. Our team will review it shortly.",
  "Under Review":
    "The Executive Assistant team is evaluating your invitation, schedule, and requirements.",
  "Information Required":
    "We need additional details before proceeding. Please check the outstanding actions below.",
  "Tentatively Available":
    "The proposed date is being held while we finalize terms and logistics.",
  Confirmed:
    "Your engagement has been approved and scheduled. Preparation is underway.",
  Declined:
    "Unfortunately, we are unable to accept this invitation at this time.",
  Cancelled: "This engagement has been cancelled.",
  Completed: "This engagement has taken place. Thank you for partnering with Akin and his team.",
};
