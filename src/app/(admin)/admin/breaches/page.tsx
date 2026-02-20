import { createServiceClient } from "@/lib/supabase/admin";
import { BreachesClient } from "./breaches-client";
import type { BreachCode } from "@/lib/types";

export default async function BreachesPage() {
  const supabase = createServiceClient();

  // Service role bypasses RLS, so we see all codes (including inactive)
  const { data: breachCodes } = await supabase
    .from("breach_codes")
    .select("*")
    .order("created_at", { ascending: false });

  // Get visit + signup counts per code
  const { data: visits } = await supabase
    .from("breach_visits")
    .select("breach_code");

  const { data: users } = await supabase
    .from("users")
    .select("signup_breach_code")
    .not("signup_breach_code", "is", null);

  const visitCounts: Record<string, number> = {};
  for (const v of visits ?? []) {
    visitCounts[v.breach_code] = (visitCounts[v.breach_code] ?? 0) + 1;
  }

  const signupCounts: Record<string, number> = {};
  for (const u of users ?? []) {
    if (u.signup_breach_code) {
      signupCounts[u.signup_breach_code] = (signupCounts[u.signup_breach_code] ?? 0) + 1;
    }
  }

  const codesWithStats = ((breachCodes ?? []) as BreachCode[]).map((bc) => ({
    ...bc,
    visits: visitCounts[bc.code] ?? 0,
    signups: signupCounts[bc.code] ?? 0,
  }));

  return <BreachesClient breachCodes={codesWithStats} />;
}
