"use client";

import { useCallback, useEffect, useState } from "react";
import { NewsletterModal } from "@/components/modals/newsletter-modal";
import { OPEN_NEWSLETTER_MODAL_EVENT } from "@/lib/newsletter-modal";

export function NewsletterModalHost() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handler = () => openModal();
    window.addEventListener(OPEN_NEWSLETTER_MODAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_NEWSLETTER_MODAL_EVENT, handler);
  }, [openModal]);

  return <NewsletterModal open={isOpen} onClose={closeModal} />;
}
