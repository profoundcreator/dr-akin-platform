"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { EventCountdown } from "@/components/events/event-countdown";
import {
  EVENT_BRAND_LABELS,
  EVENT_TYPE_LABELS,
} from "@/lib/events/constants";
import {
  getEventCoverUrl,
  getPublishedEvents,
  type PlatformEvent,
} from "@/lib/events/events";
import { isEventUpcoming } from "@/lib/events/event-visibility";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { EventBrand, EventType } from "@/lib/supabase/database.types";

type FilterValue = "all" | EventType | EventBrand;

function formatEventDate(startsAt: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(startsAt));
}

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hosted_by_dr_akin", label: "Dr. Akin" },
  { value: "featured_appearance", label: "Speaking" },
  { value: "aald", label: "AALD" },
  { value: "erudio", label: "Erudio" },
  { value: "performx", label: "PERFORMX" },
];

function matchesFilter(event: PlatformEvent, filter: FilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "hosted_by_dr_akin" || filter === "featured_appearance" || filter === "org_brand") {
    return event.eventType === filter;
  }
  return event.brand === filter;
}

export function EventsHubPage() {
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    getPublishedEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = useMemo(
    () => events.filter((event) => isEventUpcoming(event) && matchesFilter(event, filter)),
    [events, filter],
  );

  const featured = upcoming[0];

  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow">Events</p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                Gatherings, keynotes
                <span className="block text-[var(--ploy-text-secondary)]">and brand moments</span>
              </Heading>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
                Register for upcoming events hosted by Dr. Akin, featuring his appearances, and
                programmes from the operating brands.
              </p>
            </Reveal>
          </div>

          <Reveal
            delay={0.15}
            className="relative flex min-h-[24rem] flex-col justify-between border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-8 lg:min-h-[28rem] lg:border-l lg:border-t-0 lg:p-12"
          >
            <div>
              <p className="font-serif text-[6rem] leading-none text-[var(--ploy-border-primary)] md:text-[8rem]">
                {upcoming.length || "—"}
              </p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                Upcoming
              </p>
            </div>
            <div className="border-t border-[var(--ploy-accent-primary)] pt-6">
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                Registration links open on each event page
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-10 md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto flex max-w-[var(--ploy-canvas-main)] flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={
                filter === option.value
                  ? "rounded-full bg-[var(--ploy-interactive-primary)] px-4 py-2 text-sm font-medium text-[var(--ploy-text-inverse)]"
                  : "rounded-full border border-[var(--ploy-border-primary)] px-4 py-2 text-sm font-medium text-[var(--ploy-text-secondary)] hover:bg-[var(--ploy-background-secondary)]"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {featured && (
        <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
          <div className="mx-auto grid max-w-[var(--ploy-canvas-main)] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <Reveal>
              <p className="ploy-eyebrow">Next up</p>
              <Heading as="h2" size="section" className="mt-7">
                {featured.title}
              </Heading>
              <EventCountdown targetDate={featured.startsAt} className="mt-8" />
              <Button variant="primary" showArrow href={`/events/${featured.slug}`} className="mt-9">
                Register & details
              </Button>
            </Reveal>
            <Reveal delay={0.1}>
              {getEventCoverUrl(featured.coverImagePath) ? (
                <img
                  src={getEventCoverUrl(featured.coverImagePath)!}
                  alt={featured.title}
                  className="aspect-[16/10] w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-[var(--ploy-background-secondary)]">
                  <CalendarDays className="size-16 text-[var(--ploy-border-primary)]" />
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      <section className="bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <Heading as="h2" size="section">
            Upcoming events
          </Heading>

          {loading ? (
            <p className="mt-8 text-sm text-[var(--ploy-text-tertiary)]">Loading events…</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-8 max-w-xl text-lg text-[var(--ploy-text-secondary)]">
              No upcoming events in this view right now. Check back soon or browse all categories
              above.
            </p>
          ) : (
            <Reveal stagger className="mt-10 grid gap-6 md:grid-cols-2">
              {upcoming.map((event) => (
                <RevealItem key={event.id}>
                  <a
                    href={`/events/${event.slug}`}
                    className="group block rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-6 transition-colors hover:border-[var(--ploy-accent-primary)]"
                  >
                    {getEventCoverUrl(event.coverImagePath) && (
                      <img
                        src={getEventCoverUrl(event.coverImagePath)!}
                        alt=""
                        className="mb-5 aspect-[16/9] w-full rounded-lg object-cover"
                      />
                    )}
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                      {EVENT_TYPE_LABELS[event.eventType]} · {EVENT_BRAND_LABELS[event.brand]}
                    </p>
                    <Heading as="h3" size="card" className="mt-3">
                      {event.title}
                    </Heading>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--ploy-text-secondary)]">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      {formatEventDate(event.startsAt, event.timezone)}
                    </p>
                    {event.location && (
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--ploy-text-tertiary)]">
                        <MapPin className="size-4" aria-hidden="true" />
                        {event.location}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
                      View event
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                </RevealItem>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </PageShell>
  );
}
