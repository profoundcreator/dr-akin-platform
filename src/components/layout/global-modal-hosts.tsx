"use client";

import { EnquiryModalHost } from "@/components/layout/enquiry-modal-host";
import { NewsletterModalHost } from "@/components/layout/newsletter-modal-host";

/** Site-wide modal hosts — mounted once from Layout.astro */
export function GlobalModalHosts() {
  return (
    <>
      <EnquiryModalHost />
      <NewsletterModalHost />
    </>
  );
}
