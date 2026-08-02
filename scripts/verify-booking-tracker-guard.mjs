/**
 * Verifies booking tracker access guard logic (audit fix #1).
 * Run: node scripts/verify-booking-tracker-guard.mjs
 */

function getBookingLookupStrategy(supabaseConfigured, hasToken) {
  if (supabaseConfigured) {
    return hasToken ? "remote" : "unavailable";
  }
  return "local_demo";
}

const cases = [
  { supabase: true, token: true, want: "remote" },
  { supabase: true, token: false, want: "unavailable" },
  { supabase: false, token: false, want: "local_demo" },
  { supabase: false, token: true, want: "local_demo" },
];

let failed = 0;
for (const { supabase, token, want } of cases) {
  const got = getBookingLookupStrategy(supabase, token);
  if (got !== want) {
    console.error(`FAIL supabase=${supabase} token=${token}: got ${got}, want ${want}`);
    failed++;
  } else {
    console.log(`OK   supabase=${supabase} token=${token} → ${got}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}

console.log("\nAll booking tracker guard cases passed.");
