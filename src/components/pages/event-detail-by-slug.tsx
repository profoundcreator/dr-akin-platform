"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { EventDetailPage } from "@/components/pages/event-detail-page";
import {
  getEventBySlug,
  getEventMetaDescription,
  getEventCoverUrl,
  type PlatformEvent,
} from "@/lib/events/events";
import { resolveContentSlug } from "@/lib/routing/resolve-content-slug";

interface EventDetailBySlugProps {
  slug: string;
}

function applyClientSeo(event: PlatformEvent) {
  document.title = `${event.title} — Events`;

  const description = getEventMetaDescription(event);
  const coverUrl = getEventCoverUrl(event.coverImagePath);

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${event.title} — Events`);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", description);

  if (coverUrl) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", coverUrl);
  }
}

export function EventDetailBySlug({ slug }: EventDetailBySlugProps) {
  const [event, setEvent] = useState<PlatformEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const effectiveSlug = resolveContentSlug(slug, "events");
    if (!effectiveSlug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    getEventBySlug(effectiveSlug)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setEvent(data);
        applyClientSeo(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading event…</p>
        </section>
      </PageShell>
    );
  }

  if (notFound || !event) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-xl space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight">Event not found</h1>
            <p className="text-lg text-[var(--ploy-text-secondary)]">
              This event may have ended, been hidden, or is not published yet.
            </p>
            <Button variant="primary" href="/events">
              Back to events
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return <EventDetailPage event={event} />;
}
