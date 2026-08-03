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
  }).catch(() => {
    /* notification is best-effort */
  });
}
