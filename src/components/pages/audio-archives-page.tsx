"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import {
  getPublishedFeaturedEpisodes,
  type FeaturedPodcastEpisode,
} from "@/lib/audio/featured-episodes";
import { KINGDOM_CATALYST_SHOW } from "@/data/audio-content";

export function AudioArchivesPage() {
  const [episodes, setEpisodes] = useState<FeaturedPodcastEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);

  useEffect(() => {
    getPublishedFeaturedEpisodes()
      .then(setEpisodes)
      .catch(() => setEpisodes([]))
      .finally(() => setLoadingEpisodes(false));
  }, []);

  return (
    <PageShell>
      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto grid max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
            <Reveal className="max-w-4xl space-y-8">
              <p className="ploy-eyebrow">Resources · Audio Archives</p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                Keynotes, conversations,
                <span className="block text-[var(--ploy-text-secondary)]">
                  and catalytic teaching on audio.
                </span>
              </Heading>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
                Listen to The Kingdom Catalyst podcast and explore selected audio resources
                for leadership, faith, and marketplace influence.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  showArrow
                  href={KINGDOM_CATALYST_SHOW.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Listen on Spotify
                </Button>
                <a href="/resources" className="ploy-text-link-underline inline-flex items-center gap-2">
                  Back to resources
                  <ArrowRight className="size-4 rotate-180" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal
            delay={0.15}
            className="relative flex min-h-[28rem] flex-col justify-between border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-8 lg:min-h-[32rem] lg:border-l lg:border-t-0 lg:p-12"
          >
            <div>
              <p className="font-serif text-[5rem] leading-none text-[var(--ploy-border-primary)] md:text-[7rem]">
                KC
              </p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                Podcast
              </p>
              <Heading as="p" size="card" className="mt-2">
                The Kingdom Catalyst
              </Heading>
            </div>
            <div className="border-t border-[var(--ploy-accent-primary)] pt-6">
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                Hosted by Akin Akinpelu
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
          <Reveal className="mb-10 grid gap-6 lg:grid-cols-[0.35fr_1fr] lg:items-end">
            <Heading as="h2" size="section">The Kingdom Catalyst</Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              {KINGDOM_CATALYST_SHOW.description}
            </p>
          </Reveal>

          <Reveal delay={0.05} className="overflow-hidden rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
            <iframe
              title={`${KINGDOM_CATALYST_SHOW.title} on Spotify`}
              src={KINGDOM_CATALYST_SHOW.embedUrl}
              width="100%"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="block w-full border-0"
            />
          </Reveal>

          <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-4">
            <Button
              variant="primary"
              showArrow
              href={KINGDOM_CATALYST_SHOW.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Spotify
            </Button>
          </Reveal>
        </div>
      </section>

      {(loadingEpisodes || episodes.length > 0) && (
        <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-[var(--ploy-canvas-main)]">
            <Reveal className="mb-10">
              <Heading as="h2" size="section">Featured episodes</Heading>
            </Reveal>

            {loadingEpisodes ? (
              <p className="text-sm text-[var(--ploy-text-secondary)]">Loading featured episodes...</p>
            ) : (
              <div className="border-t border-[var(--ploy-border-primary)]">
                {episodes.map((episode, index) => (
                  <Reveal key={episode.id} delay={index * 0.05}>
                    <a
                      href={episode.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid gap-4 border-b border-[var(--ploy-border-primary)] py-8 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8"
                    >
                      <span className="font-serif text-3xl text-[var(--ploy-text-tertiary)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="space-y-2">
                        <Heading as="h3" size="card" className="group-hover:text-[var(--ploy-accent-primary)]">
                          {episode.title}
                        </Heading>
                        {(episode.episodeDate || episode.durationLabel) && (
                          <p className="text-sm text-[var(--ploy-text-secondary)]">
                            {[episode.episodeDate, episode.durationLabel].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {episode.description && (
                          <p className="leading-relaxed text-[var(--ploy-text-secondary)]">
                            {episode.description}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight
                        className="size-5 shrink-0 transition-colors group-hover:text-[var(--ploy-accent-primary)]"
                        aria-hidden="true"
                      />
                    </a>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
        <Reveal className="mx-auto max-w-[var(--ploy-canvas-main)] space-y-6">
          <div className="grid gap-6 lg:grid-cols-[0.35fr_1fr] lg:items-end">
            <Heading as="h2" size="section">Keynote recordings</Heading>
            <p className="text-lg leading-relaxed text-[var(--ploy-text-secondary)]">
              Selected keynotes and executive conversations will be published here for
              organisational learning and team development.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-8 md:p-12">
            <p className="ploy-eyebrow">Coming soon</p>
            <p className="mt-4 max-w-2xl text-[var(--ploy-text-secondary)]">
              Curated keynote audio and fireside sessions will appear in this section. For
              speaking invitations, use the booking flow or enquire through the site header.
            </p>
            <Button variant="secondary" href="/meet-akin/speaking" className="mt-6">
              Keynote speaking
            </Button>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
