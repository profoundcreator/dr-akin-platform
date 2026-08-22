"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketingOptInField } from "@/components/marketing/marketing-opt-in-field";
import { subscribeAudienceMember } from "@/lib/marketing/subscribe-audience";
import { syncAudienceToEsp } from "@/lib/marketing/sync-audience-esp";

interface SummitInterestFormProps {
  eventSlug: string;
  eventTitle: string;
}

export function SummitInterestForm({ eventSlug, eventTitle }: SummitInterestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!marketingOptIn) {
      setStatus("error");
      setMessage("Please opt in to receive summit updates.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      await subscribeAudienceMember({
        email,
        name: name.trim() || undefined,
        consentSource: "summit_interest",
        engagementContext: { eventSlug, eventTitle },
      });
      syncAudienceToEsp({
        email,
        name: name.trim() || undefined,
        consentSource: "summit_interest",
        engagementContext: { eventSlug, eventTitle },
      });
      setStatus("success");
      setMessage("Thank you — we'll keep you posted on PerformX Summit 2026.");
      setName("");
      setEmail("");
      setMarketingOptIn(false);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again or contact us.");
    }
  }

  return (
    <section className="border-t border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-6 py-16 md:px-10 md:py-20 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-xl">
        <p className="ploy-eyebrow">Register interest</p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          Stay informed about {eventTitle}
        </h2>
        <p className="mt-3 text-[var(--ploy-text-secondary)]">
          Receive announcements about dates, speakers, and registration — no spam, unsubscribe anytime.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <MarketingOptInField
            id="summit-interest"
            checked={marketingOptIn}
            onChange={setMarketingOptIn}
          />
          <Button type="submit" variant="primary" disabled={status === "loading"}>
            {status === "loading" ? "Submitting…" : "Register interest"}
          </Button>
          {message && (
            <p
              className={status === "success" ? "text-sm text-green-700" : "text-sm text-red-700"}
              role="status"
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
