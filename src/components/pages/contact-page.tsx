"use client";

import { ContactForm } from "@/components/contact/contact-form";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { SITE_CONTACT } from "@/data/site-contact";

export function ContactPage() {
  return (
    <PageShell>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:py-24">
        <div className="space-y-6">
          <p className="ploy-kicker">Contact</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Start a conversation</h1>
          <p className="max-w-xl leading-relaxed text-[var(--ploy-text-secondary)]">
            For partnerships, media, programmes, governance, and other general enquiries, send a
            note using this form.
          </p>
          <p className="text-sm text-[var(--ploy-text-tertiary)]">{SITE_CONTACT.responseTime}</p>
          <div className="border-t border-[var(--ploy-border-subtle)] pt-6">
            <p className="mb-3 text-sm text-[var(--ploy-text-secondary)]">
              Planning a speaking engagement or executive session?
            </p>
            <Button href={SITE_CONTACT.bookingPath} variant="secondary" showArrow>
              Submit an engagement invitation
            </Button>
          </div>
        </div>
        <ContactForm />
      </section>
    </PageShell>
  );
}
