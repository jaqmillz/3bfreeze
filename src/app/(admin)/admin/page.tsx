import { createServiceClient } from "@/lib/supabase/admin";
import { AdminDashboardClient } from "./admin-client";

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();

  const [
    { count: totalUsers },
    { data: bureauStats },
    { data: breachVisits },
    { data: signupSources },
    { count: weeklySignups },
    { data: breachCodes },
    { data: userSignups },
    { data: breachUsers },
    { data: allBureauStatuses },
  ] = await Promise.all([
    // Total users
    supabase.from("users").select("*", { count: "exact", head: true }),

    // Bureau freeze counts
    supabase
      .from("bureau_status")
      .select("bureau, status"),

    // Breach visits (all)
    supabase
      .from("breach_visits")
      .select("breach_code, source, created_at")
      .order("created_at", { ascending: false }),

    // Signup source breakdown
    supabase
      .from("users")
      .select("signup_source, signup_breach_code"),

    // Signups this week
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),

    // All breach codes for reference
    supabase
      .from("breach_codes")
      .select("code, name, active")
      .order("created_at", { ascending: true }),

    // User signup dates for trend chart
    supabase
      .from("users")
      .select("created_at")
      .order("created_at", { ascending: true }),

    // Users who signed up via breach code (for funnel)
    supabase
      .from("users")
      .select("id, signup_breach_code")
      .not("signup_breach_code", "is", null),

    // All bureau statuses (for funnel progress)
    supabase
      .from("bureau_status")
      .select("user_id, bureau, status"),
  ]);

  // Compute bureau breakdown
  const frozenByBureau = { equifax: 0, transunion: 0, experian: 0 };
  for (const row of bureauStats ?? []) {
    if (row.status === "frozen" && row.bureau in frozenByBureau) {
      frozenByBureau[row.bureau as keyof typeof frozenByBureau]++;
    }
  }
  const totalFrozen = Object.values(frozenByBureau).reduce((a, b) => a + b, 0);

  // Build per-user frozen count map
  const userFrozenCount = new Map<string, number>();
  for (const bs of allBureauStatuses ?? []) {
    if (bs.status === "frozen") {
      userFrozenCount.set(bs.user_id, (userFrozenCount.get(bs.user_id) ?? 0) + 1);
    }
  }

  // Compute breach funnel: visits → signups → froze 1+ → froze all 3
  const breachFunnel: Record<string, {
    visits: number;
    signups: number;
    froze1: number;
    froze2: number;
    frozeAll: number;
    name: string;
    active: boolean;
  }> = {};

  for (const bc of breachCodes ?? []) {
    breachFunnel[bc.code] = { visits: 0, signups: 0, froze1: 0, froze2: 0, frozeAll: 0, name: bc.name, active: bc.active };
  }

  // Count visits
  for (const visit of breachVisits ?? []) {
    if (!breachFunnel[visit.breach_code]) {
      breachFunnel[visit.breach_code] = { visits: 0, signups: 0, froze1: 0, froze2: 0, frozeAll: 0, name: visit.breach_code, active: false };
    }
    breachFunnel[visit.breach_code].visits++;
  }

  // Count signups and freeze progress
  for (const user of breachUsers ?? []) {
    const code = user.signup_breach_code;
    if (!code || !breachFunnel[code]) continue;
    breachFunnel[code].signups++;
    const frozen = userFrozenCount.get(user.id) ?? 0;
    if (frozen >= 1) breachFunnel[code].froze1++;
    if (frozen >= 2) breachFunnel[code].froze2++;
    if (frozen >= 3) breachFunnel[code].frozeAll++;
  }

  // Signup source breakdown
  const sourceBreakdown: Record<string, number> = {};
  for (const user of signupSources ?? []) {
    const src = user.signup_source ?? "unknown";
    sourceBreakdown[src] = (sourceBreakdown[src] ?? 0) + 1;
  }

  // Signup trend: group by day
  const signupTrend: { date: string; signups: number }[] = [];
  const dayMap = new Map<string, number>();
  for (const u of userSignups ?? []) {
    const day = new Date(u.created_at).toISOString().split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  if (dayMap.size > 0) {
    const sortedDays = [...dayMap.keys()].sort();
    const start = new Date(sortedDays[0]);
    const end = new Date(sortedDays[sortedDays.length - 1]);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      signupTrend.push({ date: key, signups: dayMap.get(key) ?? 0 });
    }
  }

  // Visit trend: group by day
  const visitTrend: { date: string; visits: number }[] = [];
  const visitDayMap = new Map<string, number>();
  for (const v of breachVisits ?? []) {
    const day = new Date(v.created_at).toISOString().split("T")[0];
    visitDayMap.set(day, (visitDayMap.get(day) ?? 0) + 1);
  }
  if (visitDayMap.size > 0) {
    const sortedDays = [...visitDayMap.keys()].sort();
    const start = new Date(sortedDays[0]);
    const end = new Date(sortedDays[sortedDays.length - 1]);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      visitTrend.push({ date: key, visits: visitDayMap.get(key) ?? 0 });
    }
  }

  return (
    <AdminDashboardClient
      totalUsers={totalUsers ?? 0}
      totalFrozen={totalFrozen}
      frozenByBureau={frozenByBureau}
      weeklySignups={weeklySignups ?? 0}
      breachFunnel={Object.entries(breachFunnel).map(([code, data]) => ({
        code,
        ...data,
      }))}
      sourceBreakdown={sourceBreakdown}
      breachVisits={(breachVisits ?? []) as { breach_code: string; source: string; created_at: string }[]}
      signupTrend={signupTrend}
      visitTrend={visitTrend}
    />
  );
}
