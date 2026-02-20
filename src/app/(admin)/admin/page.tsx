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
  ]);

  // Compute bureau breakdown
  const frozenByBureau = { equifax: 0, transunion: 0, experian: 0 };
  for (const row of bureauStats ?? []) {
    if (row.status === "frozen" && row.bureau in frozenByBureau) {
      frozenByBureau[row.bureau as keyof typeof frozenByBureau]++;
    }
  }
  const totalFrozen = Object.values(frozenByBureau).reduce((a, b) => a + b, 0);

  // Compute breach analytics
  const breachAnalytics: Record<string, { visits: number; signups: number; name: string; active: boolean }> = {};
  for (const bc of breachCodes ?? []) {
    breachAnalytics[bc.code] = { visits: 0, signups: 0, name: bc.name, active: bc.active };
  }
  for (const visit of breachVisits ?? []) {
    if (!breachAnalytics[visit.breach_code]) {
      breachAnalytics[visit.breach_code] = { visits: 0, signups: 0, name: visit.breach_code, active: false };
    }
    breachAnalytics[visit.breach_code].visits++;
  }
  for (const user of signupSources ?? []) {
    if (user.signup_breach_code && breachAnalytics[user.signup_breach_code]) {
      breachAnalytics[user.signup_breach_code].signups++;
    }
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
  // Fill in missing days for a continuous chart
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
      breachAnalytics={Object.entries(breachAnalytics).map(([code, data]) => ({
        code,
        ...data,
        conversion: data.visits > 0 ? (data.signups / data.visits) * 100 : 0,
      }))}
      sourceBreakdown={sourceBreakdown}
      breachVisits={(breachVisits ?? []) as { breach_code: string; source: string; created_at: string }[]}
      signupTrend={signupTrend}
      visitTrend={visitTrend}
    />
  );
}
