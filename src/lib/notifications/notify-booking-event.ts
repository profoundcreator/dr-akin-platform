type NotifyConversionPayload = {
  kind: "conversion";
  bookingId: string;
  enquiryId?: string;
};

type NotifyStatusUpdatePayload = {
  kind: "status_update";
  bookingId: string;
  newStatus: string;
  organizerMessage?: string;
};

export type NotifyBookingEventPayload = NotifyConversionPayload | NotifyStatusUpdatePayload;

/** Fire-and-forget booking lifecycle emails (conversion, status updates). */
export function notifyBookingEvent(payload: NotifyBookingEventPayload): void {
  if (typeof window === "undefined") return;

  void fetch("/api/notify-booking-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (response.ok) return;
      const detail = await response.text().catch(() => "");
      console.warn("[notifications] notify-booking-event failed:", response.status, detail);
    })
    .catch((error) => {
      console.warn("[notifications] notify-booking-event request failed:", error);
    });
}
