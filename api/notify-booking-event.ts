import { createServiceSupabaseClient } from "./lib/supabase-service";
import { siteUrl } from "./lib/env";
import { isSameSiteRequest } from "./lib/request-guard";
import {
  buildBookingConversionAdminMail,
  buildBookingConversionConfirmationMail,
  buildBookingStatusUpdateMail,
  getNotificationMailConfig,
  NOTIFICATIONS_NOT_CONFIGURED,
  sendMail,
} from "./lib/notifications";
import {
  getBrandInboxes,
  resolveBookingNotificationRecipients,
} from "./lib/notification-routing";

type BookingEventBody =
  | { kind: "conversion"; bookingId: string; enquiryId?: string }
  | {
      kind: "status_update";
      bookingId: string;
      newStatus: string;
      organizerMessage?: string;
    };

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
  if (!isSameSiteRequest(request)) {
    return json(403, { error: "Forbidden." });
  }

  const mailConfig = getNotificationMailConfig();
  if (!mailConfig) {
    return json(503, { error: NOTIFICATIONS_NOT_CONFIGURED });
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return json(503, { error: "Supabase service role is not configured on the server." });
  }

  let body: BookingEventBody;
  try {
    body = (await request.json()) as BookingEventBody;
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  const baseUrl = siteUrl();
  const bookingId = readString("bookingId" in body ? body.bookingId : "");
  if (!bookingId) {
    return json(400, { error: "bookingId is required." });
  }

  const { data: booking, error: bookingError } = await supabase
    .from("booking_requests")
    .select("id, reference, access_token, organizer_email, form_data, status, created_at")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return json(500, { error: bookingError.message });
  }
  if (!booking) {
    return json(404, { error: "Booking not found." });
  }

  const form =
    booking.form_data && typeof booking.form_data === "object"
      ? (booking.form_data as Record<string, unknown>)
      : {};

  const contactName = readFormField(form, "name") ?? "there";
  const trackerUrl = booking.access_token
    ? `${baseUrl}/booking/${booking.reference}?token=${booking.access_token}`
    : `${baseUrl}/booking/${booking.reference}`;

  const brandInboxes = getBrandInboxes();
  const teamRecipients = resolveBookingNotificationRecipients(brandInboxes);

  if (body.kind === "conversion") {
    if (teamRecipients.length === 0) {
      return json(503, { error: "ADMIN_NOTIFICATION_EMAIL is not configured." });
    }

    let enquirySubject: string | null = null;
    const enquiryId = readString(body.enquiryId);
    if (enquiryId) {
      const { data: enquiry } = await supabase
        .from("enquiries")
        .select("subject")
        .eq("id", enquiryId)
        .maybeSingle();
      enquirySubject = enquiry?.subject ?? null;
    }

    const adminUrl = `${baseUrl}/admin/requests/detail?id=${booking.id}`;
    const adminMail = buildBookingConversionAdminMail({
      id: booking.id,
      reference: booking.reference,
      contactName,
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
      enquirySubject,
    });

    const adminResult = await sendMail(mailConfig, {
      to: teamRecipients,
      subject: adminMail.subject,
      html: adminMail.html,
      text: adminMail.text,
      replyTo: adminMail.replyTo,
    });

    if (!adminResult.ok) {
      console.error("[notifications] conversion admin alert failed:", adminResult.error);
      return json(502, { error: adminResult.error });
    }

    await supabase
      .from("booking_requests")
      .update({ admin_notified_at: new Date().toISOString() })
      .eq("id", booking.id)
      .is("admin_notified_at", null);

    if (mailConfig.sendSubmitterConfirmation) {
      const confirmation = buildBookingConversionConfirmationMail({
        contactName,
        reference: booking.reference,
        trackerUrl,
      });
      const confirmationResult = await sendMail(mailConfig, {
        to: booking.organizer_email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        replyTo: mailConfig.replyTo,
      });
      if (!confirmationResult.ok) {
        console.error("[notifications] conversion confirmation failed:", confirmationResult.error);
      }
    }

    return json(200, { ok: true });
  }

  if (body.kind === "status_update") {
    const newStatus = readString(body.newStatus);
    if (!newStatus) {
      return json(400, { error: "newStatus is required." });
    }

    const statusMail = buildBookingStatusUpdateMail({
      contactName,
      reference: booking.reference,
      status: newStatus,
      organizerMessage: readString(body.organizerMessage) || null,
      trackerUrl,
    });

    const result = await sendMail(mailConfig, {
      to: booking.organizer_email,
      subject: statusMail.subject,
      html: statusMail.html,
      text: statusMail.text,
      replyTo: mailConfig.replyTo,
    });

    if (!result.ok) {
      console.error("[notifications] status update email failed:", result.error);
      return json(502, { error: result.error });
    }

    return json(200, { ok: true });
  }

  return json(400, { error: 'kind must be "conversion" or "status_update".' });
}
