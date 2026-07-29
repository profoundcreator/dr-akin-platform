export const OPEN_ENQUIRY_MODAL_EVENT = "open-enquiry-modal";

export function openEnquiryModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_ENQUIRY_MODAL_EVENT));
}
