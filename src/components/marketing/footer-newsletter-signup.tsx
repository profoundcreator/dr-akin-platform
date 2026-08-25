"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketingOptInField } from "@/components/marketing/marketing-opt-in-field";
import { subscribeAudienceMember } from "@/lib/marketing/subscribe-audience";
import { syncAudienceToEsp } from "@/lib/marketing/sync-audience-esp";

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!marketingOptIn) {
      setStatus("error");
      setMessage("Please opt in to receive updates.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      await subscribeAudienceMember({
        email,
        name: name.trim() || undefined,
        consentSource: "newsletter",
        engagementContext: { source: "footer" },
      });
      syncAudienceToEsp({ email, name: name.trim() || undefined, consentSource: "newsletter" });
      setStatus("success");
      setMessage("Thank you — you're on the list.");
      setEmail("");
      setName("");
      setMarketingOptIn(false);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again or contact us directly.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        name="name"
        autoComplete="name"
        placeholder="Name (optional)"
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
        id="newsletter-signup"
        checked={marketingOptIn}
        onChange={setMarketingOptIn}
      />
      <Button type="submit" variant="secondary" size="sm" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </Button>
      {message && (
        <p
          className={
            status === "success" ? "text-sm text-green-700" : "text-sm text-red-700"
          }
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
