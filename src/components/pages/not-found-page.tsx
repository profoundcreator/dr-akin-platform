"use client";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { PERSON_IDENTITY } from "@/data/person-identity";

export function NotFoundPage() {
  return (
    <PageShell>
      <section className="ploy-section border-b border-[var(--ploy-border-primary)]">
        <div className="ploy-container">
          <Reveal className="mx-auto max-w-2xl space-y-8 text-center">
            <div className="space-y-3">
              <p className="ploy-kicker">
                {PERSON_IDENTITY.pillars.join(" · ")}
              </p>
              <p className="text-sm font-medium tracking-wide text-[var(--ploy-status-warning)]">
                404 · Page not found
              </p>
            </div>

            <div className="space-y-4">
              <Heading as="h1" size="section">
                This destination is not on the map.
              </Heading>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-[var(--ploy-text-secondary)]">
                The address you entered may have moved, been retired, or never
                existed in this chapter of the platform. The work continues
                across governance, enterprise, and education — elsewhere on this
                site.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="primary" href="/">
                Return home
              </Button>
              <Button variant="secondary" href="/work">
                Explore the ecosystem
              </Button>
              <Button variant="ghost" href="/contact">
                Contact the office
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] py-14">
        <div className="ploy-container">
          <Reveal delay={0.1} className="mx-auto max-w-xl space-y-4 text-center">
            <p className="ploy-kicker">Where to next</p>
            <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
              If you followed a link from an older site or document, try the{" "}
              <a href="/work" className="font-medium text-[var(--ploy-text-link)] hover:underline">
                Work hub
              </a>
              ,{" "}
              <a href="/meet-akin/profile" className="font-medium text-[var(--ploy-text-link)] hover:underline">
                Meet Akin
              </a>
              , or{" "}
              <a href="/book-dr-akin" className="font-medium text-[var(--ploy-text-link)] hover:underline">
                submit an invitation
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
