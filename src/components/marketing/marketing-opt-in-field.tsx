"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface MarketingOptInFieldProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function MarketingOptInField({ id, checked, onChange }: MarketingOptInFieldProps) {
  return (
    <Checkbox
      id={id}
      name={`${id}-marketing-opt-in`}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      label={
        <>
          I would like to receive updates on insights, events, summit announcements, and partner
          news. See our{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
            privacy notice
          </a>{" "}
          for how we use this information.
        </>
      }
    />
  );
}
