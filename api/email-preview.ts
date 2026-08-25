import {
  buildBookingAdminMail,
  buildBookingConfirmationMail,
  buildBookingConversionAdminMail,
  buildBookingConversionConfirmationMail,
  buildBookingStatusUpdateMail,
  buildEnquiryAdminMail,
  buildEnquiryConfirmationMail,
} from "./_notifications.js";
import { siteUrl } from "./_env.js";
import { isSameSiteRequest } from "./_request-guard.js";

const SAMPLE = {
  enquiry: {
    id: "00000000-0000-4000-8000-000000000001",
    contactName: "Sarah Mensah",
    contactEmail: "sarah@example.com",
    organization: "Acme Corp",
    subject: "Annual Leadership Summit",
    message:
      "We would like to explore a keynote for our executive retreat in Lagos. Audience of approximately 500 leaders.",
    platformKey: null as string | null,
    platformLabel: null as string | null,
    referrerPath: "/contact",
    adminUrl: `${siteUrl()}/admin/inbox/detail?id=00000000-0000-4000-8000-000000000001`,
  },
  booking: {
    id: "00000000-0000-4000-8000-000000000002",
    reference: "DAA-8492",
    contactName: "James Okafor",
    contactEmail: "james@example.com",
    contactPhone: "+234 800 000 0000",
    organization: "State University",
    eventTitle: "Governance Leadership Forum",
    engagementType: "Keynote",
    format: "In-person",
    preferredDate: "2026-11-15",
    city: "Lagos",
    country: "Nigeria",
    adminUrl: `${siteUrl()}/admin/requests/detail?id=00000000-0000-4000-8000-000000000002`,
    requestAreaLabel: "AALD",
    platformKey: "aald",
    platformLabel: "AALD",
  },
  trackerUrl: `${siteUrl()}/booking/DAA-8492`,
};

const TEMPLATES = {
  "enquiry-admin": () => buildEnquiryAdminMail(SAMPLE.enquiry),
  "enquiry-confirmation": () =>
    buildEnquiryConfirmationMail({
      contactName: SAMPLE.enquiry.contactName,
      subject: SAMPLE.enquiry.subject,
    }),
  "booking-admin": () => buildBookingAdminMail(SAMPLE.booking),
  "booking-confirmation": () =>
    buildBookingConfirmationMail({
      contactName: SAMPLE.booking.contactName,
      reference: SAMPLE.booking.reference,
      trackerUrl: SAMPLE.trackerUrl,
    }),
  "booking-conversion-admin": () =>
    buildBookingConversionAdminMail({
      ...SAMPLE.booking,
      enquirySubject: SAMPLE.enquiry.subject,
    }),
  "booking-conversion-confirmation": () =>
    buildBookingConversionConfirmationMail({
      contactName: SAMPLE.booking.contactName,
      reference: SAMPLE.booking.reference,
      trackerUrl: SAMPLE.trackerUrl,
    }),
  "booking-status-update": () =>
    buildBookingStatusUpdateMail({
      contactName: SAMPLE.booking.contactName,
      reference: SAMPLE.booking.reference,
      status: "Under Review",
      organizerMessage:
        "Thank you for your patience. Our team is reviewing your dates and will follow up shortly.",
      trackerUrl: SAMPLE.trackerUrl,
    }),
} as const;

export type EmailPreviewTemplate = keyof typeof TEMPLATES;

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

/** Read-only preview of transactional email templates (admin use). */
export async function GET(request: Request): Promise<Response> {
  if (!isSameSiteRequest(request)) {
    return json(403, { error: "Forbidden." });
  }

  const url = new URL(request.url);
  const template = url.searchParams.get("template") as EmailPreviewTemplate | null;

  if (!template || !(template in TEMPLATES)) {
    return json(400, {
      error: "Invalid template.",
      templates: Object.keys(TEMPLATES),
    });
  }

  const mail = TEMPLATES[template]();

  return json(200, {
    template,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
}
