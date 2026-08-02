"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AUDIENCE_SIZE_OPTIONS,
  BOOKING_STEPS,
  BUDGET_RANGES,
  ENGAGEMENT_TYPES,
  FORMAT_OPTIONS,
  RECORDING_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/lib/booking/constants";
import { createBookingRequest, isSupabaseConfigured } from "@/lib/booking/api";
import type { BookingFormData, BookingFormStep } from "@/lib/booking/types";
import { EMPTY_BOOKING_FORM } from "@/lib/booking/types";
import { validateStep } from "@/lib/booking/validation";
import { cn } from "@/lib/utils";

const SESSION_KEY = "daa_booking_form_draft";

interface BookingFormProps {
  variant?: "page" | "modal";
  onSubmitted?: (reference: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

function loadDraft(): BookingFormData {
  if (typeof window === "undefined") return EMPTY_BOOKING_FORM;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? { ...EMPTY_BOOKING_FORM, ...JSON.parse(raw) } : EMPTY_BOOKING_FORM;
  } catch {
    return EMPTY_BOOKING_FORM;
  }
}

export function BookingForm({
  variant = "page",
  onSubmitted,
  onDirtyChange,
}: BookingFormProps) {
  const [step, setStep] = useState<BookingFormStep>(1);
  const [form, setForm] = useState<BookingFormData>(EMPTY_BOOKING_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [trackerUrl, setTrackerUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    setForm(loadDraft());
  }, []);

  useEffect(() => {
    if (!submittedRef) return;
    sessionStorage.removeItem(SESSION_KEY);
    onDirtyChange?.(false);
  }, [submittedRef, onDirtyChange]);

  useEffect(() => {
    if (submittedRef) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(form));
    const dirty = JSON.stringify(form) !== JSON.stringify(EMPTY_BOOKING_FORM);
    onDirtyChange?.(dirty);
  }, [form, onDirtyChange, submittedRef]);

  const updateField = useCallback(
    <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    [],
  );

  const goNext = () => {
    const result = validateStep(step, form);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setStep((s) => Math.min(4, s + 1) as BookingFormStep);
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1) as BookingFormStep);
  };

  const handleSubmit = async () => {
    const result = validateStep(4, form);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createBookingRequest(form, variant === "modal" ? "modal" : "web");
      sessionStorage.removeItem(SESSION_KEY);
      setSubmittedRef(result.reference);
      const url = result.accessToken
        ? `/booking/${result.reference}?token=${result.accessToken}`
        : `/booking/${result.reference}`;
      setTrackerUrl(url);
      onSubmitted?.(result.reference);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRef) {
    const trackHref = trackerUrl ?? `/booking/${submittedRef}`;

    async function copyReference() {
      try {
        await navigator.clipboard.writeText(submittedRef!);
        setCopiedRef(true);
        window.setTimeout(() => setCopiedRef(false), 2000);
      } catch {
        /* clipboard unavailable */
      }
    }

    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--ploy-background-accent-muted)]">
          <CheckCircle2 className="size-8 text-[var(--ploy-text-accent)]" />
        </div>
        <div className="space-y-3">
          <Heading as="h2" size="card">
            Request submitted successfully
          </Heading>
          <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
            Save your booking reference — you&apos;ll need it to track status.
          </p>
          <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-secondary)] px-4 py-3">
            <code className="text-lg font-semibold tracking-wide text-[var(--ploy-text-primary)]">
              {submittedRef}
            </code>
            <button
              type="button"
              onClick={copyReference}
              className="inline-flex size-9 items-center justify-center rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] text-[var(--ploy-text-secondary)] hover:bg-[var(--ploy-interactive-secondary)]"
              aria-label="Copy booking reference"
            >
              {copiedRef ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
            Our team will review your invitation and respond within 3–5 business days.
            {!isSupabaseConfigured && (
              <span className="mt-2 block text-xs text-[var(--ploy-text-tertiary)]">
                Running in local demo mode — configure Supabase for persistent storage.
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href={trackHref} variant="primary" showArrow>
            Track your request
          </Button>
          {variant === "modal" && (
            <Button href="/book-dr-akin" variant="secondary">
              Open full booking page
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", variant === "modal" && "flex flex-col")}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          {BOOKING_STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step >= s.id
                    ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                    : "bg-[var(--ploy-interactive-secondary)] text-[var(--ploy-text-tertiary)]",
                )}
              >
                {s.id}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  step === s.id
                    ? "text-[var(--ploy-text-primary)]"
                    : "text-[var(--ploy-text-tertiary)]",
                )}
              >
                {s.label}
              </span>
              {i < BOOKING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute hidden h-px sm:block",
                    step > s.id
                      ? "bg-[var(--ploy-interactive-primary)]"
                      : "bg-[var(--ploy-border-default)]",
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-[var(--ploy-text-secondary)]">
          Step {step} of 4 — {BOOKING_STEPS[step - 1].description}
        </p>
      </div>

      <div className="space-y-5">
        {step === 1 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name" required>
                  Full name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-xs text-[var(--ploy-status-error)]">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="organization" required>
                  Organization
                </Label>
                <Input
                  id="organization"
                  value={form.organization}
                  onChange={(e) => updateField("organization", e.target.value)}
                  placeholder="Company or institution"
                />
                {errors.organization && (
                  <p className="text-xs text-[var(--ploy-status-error)]">
                    {errors.organization}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@organization.com"
                />
                {errors.email && (
                  <p className="text-xs text-[var(--ploy-status-error)]">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" required>
                  Phone / WhatsApp
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+234 ..."
                />
                {errors.phone && (
                  <p className="text-xs text-[var(--ploy-status-error)]">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="timezone" required>
                  Timezone
                </Label>
                <Select
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => updateField("timezone", e.target.value)}
                >
                  <option value="">Select timezone</option>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
                {errors.timezone && (
                  <p className="text-xs text-[var(--ploy-status-error)]">{errors.timezone}</p>
                )}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="engagementType" required>
                Engagement type
              </Label>
              <Select
                id="engagementType"
                value={form.engagementType}
                onChange={(e) => updateField("engagementType", e.target.value)}
              >
                <option value="">Select type</option>
                {ENGAGEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              {errors.engagementType && (
                <p className="text-xs text-[var(--ploy-status-error)]">
                  {errors.engagementType}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="format" required>
                Format
              </Label>
              <Select
                id="format"
                value={form.format}
                onChange={(e) => updateField("format", e.target.value)}
              >
                <option value="">Select format</option>
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
              {errors.format && (
                <p className="text-xs text-[var(--ploy-status-error)]">{errors.format}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="eventTitle" required>
                Event title
              </Label>
              <Input
                id="eventTitle"
                value={form.eventTitle}
                onChange={(e) => updateField("eventTitle", e.target.value)}
                placeholder="Name of the event or session"
              />
              {errors.eventTitle && (
                <p className="text-xs text-[var(--ploy-status-error)]">{errors.eventTitle}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="audienceSize" required>
                Estimated audience size
              </Label>
              <Select
                id="audienceSize"
                value={form.audienceSize}
                onChange={(e) => updateField("audienceSize", e.target.value)}
              >
                <option value="">Select audience size</option>
                {AUDIENCE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
              {errors.audienceSize && (
                <p className="text-xs text-[var(--ploy-status-error)]">
                  {errors.audienceSize}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferredDate" required>
                Preferred date
              </Label>
              <Input
                id="preferredDate"
                type="date"
                value={form.preferredDate}
                onChange={(e) => updateField("preferredDate", e.target.value)}
              />
              {errors.preferredDate && (
                <p className="text-xs text-[var(--ploy-status-error)]">
                  {errors.preferredDate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="alternativeDate">Alternative date</Label>
              <Input
                id="alternativeDate"
                type="date"
                value={form.alternativeDate}
                onChange={(e) => updateField("alternativeDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" required>
                City
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Event city"
              />
              {errors.city && (
                <p className="text-xs text-[var(--ploy-status-error)]">{errors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" required>
                Country
              </Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Event country"
              />
              {errors.country && (
                <p className="text-xs text-[var(--ploy-status-error)]">{errors.country}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="travelDetails">Travel details</Label>
              <Textarea
                id="travelDetails"
                value={form.travelDetails}
                onChange={(e) => updateField("travelDetails", e.target.value)}
                placeholder="International travel required? Accommodation provided? Local transport?"
              />
            </div>
          </div>
        )}

        {step === 4 && submitError && (
          <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-3 py-2 text-sm text-[var(--ploy-status-error)]">
            {submitError}
          </p>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budgetRange" required>
                  Budget range
                </Label>
                <Select
                  id="budgetRange"
                  value={form.budgetRange}
                  onChange={(e) => updateField("budgetRange", e.target.value)}
                >
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </Select>
                {errors.budgetRange && (
                  <p className="text-xs text-[var(--ploy-status-error)]">
                    {errors.budgetRange}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordingPermission" required>
                  Recording permission
                </Label>
                <Select
                  id="recordingPermission"
                  value={form.recordingPermission}
                  onChange={(e) => updateField("recordingPermission", e.target.value)}
                >
                  <option value="">Select recording preference</option>
                  {RECORDING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
                {errors.recordingPermission && (
                  <p className="text-xs text-[var(--ploy-status-error)]">
                    {errors.recordingPermission}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vipProtocol">VIP / protocol requirements</Label>
              <Textarea
                id="vipProtocol"
                value={form.vipProtocol}
                onChange={(e) => updateField("vipProtocol", e.target.value)}
                placeholder="Security, reception protocol, special accommodations..."
              />
            </div>
            <div className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-secondary)] p-4">
              <Checkbox
                id="termsAgreed"
                name="termsAgreed"
                checked={form.termsAgreed}
                onChange={(e) => updateField("termsAgreed", e.target.checked)}
                label="I confirm the information provided is accurate, acknowledge the privacy policy, and understand that submission does not constitute acceptance of the engagement."
              />
              {errors.termsAgreed && (
                <p className="mt-2 text-xs text-[var(--ploy-status-error)]">
                  {errors.termsAgreed}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-4 border-t border-[var(--ploy-border-subtle)] pt-6",
          variant === "modal" && "sticky bottom-0 bg-[var(--ploy-background-elevated)]",
        )}
      >
        {step > 1 ? (
          <Button type="button" variant="ghost" onClick={goBack}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button type="button" variant="primary" showArrow onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            showArrow
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit request"}
          </Button>
        )}
      </div>
    </div>
  );
}
