type NotifyEnquiryPayload = { kind: "enquiry"; enquiryId: string };
type NotifyBookingPayload = { kind: "booking"; bookingId: string };

export type NotifySubmissionPayload = NotifyEnquiryPayload | NotifyBookingPayload;

/**
 * Fire-and-forget admin notification after a successful RPC submission.
 * Submission is already persisted — email failure must not block the user.
 */
export function notifySubmission(payload: NotifySubmissionPayload): void {
  if (typeof window === "undefined") return;

  void fetch("/api/notify-submission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (response.ok) return;
      const detail = await response.text().catch(() => "");
      console.warn("[notifications] notify-submission failed:", response.status, detail);
    })
    .catch((error) => {
      console.warn("[notifications] notify-submission request failed:", error);
    });
}
