"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Snowflake,
  TrendingUp,
  UserPlus,
  Download,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart } from "recharts";

// -- Chart configs --

const signupChartConfig = {
  signups: { label: "Signups", color: "oklch(0.445 0.059 241.9)" },
} satisfies ChartConfig;

const visitChartConfig = {
  visits: { label: "Visits", color: "oklch(0.849 0.083 240.9)" },
} satisfies ChartConfig;

const bureauChartConfig = {
  equifax: { label: "Equifax", color: "oklch(0.445 0.059 241.9)" },
  transunion: { label: "TransUnion", color: "oklch(0.6 0.15 250)" },
  experian: { label: "Experian", color: "oklch(0.849 0.083 240.9)" },
} satisfies ChartConfig;

const sourceChartConfig = {
  value: { label: "Signups", color: "oklch(0.445 0.059 241.9)" },
} satisfies ChartConfig;

// -- Types --

interface BreachFunnelRow {
  code: string;
  name: string;
  visits: number;
  signups: number;
  froze1: number;
  froze2: number;
  frozeAll: number;
  active: boolean;
}

interface FreezeStats {
  signups: number;
  froze1: number;
  froze2: number;
  frozeAll: number;
}

interface Props {
  totalUsers: number;
  totalFrozen: number;
  frozenByBureau: { equifax: number; transunion: number; experian: number };
  weeklySignups: number;
  breachFunnel: BreachFunnelRow[];
  sourceBreakdown: Record<string, number>;
  breachVisits: { breach_code: string; source: string; created_at: string }[];
  signupTrend: { date: string; signups: number }[];
  visitTrend: { date: string; visits: number }[];
  overallStats: FreezeStats;
  directStats: FreezeStats;
}

// -- Helpers --

function formatShortDate(dateString: string) {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildTrailingDays(
  dataMap: Map<string, number>,
  days: number,
  key: string
) {
  const result: Record<string, string | number>[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    result.push({ date: dateKey, [key]: dataMap.get(dateKey) ?? 0 });
  }
  return result;
}

function ProgressBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-right text-xs text-muted-foreground shrink-0">
        {label}
      </span>
      <div className="flex-1 h-7 rounded-md bg-muted/50 relative overflow-hidden">
        <div
          className="h-full rounded-md transition-all duration-500"
          style={{
            width: `${Math.max(pct, value > 0 ? 3 : 0)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="w-20 text-right shrink-0">
        <span className="text-xs font-medium tabular-nums">{value}</span>
        {max > 0 && value > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            ({pct.toFixed(0)}%)
          </span>
        )}
      </div>
    </div>
  );
}

// -- Main --

export function AdminDashboardClient({
  totalUsers,
  totalFrozen,
  frozenByBureau,
  weeklySignups,
  breachFunnel,
  sourceBreakdown,
  breachVisits,
  signupTrend,
  visitTrend,
  overallStats,
  directStats,
}: Props) {
  const [dateRange, setDateRange] = useState("all");
  const [trendRange, setTrendRange] = useState("14d");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const signupMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of signupTrend) m.set(d.date, d.signups);
    return m;
  }, [signupTrend]);

  const visitMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of visitTrend) m.set(d.date, d.visits);
    return m;
  }, [visitTrend]);

  const trendDays =
    trendRange === "7d" ? 7 : trendRange === "14d" ? 14 : trendRange === "30d" ? 30 : 90;

  const signupTrendData = useMemo(
    () => buildTrailingDays(signupMap, trendDays, "signups"),
    [signupMap, trendDays]
  );

  const visitTrendData = useMemo(
    () => buildTrailingDays(visitMap, trendDays, "visits"),
    [visitMap, trendDays]
  );

  const filteredVisits = useMemo(() => {
    if (dateRange === "all") return breachVisits;
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return breachVisits.filter((v) => v.created_at >= cutoff);
  }, [breachVisits, dateRange]);

  const filteredFunnel = useMemo(() => {
    if (dateRange === "all") return breachFunnel;
    const visitCounts: Record<string, number> = {};
    for (const v of filteredVisits) {
      visitCounts[v.breach_code] = (visitCounts[v.breach_code] ?? 0) + 1;
    }
    return breachFunnel.map((row) => ({
      ...row,
      visits: visitCounts[row.code] ?? 0,
    }));
  }, [breachFunnel, filteredVisits, dateRange]);

  const funnelTotals = useMemo(
    () =>
      filteredFunnel.reduce(
        (acc, row) => ({
          visits: acc.visits + row.visits,
          signups: acc.signups + row.signups,
          froze1: acc.froze1 + row.froze1,
          frozeAll: acc.frozeAll + row.frozeAll,
        }),
        { visits: 0, signups: 0, froze1: 0, frozeAll: 0 }
      ),
    [filteredFunnel]
  );

  const bureauDonutData = [
    { name: "equifax", value: frozenByBureau.equifax, fill: "var(--color-equifax)" },
    { name: "transunion", value: frozenByBureau.transunion, fill: "var(--color-transunion)" },
    { name: "experian", value: frozenByBureau.experian, fill: "var(--color-experian)" },
  ];

  const sourceBarData = Object.entries(sourceBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([source, count]) => ({
      name: source === "unknown" ? "Direct" : source,
      value: count,
    }));

  function exportCSV() {
    const headers = ["Code", "Name", "Visits", "Froze 1+", "All 3 Frozen", "Signups", "Conversion %", "Active"];
    const rows = filteredFunnel.map((r) => [
      r.code, r.name, r.visits, r.froze1, r.frozeAll, r.signups,
      r.visits > 0 ? ((r.signups / r.visits) * 100).toFixed(1) : "0",
      r.active ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `3bfreeze-breach-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const freezeRate = totalUsers > 0 ? ((totalFrozen / (totalUsers * 3)) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Aggregate stats across all users</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: totalUsers, icon: Users },
          { label: "Total Freezes", value: totalFrozen, icon: Snowflake, sub: `${freezeRate}% coverage` },
          { label: "Freeze Rate", value: `${freezeRate}%`, icon: TrendingUp, sub: `${totalFrozen} of ${totalUsers * 3} possible` },
          { label: "Signups (7d)", value: weeklySignups, icon: UserPlus },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Trends */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Activity Trends</h2>
          <Select value={trendRange} onValueChange={setTrendRange}>
            <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">Signups</h3>
            <ChartContainer config={signupChartConfig} className="h-[200px] w-full">
              <AreaChart data={signupTrendData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={trendDays <= 14 ? 1 : trendDays <= 30 ? 3 : 7}
                />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip
                  content={<ChartTooltipContent labelFormatter={(v) => formatShortDate(v as string)} />}
                />
                <defs>
                  <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-signups)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-signups)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area dataKey="signups" type="monotone" fill="url(#fillSignups)" stroke="var(--color-signups)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">Breach Page Visits</h3>
            <ChartContainer config={visitChartConfig} className="h-[200px] w-full">
              <AreaChart data={visitTrendData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={trendDays <= 14 ? 1 : trendDays <= 30 ? 3 : 7}
                />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip
                  content={<ChartTooltipContent labelFormatter={(v) => formatShortDate(v as string)} />}
                />
                <defs>
                  <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area dataKey="visits" type="monotone" fill="url(#fillVisits)" stroke="var(--color-visits)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* Bureau breakdown + Signup sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">Bureau Breakdown</h2>
          {totalFrozen > 0 ? (
            <ChartContainer config={bureauChartConfig} className="mx-auto aspect-square max-h-[200px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={bureauDonutData} dataKey="value" nameKey="name" innerRadius={50} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-xs text-muted-foreground">No freeze data yet</p>
            </div>
          )}
        </div>

        {sourceBarData.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold mb-4">Signup Sources</h2>
            <ChartContainer config={sourceChartConfig} className="w-full" style={{ height: Math.max(100, sourceBarData.length * 40) }}>
              <BarChart data={sourceBarData} layout="vertical" accessibilityLayer>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>

      {/* Funnels: breach + overall */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">Breach Funnel</h2>
          <div className="space-y-3">
            <ProgressBar label="Page Visits" value={funnelTotals.visits} max={funnelTotals.visits} color="oklch(0.445 0.059 241.9)" />
            <ProgressBar label="Froze 1+" value={funnelTotals.froze1} max={funnelTotals.visits} color="oklch(0.55 0.07 241)" />
            <ProgressBar label="All 3 Frozen" value={funnelTotals.frozeAll} max={funnelTotals.visits} color="oklch(0.7 0.09 240)" />
            <ProgressBar label="Signed Up" value={funnelTotals.signups} max={funnelTotals.visits} color="oklch(0.849 0.083 240.9)" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">All Freeze Sessions</h2>
          {(() => {
            const maxVal = Math.max(overallStats.froze1, overallStats.signups, 1);
            return (
              <div className="space-y-3">
                <ProgressBar label="Froze 1+" value={overallStats.froze1} max={maxVal} color="oklch(0.445 0.059 241.9)" />
                <ProgressBar label="All 3 Frozen" value={overallStats.frozeAll} max={maxVal} color="oklch(0.55 0.07 241)" />
                <ProgressBar label="Signed Up" value={overallStats.signups} max={maxVal} color="oklch(0.7 0.09 240)" />
                <ProgressBar label="Direct" value={directStats.froze1} max={maxVal} color="oklch(0.849 0.083 240.9)" />
              </div>
            );
          })()}
          <p className="text-[10px] text-muted-foreground mt-3">Includes anonymous users who froze without signing up. Direct = no breach code.</p>
        </div>
      </div>

      {/* Breach performance table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Breach Code Performance</h2>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8" />
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Visits</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Froze 1+</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">All 3</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Signups</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Conversion</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunnel.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No breach data yet
                  </td>
                </tr>
              ) : (
                filteredFunnel.map((row) => {
                  const conversion = row.visits > 0 ? ((row.signups / row.visits) * 100).toFixed(1) : "0.0";
                  const isExpanded = expandedCode === row.code;
                  return (
                    <tr key={row.code}>
                      <td colSpan={9} className="p-0">
                        <button
                          onClick={() => setExpandedCode(isExpanded ? null : row.code)}
                          className="w-full text-left hover:bg-muted/30 transition-colors border-b"
                        >
                          <div className="flex items-center">
                            <div className="w-8 flex items-center justify-center">
                              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                            <div className="flex-1 px-4 py-2.5 font-mono text-xs font-medium">{row.code}</div>
                            <div className="flex-1 px-4 py-2.5 text-xs">{row.name}</div>
                            <div className="px-4 py-2.5 text-right text-xs tabular-nums w-16">{row.visits.toLocaleString()}</div>
                            <div className="px-4 py-2.5 text-right text-xs tabular-nums w-16">{row.froze1.toLocaleString()}</div>
                            <div className="px-4 py-2.5 text-right text-xs tabular-nums w-14">{row.frozeAll.toLocaleString()}</div>
                            <div className="px-4 py-2.5 text-right text-xs tabular-nums w-16">{row.signups.toLocaleString()}</div>
                            <div className="px-4 py-2.5 text-right text-xs tabular-nums w-20 font-medium">{conversion}%</div>
                            <div className="px-4 py-2.5 text-center w-20">
                              <Badge variant={row.active ? "default" : "secondary"} className="text-[10px]">
                                {row.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-4 py-4 bg-muted/20 border-b">
                            <p className="text-xs font-medium text-muted-foreground mb-3">Funnel: {row.code}</p>
                            <div className="space-y-2 max-w-lg">
                              <ProgressBar label="Visits" value={row.visits} max={row.visits} color="oklch(0.445 0.059 241.9)" />
                              <ProgressBar label="Froze 1+" value={row.froze1} max={row.visits} color="oklch(0.55 0.07 241)" />
                              <ProgressBar label="All 3 Frozen" value={row.frozeAll} max={row.visits} color="oklch(0.7 0.09 240)" />
                              <ProgressBar label="Signed Up" value={row.signups} max={row.visits} color="oklch(0.849 0.083 240.9)" />
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
