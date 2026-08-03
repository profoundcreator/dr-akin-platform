"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { EventCountdown } from "@/components/events/event-countdown";
import {
  getEventCoverUrl,
  getHomepageFeaturedEvent,
  type PlatformEvent,
} from "@/lib/events/events";
import { EVENT_BRAND_LABELS, EVENT_TYPE_LABELS } from "@/lib/events/constants";
import {
  DEFAULT_SITE_SETTINGS,
  getPublicSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings/site-settings";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function formatEventDate(startsAt: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(startsAt));
}

export function EventsFeaturedSection() {
  const [featured, setFeatured] = useState<PlatformEvent | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }

    let cancelled = false;

    getPublicSiteSettings()
      .then((siteSettings) => {
        if (!cancelled) setSettings(siteSettings);
      })
      .catch(() => {
        if (!cancelled) setSettings(DEFAULT_SITE_SETTINGS);
      });

    getHomepageFeaturedEvent()
      .then((event) => {
        if (!cancelled) setFeatured(event);
      })
      .catch(() => {
        if (!cancelled) setFeatured(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const showSection =
    loaded &&
    featured &&
    (settings.homepageEventsEnabled || featured.isHomepageFeatured);

  if (!showSection) return null;

  const coverUrl = getEventCoverUrl(featured.coverImagePath);

  return (
    <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Reveal>
            <p className="ploy-eyebrow">Events · Upcoming</p>
            <Heading as="h2" size="section" className="mt-7">
              {featured.title}
            </Heading>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--ploy-text-secondary)]">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatEventDate(featured.startsAt, featured.timezone)}
            </p>
            <p className="mt-3 text-sm text-[var(--ploy-text-tertiary)]">
              {EVENT_TYPE_LABELS[featured.eventType]} · {EVENT_BRAND_LABELS[featured.brand]}
              {featured.location ? ` · ${featured.location}` : ""}
            </p>
            {featured.description && (
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
                {featured.description}
              </p>
            )}
            <div className="mt-8">
              <EventCountdown targetDate={featured.startsAt} />
            </div>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button variant="primary" showArrow href={`/events/${featured.slug}`}>
                View event
              </Button>
              <a
                href="/events"
                className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:decoration-[var(--ploy-text-primary)]"
              >
                All events
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="overflow-hidden rounded-xl bg-[var(--ploy-background-secondary)]">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={featured.title}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center p-12">
                <p className="font-serif text-[5rem] leading-none text-[var(--ploy-border-primary)]">
                  {new Date(featured.startsAt).getDate()}
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
