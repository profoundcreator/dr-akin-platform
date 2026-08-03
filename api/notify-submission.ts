import { createServiceSupabaseClient } from "./lib/supabase-service";
import { siteUrl } from "./lib/env";
import {
  buildBookingAdminMail,
  buildBookingConfirmationMail,
  buildEnquiryAdminMail,
  buildEnquiryConfirmationMail,
  getNotificationMailConfig,
  isRecentSubmission,
  NOTIFICATIONS_NOT_CONFIGURED,
  sendMail,
} from "./lib/notifications";

type NotifyBody =
  | { kind: "enquiry"; enquiryId?: string }
  | { kind: "booking"; bookingId?: string };

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readFormField(form: Record<string, unknown>, key: string): string | null {
  const value = form[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request): Promise<Response> {
  const mailConfig = getNotificationMailConfig();
  if (!mailConfig) {
    return json(503, { error: NOTIFICATIONS_NOT_CONFIGURED });
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return json(503, { error: "Supabase service role is not configured on the server." });
  }

  let body: NotifyBody;
  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  const baseUrl = siteUrl();

  if (body.kind === "enquiry") {
    const enquiryId = readString(body.enquiryId);
    if (!enquiryId) {
      return json(400, { error: "enquiryId is required." });
    }

    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .update({ admin_notified_at: new Date().toISOString() })
      .eq("id", enquiryId)
      .is("admin_notified_at", null)
      .eq("source", "Contact")
      .select("id, source, contact_name, contact_email, organization, subject, message, created_at")
      .maybeSingle();

    if (error) {
      const missingColumn = error.message.toLowerCase().includes("admin_notified_at");
      return json(
        missingColumn ? 503 : 500,
        missingColumn
          ? {
              error:
                "Notification tracking is not available yet. Apply Supabase migration 022_submission_notifications.sql.",
            }
          : { error: error.message },
      );
    }

    if (!enquiry) {
      return json(200, { ok: true, skipped: true });
    }

    if (!isRecentSubmission(enquiry.created_at)) {
      return json(200, { ok: true, skipped: true, reason: "expired" });
    }

    const adminUrl = `${baseUrl}/admin/inbox/detail?id=${enquiry.id}`;
    const adminMail = buildEnquiryAdminMail({
      id: enquiry.id,
      contactName: enquiry.contact_name,
      contactEmail: enquiry.contact_email,
      organization: enquiry.organization,
      subject: enquiry.subject,
      message: enquiry.message,
      adminUrl,
    });

    const adminResult = await sendMail(mailConfig, {
      to: mailConfig.adminTo,
      subject: adminMail.subject,
      html: adminMail.html,
      text: adminMail.text,
      replyTo: adminMail.replyTo,
    });

    if (!adminResult.ok) {
      await supabase.from("enquiries").update({ admin_notified_at: null }).eq("id", enquiry.id);
      return json(502, { error: adminResult.error });
    }

    if (mailConfig.sendSubmitterConfirmation) {
      const confirmation = buildEnquiryConfirmationMail({
        contactName: enquiry.contact_name,
        subject: enquiry.subject,
      });
      await sendMail(mailConfig, {
        to: enquiry.contact_email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        replyTo: mailConfig.replyTo,
      });
    }

    return json(200, { ok: true });
  }

  if (body.kind === "booking") {
    const bookingId = readString(body.bookingId);
    if (!bookingId) {
      return json(400, { error: "bookingId is required." });
    }

    const { data: booking, error } = await supabase
      .from("booking_requests")
      .update({ admin_notified_at: new Date().toISOString() })
      .eq("id", bookingId)
      .is("admin_notified_at", null)
      .select("id, reference, access_token, organizer_email, form_data, created_at")
      .maybeSingle();

    if (error) {
      const missingColumn = error.message.toLowerCase().includes("admin_notified_at");
      return json(
        missingColumn ? 503 : 500,
        missingColumn
          ? {
              error:
                "Notification tracking is not available yet. Apply Supabase migration 022_submission_notifications.sql.",
            }
          : { error: error.message },
      );
    }

    if (!booking) {
      return json(200, { ok: true, skipped: true });
    }

    if (!isRecentSubmission(booking.created_at)) {
      return json(200, { ok: true, skipped: true, reason: "expired" });
    }

    const form =
      booking.form_data && typeof booking.form_data === "object"
        ? (booking.form_data as Record<string, unknown>)
        : {};

    const adminUrl = `${baseUrl}/admin/requests/detail?id=${booking.id}`;
    const adminMail = buildBookingAdminMail({
      id: booking.id,
      reference: booking.reference,
      contactName: readFormField(form, "name") ?? "Unknown",
      contactEmail: booking.organizer_email,
      contactPhone: readFormField(form, "phone"),
      organization: readFormField(form, "organization"),
      eventTitle: readFormField(form, "eventTitle"),
      engagementType: readFormField(form, "engagementType"),
      format: readFormField(form, "format"),
      preferredDate: readFormField(form, "preferredDate"),
      city: readFormField(form, "city"),
      country: readFormField(form, "country"),
      adminUrl,
    });

    const adminResult = await sendMail(mailConfig, {
      to: mailConfig.adminTo,
      subject: adminMail.subject,
      html: adminMail.html,
      text: adminMail.text,
      replyTo: adminMail.replyTo,
    });

    if (!adminResult.ok) {
      await supabase.from("booking_requests").update({ admin_notified_at: null }).eq("id", booking.id);
      return json(502, { error: adminResult.error });
    }

    if (mailConfig.sendSubmitterConfirmation) {
      const trackerUrl = booking.access_token
        ? `${baseUrl}/booking/${booking.reference}?token=${booking.access_token}`
        : `${baseUrl}/booking/${booking.reference}`;
      const confirmation = buildBookingConfirmationMail({
        contactName: readFormField(form, "name") ?? "there",
        reference: booking.reference,
        trackerUrl,
      });
      await sendMail(mailConfig, {
        to: booking.organizer_email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        replyTo: mailConfig.replyTo,
      });
    }

    return json(200, { ok: true });
  }

  return json(400, { error: 'kind must be "enquiry" or "booking".' });
}
