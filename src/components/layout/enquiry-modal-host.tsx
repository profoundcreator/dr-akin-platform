"use client";

import { useCallback, useEffect, useState } from "react";
import { EnquiryModal } from "@/components/modals/enquiry-modal";
import { OPEN_ENQUIRY_MODAL_EVENT } from "@/lib/enquiry";

declare global {
  interface Window {
    __enquiryModalPending?: boolean;
  }
}

/**
 * Global enquiry modal host — mounted inside PageShell so it hydrates
 * with the header/footer Inquire buttons in the same React island.
 */
export function EnquiryModalHost() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (window.__enquiryModalPending) {
      setIsOpen(true);
      window.__enquiryModalPending = false;
    }

    const handler = () => openModal();
    window.addEventListener(OPEN_ENQUIRY_MODAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_ENQUIRY_MODAL_EVENT, handler);
  }, [openModal]);

  return <EnquiryModal open={isOpen} onClose={closeModal} />;
}
