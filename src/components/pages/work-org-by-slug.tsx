"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { PlatformPage } from "@/components/pages/platform-page";
import { workOrgToPageContent } from "@/lib/work-orgs/mappers";
import { getPublicWorkOrgBySlug } from "@/lib/work-orgs/public-orgs";
import { getWorkOrgHeroUrl } from "@/lib/work-orgs/orgs";
import type { PlatformWorkOrg } from "@/lib/work-orgs/types";

interface WorkOrgBySlugProps {
  slug: string;
  initialOrg?: PlatformWorkOrg | null;
}

function applyClientSeo(org: PlatformWorkOrg) {
  document.title = org.pageTitle;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", org.description);
}

export function WorkOrgBySlug({ slug, initialOrg = null }: WorkOrgBySlugProps) {
  const [org, setOrg] = useState<PlatformWorkOrg | null>(initialOrg);
  const [loading, setLoading] = useState(!initialOrg);

  useEffect(() => {
    if (initialOrg) {
      setOrg(initialOrg);
      setLoading(false);
      return;
    }

    getPublicWorkOrgBySlug(slug)
      .then((data) => {
        setOrg(data);
        if (data) applyClientSeo(data);
      })
      .finally(() => setLoading(false));
  }, [slug, initialOrg]);

  if (loading) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading platform…</p>
        </section>
      </PageShell>
    );
  }

  if (!org) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-xl space-y-6">
            <Heading as="h1" size="section">Platform not found</Heading>
            <p className="text-lg text-[var(--ploy-text-secondary)]">
              This platform may have been moved or is not yet published.
            </p>
            <Button variant="secondary" href="/work">Back to work</Button>
          </div>
        </section>
      </PageShell>
    );
  }

  const heroUrl = getWorkOrgHeroUrl(org.heroImagePath) ?? undefined;

  return (
    <PlatformPage
      content={workOrgToPageContent(org)}
      heroImage={heroUrl}
      heroImageAlt={org.headline}
    />
  );
}
