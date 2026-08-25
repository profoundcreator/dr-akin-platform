export const OPEN_NEWSLETTER_MODAL_EVENT = "open-newsletter-modal";

export function openNewsletterModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_NEWSLETTER_MODAL_EVENT));
}
