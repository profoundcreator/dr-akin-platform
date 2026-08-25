"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Reveal } from "@/components/ui/reveal";
import {
  DEFAULT_PORTRAIT_URL,
} from "@/lib/site-settings/constants";
import {
  DEFAULT_SITE_SETTINGS,
  getHomepageAssetUrl,
  getPublicSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings/site-settings";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AU_TITLE, PUBLIC_NAME } from "@/data/person-identity";

export function HeroSection() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getPublicSiteSettings().then(setSettings).catch(() => setSettings(DEFAULT_SITE_SETTINGS));
  }, []);

  const portraitUrl =
    getHomepageAssetUrl(settings.homepagePortraitImagePath) ?? DEFAULT_PORTRAIT_URL;
  const bannerUrl = getHomepageAssetUrl(settings.homepageBannerImagePath);
  const showPortrait = settings.homepageHeroMode === "portrait" && !settings.homepagePortraitHidden;
  const showBanner =
    settings.homepageHeroMode === "banner" && Boolean(bannerUrl) && !settings.homepageBannerHidden;
  const isMinimal = settings.homepageHeroMode === "minimal";

  return (
    <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)]">
      {showBanner && bannerUrl && (
        <Reveal className="relative h-[38vh] min-h-[14rem] max-h-[28rem] w-full overflow-hidden border-b border-[var(--ploy-border-primary)]">
          <OptimizedImage
            src={bannerUrl}
            alt=""
            priority
            className="size-full object-cover"
          />
          <div
            className="absolute right-0 top-0 h-24 w-3 bg-[var(--ploy-accent-primary)]"
            aria-hidden="true"
          />
        </Reveal>
      )}

      <div
        className={
          showPortrait
            ? "mx-auto grid min-h-[calc(100svh-5rem)] max-w-[var(--ploy-canvas-wide)] lg:grid-cols-[1.08fr_0.92fr]"
            : "mx-auto max-w-[var(--ploy-canvas-wide)]"
        }
      >
        <div
          className={
            isMinimal
              ? "px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20"
              : "flex flex-col justify-between px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20"
          }
        >
          <Reveal className="max-w-4xl">
            <p className="ploy-eyebrow mb-8 max-w-2xl">
              {AU_TITLE}
            </p>
            <Heading as="h1" size="display" className="ploy-text-balance">
              Leadership for institutions.
              <span className="block text-[var(--ploy-text-secondary)]">
                Partnership for Africa’s future.
              </span>
            </Heading>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] md:text-xl">
              {PUBLIC_NAME} works across governance, enterprise and education—strengthening
              institutions, developing leaders and building partnerships that advance Africa’s
              long-term transformation.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="primary" showArrow href="/work">
                Explore the ecosystem
              </Button>
              <Button variant="secondary" href="/meet-akin">
                Meet Akin
              </Button>
            </div>
          </Reveal>

          {!isMinimal && (
            <div className="mt-16 flex items-center gap-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--ploy-text-secondary)]">
              <span className="h-px w-16 bg-[var(--ploy-border-primary)]" />
              Governance · Enterprise · Education
            </div>
          )}
        </div>

        {showPortrait && (
          <Reveal
            delay={0.15}
            className="relative min-h-[34rem] overflow-x-hidden border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] lg:min-h-0 lg:border-l lg:border-t-0"
          >
            <OptimizedImage
              src={portraitUrl}
              alt={`${PUBLIC_NAME} seated in a burgundy suit`}
              priority
              width={960}
              height={1200}
              className="absolute inset-0 size-full object-cover object-top"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-xl bg-[var(--ploy-background-primary)]/95 p-5 backdrop-blur-sm md:inset-x-8 md:bottom-8 md:p-7">
              <p className="max-w-lg text-xl font-medium leading-snug tracking-[-0.02em] text-[var(--ploy-text-primary)] md:text-2xl">
                &ldquo;Change doesn&rsquo;t wait for permission; it responds to bold
                leadership.&rdquo;
              </p>
            </div>
            <div
              className="absolute right-0 top-0 h-24 w-3 bg-[var(--ploy-accent-primary)]"
              aria-hidden="true"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
