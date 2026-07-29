"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { EnquiryModal } from "@/components/modals/enquiry-modal";

interface EnquiryContextValue {
  openModal: () => void;
  closeModal: () => void;
  isOpen: boolean;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handler = () => openModal();
    window.addEventListener("open-enquiry-modal", handler);
    return () => window.removeEventListener("open-enquiry-modal", handler);
  }, [openModal]);

  return (
    <EnquiryContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <EnquiryModal open={isOpen} onClose={closeModal} />
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used within EnquiryProvider");
  return ctx;
}
