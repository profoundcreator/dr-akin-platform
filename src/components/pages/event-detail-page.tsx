"use client";

import { SummitInterestForm } from "@/components/marketing/summit-interest-form";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { EventCountdown } from "@/components/events/event-countdown";
import {
  EVENT_BRAND_LABELS,
  EVENT_TYPE_LABELS,
  LOCATION_TYPE_OPTIONS,
} from "@/lib/events/constants";
import {
  getEventCoverUrl,
  type PlatformEvent,
} from "@/lib/events/events";
import { isEventUpcoming } from "@/lib/events/event-visibility";

interface EventDetailPageProps {
  event: PlatformEvent;
}

function formatEventDate(startsAt: string, endsAt: string, timezone: string): string {
  const start = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(startsAt));

  const end = new Intl.DateTimeFormat("en-GB", {
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(endsAt));

  return `${start} – ${end}`;
}

function locationLabel(locationType: string): string {
  return LOCATION_TYPE_OPTIONS.find((option) => option.value === locationType)?.label ?? locationType;
}

export function EventDetailPage({ event }: EventDetailPageProps) {
  const coverUrl = getEventCoverUrl(event.coverImagePath);
  const upcoming = isEventUpcoming(event);

  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-3xl space-y-6">
              <p className="ploy-eyebrow">
                {EVENT_TYPE_LABELS[event.eventType]} · {EVENT_BRAND_LABELS[event.brand]}
              </p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                {event.title}
              </Heading>
              <p className="inline-flex items-center gap-2 text-base text-[var(--ploy-text-secondary)]">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatEventDate(event.startsAt, event.endsAt, event.timezone)}
              </p>
              {(event.location || event.locationType) && (
                <p className="inline-flex items-center gap-2 text-base text-[var(--ploy-text-secondary)]">
                  <MapPin className="size-4" aria-hidden="true" />
                  {[locationLabel(event.locationType), event.location].filter(Boolean).join(" · ")}
                </p>
              )}
              {upcoming && <EventCountdown targetDate={event.startsAt} className="pt-4" />}
              <div className="flex flex-wrap gap-4 pt-4">
                {event.registrationUrl && (
                  <Button
                    variant="primary"
                    showArrow
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Register
                  </Button>
                )}
                {event.paymentUrl && (
                  <Button
                    variant="secondary"
                    href={event.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.paymentLabel || "Pay now"}
                  </Button>
                )}
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 self-center text-sm font-semibold underline underline-offset-4"
                >
                  All events
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal
            delay={0.1}
            className="relative min-h-[24rem] border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] lg:min-h-[32rem] lg:border-l lg:border-t-0"
          >
            {coverUrl ? (
              <img src={coverUrl} alt={event.title} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center p-12">
                <CalendarDays className="size-20 text-[var(--ploy-border-primary)]" />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {event.description && (
        <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-16 md:px-10 md:py-20 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <Heading as="h2" size="section">
                About this event
              </Heading>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
                {event.description.split("\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {event.registrationEmbedUrl && (
        <section className="bg-[var(--ploy-background-primary)] px-6 py-16 md:px-10 md:py-20 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <Heading as="h2" size="section">
                Register
              </Heading>
              <div className="mt-8 overflow-hidden rounded-xl border border-[var(--ploy-border-primary)]">
                <iframe
                  src={event.registrationEmbedUrl}
                  title={`Register for ${event.title}`}
                  className="min-h-[520px] w-full"
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {event.slug === "performx-summit-2026" && (
        <SummitInterestForm eventSlug={event.slug} eventTitle={event.title} />
      )}
    </PageShell>
  );
}
