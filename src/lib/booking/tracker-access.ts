/** How organizer booking lookup should behave (pure logic for tests and API). */
export type BookingLookupStrategy = "remote" | "local_demo" | "unavailable";

export function getBookingLookupStrategy(
  supabaseConfigured: boolean,
  hasToken: boolean,
): BookingLookupStrategy {
  if (supabaseConfigured) {
    return hasToken ? "remote" : "unavailable";
  }
  return "local_demo";
}
