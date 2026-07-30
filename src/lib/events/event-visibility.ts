import type { PlatformEvent } from "@/lib/events/events";

const PAST_VISIBILITY_MS = 30 * 24 * 60 * 60 * 1000;

export function isEventPubliclyVisible(event: Pick<PlatformEvent, "status" | "manuallyHidden" | "endsAt">): boolean {
  if (event.status !== "published") return false;
  if (event.manuallyHidden) return false;

  const hideAfter = new Date(event.endsAt).getTime() + PAST_VISIBILITY_MS;
  return hideAfter > Date.now();
}

export function isEventUpcoming(event: Pick<PlatformEvent, "startsAt">): boolean {
  return new Date(event.startsAt).getTime() > Date.now();
}
