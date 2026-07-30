"use client";

import { useEffect, useState } from "react";

interface EventCountdownProps {
  targetDate: string;
  className?: string;
}

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
}

function getCountdown(targetDate: string): CountdownParts {
  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, finished: false };
}

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-4 py-3 text-center">
      <p className="font-serif text-3xl font-semibold tabular-nums text-[var(--ploy-text-primary)] md:text-4xl">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--ploy-text-tertiary)]">
        {label}
      </p>
    </div>
  );
}

export function EventCountdown({ targetDate, className }: EventCountdownProps) {
  const [parts, setParts] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setParts(getCountdown(targetDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  if (parts.finished) {
    return (
      <p className={className ?? "text-sm font-medium text-[var(--ploy-text-secondary)]"}>
        This event has started.
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="ploy-eyebrow mb-4">Countdown</p>
      <div className="grid grid-cols-4 gap-3 max-w-md">
        <CountdownUnit label="Days" value={parts.days} />
        <CountdownUnit label="Hours" value={parts.hours} />
        <CountdownUnit label="Mins" value={parts.minutes} />
        <CountdownUnit label="Secs" value={parts.seconds} />
      </div>
    </div>
  );
}
