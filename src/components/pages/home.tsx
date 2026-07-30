"use client";

import { PageShell } from "@/components/layout/page-shell";
import { HeroSection } from "@/components/sections/hero-section";
import { CorporateTransformationSection } from "@/components/sections/corporate-transformation-section";
import { AaldSection } from "@/components/sections/aald-section";
import { EventsFeaturedSection } from "@/components/sections/events-featured-section";
import { LibraryFeaturedSection } from "@/components/sections/library-featured-section";

export function HomePage() {
  return (
    <PageShell>
      <HeroSection />
      <CorporateTransformationSection />
      <AaldSection />
      <EventsFeaturedSection />
      <LibraryFeaturedSection />
    </PageShell>
  );
}
