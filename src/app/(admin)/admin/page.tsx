import { createServiceClient } from "@/lib/supabase/admin";
import { AdminDashboardClient } from "./admin-client";

function getSevenDaysAgo() {
  return new Date(Date.now() - 7 * 86_400_000).toISOString();
}

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();
  const sevenDaysAgo = getSevenDaysAgo();

  const [
    { count: totalUsers },
    { data: bureauFreezes },
    { data: funnel },
    { data: sources },
    { count: weeklySignups },
    { data: signupDays },
    { data: visitDays },
    { data: freezeStats },
    { data: breachVisits },
    { count: directSignupCount },
  ] = await Promise.all([
    // Scalar counts (already efficient)
    supabase.from("users").select("*", { count: "exact", head: true }),

    // SQL aggregation RPCs — all heavy lifting in PostgreSQL
    supabase.rpc("admin_bureau_freeze_counts"),
    supabase.rpc("admin_breach_funnel"),
    supabase.rpc("admin_signup_source_breakdown"),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase.rpc("admin_signup_trend"),
    supabase.rpc("admin_visit_trend"),
    supabase.rpc("admin_overall_freeze_stats"),

    // Raw visits for client-side date range filtering
    supabase
      .from("breach_visits")
      .select("breach_code, source, created_at")
      .order("created_at", { ascending: false }),

    // Direct signups count (users without breach code)
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .is("signup_breach_code", null),
  ]);

  // Transform bureau freeze counts
  const frozenByBureau = { equifax: 0, transunion: 0, experian: 0 };
  for (const row of (bureauFreezes ?? []) as { bureau: string; frozen_count: number }[]) {
    if (row.bureau in frozenByBureau) {
      frozenByBureau[row.bureau as keyof typeof frozenByBureau] = Number(row.frozen_count);
    }
  }
  const totalFrozen = Object.values(frozenByBureau).reduce((a, b) => a + b, 0);

  // Transform source breakdown
  const sourceBreakdown: Record<string, number> = {};
  for (const row of (sources ?? []) as { source: string; user_count: number }[]) {
    sourceBreakdown[row.source] = Number(row.user_count);
  }

  // Transform trends
  const signupTrend = ((signupDays ?? []) as { day: string; signups: number }[]).map((r) => ({
    date: String(r.day),
    signups: Number(r.signups),
  }));
  const visitTrend = ((visitDays ?? []) as { day: string; visits: number }[]).map((r) => ({
    date: String(r.day),
    visits: Number(r.visits),
  }));

  // Transform breach funnel
  const breachFunnel = ((funnel ?? []) as {
    code: string;
    name: string;
    active: boolean;
    visits: number;
    signups: number;
    froze1: number;
    froze2: number;
    froze_all: number;
  }[]).map((r) => ({
    code: r.code,
    name: r.name,
    active: r.active,
    visits: Number(r.visits),
    signups: Number(r.signups),
    froze1: Number(r.froze1),
    froze2: Number(r.froze2),
    frozeAll: Number(r.froze_all),
  }));

  // Transform overall + direct freeze stats
  const statsRows = (freezeStats ?? []) as {
    category: string;
    froze1: number;
    froze2: number;
    froze_all: number;
    session_count: number;
  }[];
  const allRow = statsRows.find((r) => r.category === "all");
  const directRow = statsRows.find((r) => r.category === "direct");

  const overallStats = {
    signups: totalUsers ?? 0,
    froze1: Number(allRow?.froze1 ?? 0),
    froze2: Number(allRow?.froze2 ?? 0),
    frozeAll: Number(allRow?.froze_all ?? 0),
  };

  const directStats = {
    signups: Math.max(Number(directRow?.session_count ?? 0), directSignupCount ?? 0),
    froze1: Number(directRow?.froze1 ?? 0),
    froze2: Number(directRow?.froze2 ?? 0),
    frozeAll: Number(directRow?.froze_all ?? 0),
  };

  return (
    <AdminDashboardClient
      totalUsers={totalUsers ?? 0}
      totalFrozen={totalFrozen}
      frozenByBureau={frozenByBureau}
      weeklySignups={weeklySignups ?? 0}
      breachFunnel={breachFunnel}
      sourceBreakdown={sourceBreakdown}
      breachVisits={(breachVisits ?? []) as { breach_code: string; source: string; created_at: string }[]}
      signupTrend={signupTrend}
      visitTrend={visitTrend}
      overallStats={overallStats}
      directStats={directStats}
    />
  );
}
