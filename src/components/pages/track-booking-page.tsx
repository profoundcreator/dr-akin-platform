"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { getStoredAccessToken } from "@/lib/booking/api";

export function TrackBookingPage() {
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const normalized = reference.trim().toUpperCase();
    if (!/^DAA-\d{4}$/.test(normalized)) {
      setError("Enter a valid reference like DAA-8492 (from your confirmation email).");
      return;
    }

    const token = getStoredAccessToken(normalized);
    const url = token
      ? `/booking/${normalized}?token=${encodeURIComponent(token)}`
      : `/booking/${normalized}`;

    window.location.href = url;
  }

  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container max-w-lg">
          <Reveal className="space-y-8">
            <div className="space-y-2 text-center">
              <p className="ploy-kicker">Organizer portal</p>
              <Heading as="h1" size="section">
                Track your booking
              </Heading>
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                Enter the reference code from your confirmation email to view status updates.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-[var(--ploy-radius-xl)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] p-8 shadow-[var(--ploy-shadow-sm)]"
            >
              <div className="space-y-2">
                <Label htmlFor="booking-reference" required>
                  Booking reference
                </Label>
                <Input
                  id="booking-reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="DAA-8492"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {error && (
                <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-3 py-2 text-sm text-[var(--ploy-status-error)]">
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full" showArrow>
                <Search className="size-4" />
                View status
              </Button>
            </form>

            <p className="text-center text-sm text-[var(--ploy-text-tertiary)]">
              Don&apos;t have a reference yet?{" "}
              <a href="/book-dr-akin" className="font-medium text-[var(--ploy-text-link)] hover:underline">
                Submit an engagement invitation
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
