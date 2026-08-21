"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitGeneralEnquiry } from "@/lib/contact/enquiries";
import {
  isBrandRoutedPlatform,
  readContactSubmissionContext,
  type ContactPlatform,
} from "@/lib/contact/platform-context";
import { platformLabel } from "@/lib/contact/platform-labels";

const CONTACT_TOPICS = [
  "Government & institutional partnership",
  "Media enquiry",
  "General enquiry",
  "Organizer support",
  "Privacy or data request",
] as const;

const INITIAL = {
  name: "",
  email: "",
  organization: "",
  subject: "",
  message: "",
  website: "",
  privacyAgreed: false,
};

export function ContactForm() {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platformContext, setPlatformContext] = useState<ContactPlatform | null>(null);

  useEffect(() => {
    setPlatformContext(readContactSubmissionContext().platform);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.privacyAgreed) {
      setError("Please confirm that you have read the privacy notice.");
      return;
    }

    setSubmitting(true);
    try {
      await submitGeneralEnquiry(form);
      setForm(INITIAL);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not send your enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="ploy-surface-elevated space-y-4 p-6" role="status">
        <CheckCircle2 className="size-9 text-[var(--ploy-status-success)]" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Your enquiry has been received</h2>
        <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
          Thank you for getting in touch. Our team aims to respond within 3–5 business days.
        </p>
        <Button type="button" variant="secondary" onClick={() => setSubmitted(false)}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form className="ploy-surface-elevated space-y-5 p-6" onSubmit={handleSubmit}>
      {platformContext && isBrandRoutedPlatform(platformContext) && (
        <p className="rounded-md border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
          Your enquiry will be routed to the {platformLabel(platformContext)} team.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" required>Name</Label>
          <Input id="contact-name" autoComplete="name" required minLength={2} maxLength={120}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" required>Email</Label>
          <Input id="contact-email" type="email" autoComplete="email" required maxLength={254}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-organization">Organization</Label>
        <Input id="contact-organization" autoComplete="organization" maxLength={160}
          value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject" required>What can we help with?</Label>
        <Select
          id="contact-subject"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        >
          <option value="">Select an enquiry type</option>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message" required>Message</Label>
        <Textarea id="contact-message" required minLength={20} maxLength={5000} rows={7}
          value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <p className="text-xs text-[var(--ploy-text-tertiary)]">Please do not include sensitive personal information.</p>
      </div>
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <Label htmlFor="contact-website">Website</Label>
        <Input id="contact-website" tabIndex={-1} autoComplete="off"
          value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      </div>
      <label className="flex items-start gap-3 text-sm text-[var(--ploy-text-secondary)]">
        <input type="checkbox" className="mt-1" required checked={form.privacyAgreed}
          onChange={(e) => setForm({ ...form, privacyAgreed: e.target.checked })} />
        <span>I have read the <a className="underline" href="/privacy">privacy notice</a> and agree to the use of my information to respond to this enquiry.</span>
      </label>
      {error && <p className="text-sm text-[var(--ploy-status-error)]" role="alert">{error}</p>}
      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
