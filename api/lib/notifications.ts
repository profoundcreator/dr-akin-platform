import { Resend } from "resend";
import { readEnv, readEnvBool } from "../env";

export interface NotificationMailConfig {
  resend: Resend;
  from: string;
  adminTo: string;
  replyTo: string;
  sendSubmitterConfirmation: boolean;
}

export function getNotificationMailConfig(): NotificationMailConfig | null {
  const apiKey = readEnv("RESEND_API_KEY");
  const from = readEnv("NOTIFICATION_FROM_EMAIL");
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function field(label: string, value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  return `${label}: ${trimmed}`;
}

function fieldHtml(label: string, value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(trimmed)}</p>`;
}

export interface EnquiryMailInput {
  id: string;
  contactName: string;
  contactEmail: string;
  organization: string | null;
  subject: string | null;
  message: string | null;
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
    "",
    "Message:",
    input.message?.trim() || "(empty)",
    "",
    `Open in admin: ${input.adminUrl}`,
  ].filter(Boolean);

  const html = [
    "<p>New contact enquiry on the website.</p>",
    fieldHtml("Name", input.contactName),
    fieldHtml("Email", input.contactEmail),
    fieldHtml("Organization", input.organization),
    fieldHtml("Subject", input.subject),
    "<p><strong>Message</strong></p>",
    `<p style="white-space:pre-wrap">${escapeHtml(input.message?.trim() || "(empty)")}</p>`,
    `<p><a href="${escapeHtml(input.adminUrl)}">Open in admin inbox</a></p>`,
  ].join("");

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

  return {
    subject: subjectLine,
    text: [
      `Dear ${greetingName},`,
      "",
      `Thank you for contacting Dr. Akin Akinpelu's office${topic}.`,
      "Our team aims to respond within 3–5 business days.",
      "",
      "This is an automated confirmation — please reply to this email if you need to add anything.",
    ].join("\n"),
    html: [
      `<p>Dear ${escapeHtml(greetingName)},</p>`,
      `<p>Thank you for contacting Dr. Akin Akinpelu's office${escapeHtml(topic)}.</p>`,
      "<p>Our team aims to respond within 3–5 business days.</p>",
      "<p><em>This is an automated confirmation — please reply to this email if you need to add anything.</em></p>",
    ].join(""),
  };
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
    field("Location", [input.city, input.country].filter(Boolean).join(", ") || null),
    "",
    `Open in admin: ${input.adminUrl}`,
  ].filter(Boolean);

  const html = [
    "<p>New booking request on the website.</p>",
    fieldHtml("Reference", input.reference),
    fieldHtml("Name", input.contactName),
    fieldHtml("Email", input.contactEmail),
    fieldHtml("Phone", input.contactPhone),
    fieldHtml("Organization", input.organization),
    fieldHtml("Engagement", input.engagementType),
    fieldHtml("Event", input.eventTitle),
    fieldHtml("Format", input.format),
    fieldHtml("Preferred date", input.preferredDate),
    fieldHtml("Location", [input.city, input.country].filter(Boolean).join(", ") || null),
    `<p><a href="${escapeHtml(input.adminUrl)}">Open booking in admin</a></p>`,
  ].join("");

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

  return {
    subject: `Booking request received — ${input.reference}`,
    text: [
      `Dear ${greetingName},`,
      "",
      "Thank you for submitting a booking request.",
      `Your reference is ${input.reference}.`,
      "",
      `Track your request: ${input.trackerUrl}`,
      "",
      "Our team will review your request and respond within 3–5 business days.",
    ].join("\n"),
    html: [
      `<p>Dear ${escapeHtml(greetingName)},</p>`,
      "<p>Thank you for submitting a booking request.</p>",
      `<p><strong>Reference:</strong> ${escapeHtml(input.reference)}</p>`,
      `<p><a href="${escapeHtml(input.trackerUrl)}">Track your request</a></p>`,
      "<p>Our team will review your request and respond within 3–5 business days.</p>",
    ].join(""),
  };
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
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await config.resend.emails.send({
    from: config.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    replyTo: message.replyTo ?? config.replyTo,
  });

  if (error) {
    return { ok: false, error: error.message ?? "Resend send failed." };
  }

  if (!data?.id) {
    return { ok: false, error: "Resend did not return a message id." };
  }

  return { ok: true };
}
