import { Resend } from "resend";
import {
  escapeHtml,
  renderBrandedEmail,
  renderDetailTable,
  renderMessageBlock,
  renderReferenceBadge,
} from "./email-layout";
import { readEnv, readEnvBool, siteUrl } from "./env";

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
  platformLabel: string | null;
  referrerPath: string | null;
  adminUrl: string;
}

export function buildEnquiryAdminMail(input: EnquiryMailInput) {
  const subjectLine = `[Contact] ${input.subject?.trim() || "New enquiry"}`;
  const textLines = [
    "New contact enquiry on the website.",
    "",
    field("Name", input.contactName),
    field("Email", input.contactEmail),
    field("Organization", input.organization),
    field("Subject", input.subject),
    field("Platform", input.platformLabel),
    field("Referrer", input.referrerPath),
    "",
    "Message:",
    input.message?.trim() || "(empty)",
    "",
    `Open in admin: ${input.adminUrl}`,
  ].filter(Boolean);

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: `New contact enquiry from ${input.contactName}`,
    eyebrow: "Admin alert",
    title: input.subject?.trim() || "New contact enquiry",
    introHtml: `<p style="margin:0;">A new message was submitted through the public contact form.</p>`,
    bodyHtml: `${renderDetailTable([
      { label: "Name", value: input.contactName },
      { label: "Email", value: input.contactEmail },
      { label: "Organization", value: input.organization },
      { label: "Subject", value: input.subject },
      { label: "Platform", value: input.platformLabel },
      { label: "Referrer", value: input.referrerPath },
    ])}${renderMessageBlock(input.message?.trim() || "")}`,
    cta: { label: "Open in admin inbox", href: input.adminUrl },
    footerNote: "Reply directly to this email to reach the submitter.",
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
}

export function buildBookingAdminMail(input: BookingMailInput) {
  const headline = input.eventTitle?.trim() || "Booking request";
  const subjectLine = `[Booking ${input.reference}] ${headline}`;
  const location = [input.city, input.country].filter(Boolean).join(", ") || null;
  const textLines = [
    "New booking request on the website.",
    "",
    field("Reference", input.reference),
    field("Name", input.contactName),
    field("Email", input.contactEmail),
    field("Phone", input.contactPhone),
    field("Organization", input.organization),
    field("Engagement", input.engagementType),
    field("Event", input.eventTitle),
    field("Format", input.format),
    field("Preferred date", input.preferredDate),
    field("Location", location),
    "",
    `Open in admin: ${input.adminUrl}`,
  ].filter(Boolean);

  const html = renderBrandedEmail({
    siteUrl: siteUrl(),
    preheader: `New booking request ${input.reference} from ${input.contactName}`,
    eyebrow: "Admin alert",
    title: headline,
    introHtml: `${renderReferenceBadge(input.reference)}<p style="margin:0;">A new speaking or engagement request was submitted on the website.</p>`,
    bodyHtml: renderDetailTable([
      { label: "Name", value: input.contactName },
      { label: "Email", value: input.contactEmail },
      { label: "Phone", value: input.contactPhone },
      { label: "Organization", value: input.organization },
      { label: "Engagement", value: input.engagementType },
      { label: "Event", value: input.eventTitle },
      { label: "Format", value: input.format },
      { label: "Preferred date", value: input.preferredDate },
      { label: "Location", value: location },
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
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await config.resend.emails.send({
    from: config.from,
    to: message.to,
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
