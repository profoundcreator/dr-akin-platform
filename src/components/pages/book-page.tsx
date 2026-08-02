"use client";

import { BookingForm } from "@/components/booking/booking-form";
import { PageShell } from "@/components/layout/page-shell";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

export function BookPage() {
  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container">
          <div className="mx-auto max-w-3xl space-y-10">
            <Reveal className="space-y-4 text-center">
              <p className="ploy-kicker">Invite Akin Akinpelu</p>
              <Heading as="h1" size="section" className="ploy-text-balance">
                Submit a structured engagement invitation
              </Heading>
              <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
                Complete the form below to invite Akin Akinpelu for a keynote,
                panel, workshop, or advisory session. Submission does not constitute
                acceptance — our team will review and respond within 3–5 business days.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="ploy-surface-elevated p-6 sm:p-10">
                <BookingForm variant="page" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
