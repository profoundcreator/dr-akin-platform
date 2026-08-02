"use client";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

export function NotFoundPage() {
  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container">
          <Reveal className="mx-auto max-w-xl space-y-6 text-center">
            <p className="ploy-kicker">404</p>
            <Heading as="h1" size="section">
              Page not found
            </Heading>
            <p className="text-[var(--ploy-text-secondary)]">
              The page you are looking for may have moved or no longer exists.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="primary" href="/">
                Return home
              </Button>
              <Button variant="secondary" href="/book-dr-akin">
                Invite Akin Akinpelu
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
