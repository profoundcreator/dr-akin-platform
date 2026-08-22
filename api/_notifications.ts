import { Resend } from "resend";
import {
  escapeHtml,
  renderBrandedEmail,
  renderDetailTable,
  renderMessageBlock,
  renderReferenceBadge,
} from "./_email-layout.js";
import { readEnv, readEnvBool, siteUrl } from "./_env.js";

export interface NotificationMailConfig {
  resend: Resend;
  from: string;
  adminTo: string;
  replyTo: string;
  sendSubmitterConfirmation: boolean;
}

function normalizeFromAddress(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("<")) return trimmed;
  return `Dr. Akin Akinpelu <${trimmed}>`;
}

export function getNotificationMailConfig(): NotificationMailConfig | null {
  const apiKey = readEnv("RESEND_API_KEY");
  const from = normalizeFromAddress(readEnv("NOTIFICATION_FROM_EMAIL"));
  const adminTo = readEnv("ADMIN_NOTIFICATION_EMAIL");
  if (!apiKey || !from || !adminTo) return null;

  const replyTo = readEnv("NOTIFICATION_REPLY_TO") || adminTo;

  return {
    resend: new Resend(apiKey),
    from,
    adminTo,
    replyTo,
    sendSubmitterConfirmation: readEnvBool("SEND_SUBMITTER_CONFIRMATION", true),
  };
}

export const NOTIFICATIONS_NOT_CONFIGURED =
  "Submission notifications are not configured. Add RESEND_API_KEY, NOTIFICATION_FROM_EMAIL, and ADMIN_NOTIFICATION_EMAIL in Vercel environment variables.";

/** Only notify for records created within this window (minutes). */
export const NOTIFICATION_MAX_AGE_MINUTES = 15;

export function isRecentSubmission(createdAt: string): boolean {
  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) return false;
  const maxAgeMs = NOTIFICATION_MAX_AGE_MINUTES * 60 * 1000;
  return Date.now() - createdMs <= maxAgeMs;
}

function field(label: string, value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  return `${label}: ${trimmed}`;
}

export interface EnquiryMailInput {
  id: string;
  contactName: string;
  contactEmail: string;
  organization: string | null;
  subject: string | null;
  message: string | null;
  platformKey: string | null;
  platformLabel: string | null;
  referrerPath: string | null;
  adminUrl: string;
}

function futureAfricaRoutingCalloutHtml(): string {
  return `<div style="margin:0 0 20px;padding:14px 16px;background:#F5F0E8;border-left:4px solid #B8860B;border-radius:4px;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1A1A1A;">Future Africa enquiry</p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#3D3A36;">This message is <strong>for Future Africa</strong>, not Erudio Hub. Future Africa does not yet have its own inbox, so it was delivered to Erudio Hub for interim handling. Please respond on behalf of Future Africa.</p>
    </div>`;
}

function futureAfricaRoutingCalloutText(): string {
  return [
    "FUTURE AFRICA ENQUIRY",
    "This message is FOR FUTURE AFRICA, not Erudio Hub.",
    "Future Africa does not yet have its own inbox — delivered to Erudio Hub for interim handling.",
    "Please respond on behalf of Future Africa.",
    "",
  ].join("\n");
}

export function buildEnquiryAdminMail(input: EnquiryMailInput) {
  const isFutureAfrica = input.platformKey === "future-africa";
  const topic = input.subject?.trim() || "New enquiry";
  const subjectLine = isFutureAfrica
    ? `[Future Africa enquiry] ${topic}`
    : `[Contact] ${topic}`;

  const textLines = [
    isFutureAfrica ? futureAfricaRoutingCalloutText() : "New contact enquiry on the website.",
    "",
    field("Name", input.contactName),
    field("Email", input.contactEmail),
    field("Organization", input.organization),
    field("Subject", input.subject),
    field("Platform", input.platformLabel),
    ...(isFutureAfrica ? [field("Delivered to", "Erudio Hub (interim inbox for Future Africa)")] : []),
    field("Referrer", input.referrerPath),
    "",
    "Message:",
    input.message?.trim() || "(empty)",
    "",
    `Open in admin: ${input.adminUrl}`,
  ].filter(Boolean);

  const introHtml = isFutureAfrica
    ? futureAfricaRoutingCalloutHtml()
    : `<p style="margin:0;">A new message was submitted through the public contact form.</p>`;

  const detailRows = [
    { label: "Name", value: input.contactName },
    { label: "Email", value: input.contactEmail },
    { label: "Organization", value: input.organization },
    { label: "Subject", value: input.subject },
    { label: "Platform", value: input.platformLabel },
    ...(isFutureAfrica
      ? [{ label: "Delivered to", value: "Erudio Hub (interim inbox for Future Africa)" }]
      : []),
    { label: "Referrer", value: input.referrerPath },
  ];

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: isFutureAfrica
      ? `Future Africa enquiry from ${input.contactName} — handle on behalf of Future Africa`
      : `New contact enquiry from ${input.contactName}`,
    eyebrow: isFutureAfrica ? "Future Africa enquiry" : "Admin alert",
    title: isFutureAfrica ? `Future Africa — ${topic}` : topic,
    introHtml,
    bodyHtml: `${renderDetailTable(detailRows)}${renderMessageBlock(input.message?.trim() || "")}`,
    cta: { label: "Open in admin inbox", href: input.adminUrl },
    footerNote: isFutureAfrica
      ? "Reply to the submitter on behalf of Future Africa."
      : "Reply directly to this email to reach the submitter.",
  });

  return {
    subject: subjectLine,
    text: textLines.join("\n"),
    html,
    replyTo: input.contactEmail,
  };
}

export function buildEnquiryConfirmationMail(input: {
  contactName: string;
  subject: string | null;
}) {
  const subjectLine = "We received your enquiry";
  const greetingName = input.contactName.trim() || "there";
  const topic = input.subject?.trim() ? ` about “${input.subject.trim()}”` : "";

  const text = [
    `Dear ${greetingName},`,
    "",
    `Thank you for contacting Dr. Akin Akinpelu's office${topic}.`,
    "Our team aims to respond within 3–5 business days.",
    "",
    "This is an automated confirmation — please reply to this email if you need to add anything.",
  ].join("\n");

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: "Your enquiry has been received.",
    eyebrow: "Confirmation",
    title: "We received your enquiry",
    introHtml: `<p style="margin:0;">Dear ${escapeHtml(greetingName)},</p>`,
    bodyHtml: `<p style="margin:0 0 16px;">Thank you for contacting Dr. Akin Akinpelu's office${escapeHtml(topic)}.</p>
      <p style="margin:0 0 16px;">Our team aims to respond within 3–5 business days.</p>
      <p style="margin:0;color:#8A8681;font-size:14px;">This is an automated confirmation. You can reply to this email if you need to add anything.</p>`,
    footerNote: "Akin Akinpelu — Leadership, Governance & Enterprise",
  });

  return { subject: subjectLine, text, html };
}

export interface BookingMailInput {
  id: string;
  reference: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  organization: string | null;
  eventTitle: string | null;
  engagementType: string | null;
  format: string | null;
  preferredDate: string | null;
  city: string | null;
  country: string | null;
  adminUrl: string;
  requestAreaLabel?: string | null;
  platformKey?: string | null;
  platformLabel?: string | null;
}

export function buildBookingAdminMail(input: BookingMailInput) {
  const headline = input.eventTitle?.trim() || "Booking request";
  const isFutureAfrica = input.platformKey === "future-africa";
  const subjectLine = isFutureAfrica
    ? `[Future Africa booking ${input.reference}] ${headline}`
    : input.platformLabel
      ? `[Booking ${input.platformLabel} ${input.reference}] ${headline}`
      : `[Booking ${input.reference}] ${headline}`;
  const location = [input.city, input.country].filter(Boolean).join(", ") || null;
  const textLines = [
    isFutureAfrica
      ? futureAfricaRoutingCalloutText()
      : "New booking request on the website.",
    "",
    field("Reference", input.reference),
    field("Request area", input.requestAreaLabel),
    field("Name", input.contactName),
    field("Email", input.contactEmail),
    field("Phone", input.contactPhone),
    field("Organization", input.organization),
    field("Engagement", input.engagementType),
    field("Engagement", input.eventTitle),
    field("Format", input.format),
    field("Preferred date", input.preferredDate),
    field("Location", location),
    ...(isFutureAfrica
      ? [field("Delivered to", "Erudio Hub (interim inbox for Future Africa)")]
      : []),
    "",
    `Open in admin: ${input.adminUrl}`,
  ].filter(Boolean);

  const introHtml = isFutureAfrica
    ? `${futureAfricaRoutingCalloutHtml()}<p style="margin:0;">A new booking request was submitted for Future Africa.</p>`
    : `<p style="margin:0;">A new speaking or engagement request was submitted on the website.</p>`;

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: `New booking request ${input.reference} from ${input.contactName}`,
    eyebrow: isFutureAfrica ? "Future Africa booking" : "Admin alert",
    title: headline,
    introHtml: `${renderReferenceBadge(input.reference)}${introHtml}`,
    bodyHtml: renderDetailTable([
      { label: "Request area", value: input.requestAreaLabel },
      { label: "Name", value: input.contactName },
      { label: "Email", value: input.contactEmail },
      { label: "Phone", value: input.contactPhone },
      { label: "Organization", value: input.organization },
      { label: "Engagement", value: input.engagementType },
      { label: "Engagement", value: input.eventTitle },
      { label: "Format", value: input.format },
      { label: "Preferred date", value: input.preferredDate },
      { label: "Location", value: location },
      ...(isFutureAfrica
        ? [{ label: "Delivered to", value: "Erudio Hub (interim inbox for Future Africa)" }]
        : []),
    ]),
    cta: { label: "Open booking in admin", href: input.adminUrl },
    footerNote: "Reply directly to this email to reach the organizer.",
  });

  return {
    subject: subjectLine,
    text: textLines.join("\n"),
    html,
    replyTo: input.contactEmail,
  };
}

export function buildBookingConversionAdminMail(
  input: BookingMailInput & { enquirySubject: string | null },
) {
  const base = buildBookingAdminMail(input);
  const enquiryNote = input.enquirySubject?.trim()
    ? `Converted from inbox enquiry: “${input.enquirySubject.trim()}”.`
    : "Converted from an inbox enquiry.";

  return {
    ...base,
    subject: base.subject.replace("[Booking", "[Booking conversion"),
    text: [enquiryNote, "", base.text].join("\n"),
    html: base.html.replace(
      "A new speaking or engagement request was submitted on the website.",
      `${enquiryNote} A booking request was created from the admin inbox.`,
    ),
  };
}

export function buildBookingConversionConfirmationMail(input: {
  contactName: string;
  reference: string;
  trackerUrl: string;
}) {
  const greetingName = input.contactName.trim() || "there";

  const text = [
    `Dear ${greetingName},`,
    "",
    "Your enquiry has been converted into a formal booking request.",
    `Your reference is ${input.reference}.`,
    "",
    `Track your request: ${input.trackerUrl}`,
    "",
    "Our team will continue reviewing the details and respond within 3–5 business days.",
  ].join("\n");

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: `Booking request ${input.reference} created from your enquiry.`,
    eyebrow: "Confirmation",
    title: "Your enquiry is now a booking request",
    introHtml: `<p style="margin:0;">Dear ${escapeHtml(greetingName)},</p>`,
    bodyHtml: `<p style="margin:0 0 16px;">Thank you for your patience. We have converted your enquiry into a formal booking request with Dr. Akin Akinpelu's office.</p>
      ${renderReferenceBadge(input.reference)}
      <p style="margin:0 0 16px;">Our team will continue reviewing the details and respond within 3–5 business days.</p>`,
    cta: { label: "Track your request", href: input.trackerUrl },
    footerNote: "Keep your reference number for future correspondence.",
  });

  return {
    subject: `Booking request created — ${input.reference}`,
    text,
    html,
  };
}

const STATUS_HEADLINES: Record<string, string> = {
  Received: "We received your booking request",
  "Under Review": "Your request is under review",
  "Information Required": "We need more information",
  "Tentatively Available": "Tentatively available for your dates",
  Confirmed: "Your engagement is confirmed",
  Declined: "Update on your booking request",
  Cancelled: "Your booking request was cancelled",
  Completed: "Engagement completed",
};

export function buildBookingStatusUpdateMail(input: {
  contactName: string;
  reference: string;
  status: string;
  organizerMessage?: string | null;
  trackerUrl: string;
}) {
  const greetingName = input.contactName.trim() || "there";
  const headline = STATUS_HEADLINES[input.status] ?? `Status update: ${input.status}`;
  const messageBlock = input.organizerMessage?.trim()
    ? `\n\nMessage from our team:\n${input.organizerMessage.trim()}`
    : "";

  const text = [
    `Dear ${greetingName},`,
    "",
    `Your booking request ${input.reference} is now: ${input.status}.`,
    messageBlock,
    "",
    `Track your request: ${input.trackerUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const bodyParts = [
    `<p style="margin:0 0 16px;">Your booking request status has been updated to <strong>${escapeHtml(input.status)}</strong>.</p>`,
    renderReferenceBadge(input.reference),
  ];

  if (input.organizerMessage?.trim()) {
    bodyParts.push(renderMessageBlock(input.organizerMessage.trim()));
  }

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: `${input.reference} — ${input.status}`,
    eyebrow: "Status update",
    title: headline,
    introHtml: `<p style="margin:0;">Dear ${escapeHtml(greetingName)},</p>`,
    bodyHtml: bodyParts.join(""),
    cta: { label: "View booking tracker", href: input.trackerUrl },
    footerNote: "Reply to this email if you have questions about your request.",
  });

  return { subject: `${input.reference} — ${input.status}`, text, html };
}

export function buildBookingConfirmationMail(input: {
  contactName: string;
  reference: string;
  trackerUrl: string;
}) {
  const greetingName = input.contactName.trim() || "there";

  const text = [
    `Dear ${greetingName},`,
    "",
    "Thank you for submitting a booking request.",
    `Your reference is ${input.reference}.`,
    "",
    `Track your request: ${input.trackerUrl}`,
    "",
    "Our team will review your request and respond within 3–5 business days.",
  ].join("\n");

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: `Booking request ${input.reference} received.`,
    eyebrow: "Confirmation",
    title: "Booking request received",
    introHtml: `<p style="margin:0;">Dear ${escapeHtml(greetingName)},</p>`,
    bodyHtml: `<p style="margin:0 0 16px;">Thank you for submitting a booking request with Dr. Akin Akinpelu's office.</p>
      ${renderReferenceBadge(input.reference)}
      <p style="margin:0 0 16px;">Our team will review your request and respond within 3–5 business days.</p>`,
    cta: { label: "Track your request", href: input.trackerUrl },
    footerNote: "Keep your reference number for future correspondence.",
  });

  return { subject: `Booking request received — ${input.reference}`, text, html };
}

export async function sendMail(
  config: NotificationMailConfig,
  message: {
    to: string | string[];
    cc?: string | string[];
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await config.resend.emails.send({
    from: config.from,
    to: message.to,
    cc: message.cc,
    subject: message.subject,
    html: message.html,
    text: message.text,
    replyTo: message.replyTo ?? config.replyTo,
  });

  if (error) {
    console.error("[notifications] Resend send failed:", error);
    return { ok: false, error: error.message ?? "Resend send failed." };
  }

  if (!data?.id) {
    console.error("[notifications] Resend returned no message id.");
    return { ok: false, error: "Resend did not return a message id." };
  }

  return { ok: true, id: data.id };
}
