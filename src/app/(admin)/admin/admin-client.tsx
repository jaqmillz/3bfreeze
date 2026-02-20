"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Snowflake,
  TrendingUp,
  UserPlus,
  Download,
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface BreachAnalyticsRow {
  code: string;
  name: string;
  visits: number;
  signups: number;
  conversion: number;
  active: boolean;
}

interface Props {
  totalUsers: number;
  totalFrozen: number;
  frozenByBureau: { equifax: number; transunion: number; experian: number };
  weeklySignups: number;
  breachAnalytics: BreachAnalyticsRow[];
  sourceBreakdown: Record<string, number>;
  breachVisits: { breach_code: string; source: string; created_at: string }[];
  signupTrend: { date: string; signups: number }[];
  visitTrend: { date: string; visits: number }[];
}

const CHART_COLORS = [
  "oklch(0.445 0.059 241.9)", // primary
  "oklch(0.849 0.083 240.9)", // accent
  "oklch(0.6 0.15 250)",
  "oklch(0.7 0.12 200)",
  "oklch(0.55 0.1 280)",
];

const BUREAU_COLORS: Record<string, string> = {
  equifax: "oklch(0.445 0.059 241.9)",
  transunion: "oklch(0.6 0.15 250)",
  experian: "oklch(0.849 0.083 240.9)",
};

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function formatShortDate(dateString: string) {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ChartTooltipContent({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  valueLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium">{label}</p>
      <p className="text-sm font-bold">
        {payload[0].value} {valueLabel}
      </p>
    </div>
  );
}

export function AdminDashboardClient({
  totalUsers,
  totalFrozen,
  frozenByBureau,
  weeklySignups,
  breachAnalytics,
  sourceBreakdown,
  breachVisits,
  signupTrend,
  visitTrend,
}: Props) {
  const [dateRange, setDateRange] = useState<string>("all");

  const filteredVisits = useMemo(() => {
    if (dateRange === "all") return breachVisits;
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return breachVisits.filter((v) => v.created_at >= cutoff);
  }, [breachVisits, dateRange]);

  const filteredAnalytics = useMemo(() => {
    if (dateRange === "all") return breachAnalytics;
    const visitCounts: Record<string, number> = {};
    for (const v of filteredVisits) {
      visitCounts[v.breach_code] = (visitCounts[v.breach_code] ?? 0) + 1;
    }
    return breachAnalytics.map((row) => ({
      ...row,
      visits: visitCounts[row.code] ?? 0,
      conversion:
        (visitCounts[row.code] ?? 0) > 0
          ? (row.signups / (visitCounts[row.code] ?? 1)) * 100
          : 0,
    }));
  }, [breachAnalytics, filteredVisits, dateRange]);

  // Bureau donut data
  const bureauDonutData = (["equifax", "transunion", "experian"] as const).map(
    (bureau) => ({
      name: bureau.charAt(0).toUpperCase() + bureau.slice(1),
      value: frozenByBureau[bureau],
      color: BUREAU_COLORS[bureau],
    })
  );

  // Source bar data
  const sourceBarData = Object.entries(sourceBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([source, count]) => ({
      name: source === "unknown" ? "Direct" : source,
      value: count,
    }));

  // Breach visits bar chart data
  const breachBarData = filteredAnalytics.map((row) => ({
    name: row.code,
    visits: row.visits,
    signups: row.signups,
  }));

  function exportCSV() {
    const headers = ["Code", "Name", "Visits", "Signups", "Conversion %", "Active"];
    const rows = filteredAnalytics.map((r) => [
      r.code,
      r.name,
      r.visits,
      r.signups,
      r.conversion.toFixed(1),
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
        <p className="text-xs text-muted-foreground">
          Aggregate stats across all users
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} icon={Users} />
        <StatCard
          label="Total Freezes"
          value={totalFrozen}
          icon={Snowflake}
          sub={`${freezeRate}% coverage`}
        />
        <StatCard
          label="Freeze Rate"
          value={`${freezeRate}%`}
          icon={TrendingUp}
          sub={`${totalFrozen} of ${totalUsers * 3} possible`}
        />
        <StatCard
          label="Signups (7 days)"
          value={weeklySignups}
          icon={UserPlus}
        />
      </div>

      {/* Charts row: Signup Trend + Bureau Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signup trend area chart */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">Signup Trend</h2>
          {signupTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={signupTrend}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.445 0.059 241.9)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.445 0.059 241.9)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 241)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as { value: number }[]}
                      label={label ? formatShortDate(label as string) : ""}
                      valueLabel="signups"
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="oklch(0.445 0.059 241.9)"
                  strokeWidth={2}
                  fill="url(#signupGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center">
              <p className="text-xs text-muted-foreground">No signup data yet</p>
            </div>
          )}
        </div>

        {/* Bureau freeze donut */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">Bureau Breakdown</h2>
          {totalFrozen > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={bureauDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {bureauDonutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0];
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-sm font-bold">{item.value} frozen</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center">
              <p className="text-xs text-muted-foreground">No freeze data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts row: Visit Trend + Signup Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visit trend area chart */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">Breach Page Visits</h2>
          {visitTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={visitTrend}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.849 0.083 240.9)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.849 0.083 240.9)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 241)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as { value: number }[]}
                      label={label ? formatShortDate(label as string) : ""}
                      valueLabel="visits"
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="oklch(0.849 0.083 240.9)"
                  strokeWidth={2}
                  fill="url(#visitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center">
              <p className="text-xs text-muted-foreground">No visit data yet</p>
            </div>
          )}
        </div>

        {/* Signup sources bar chart */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">Signup Sources</h2>
          {sourceBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sourceBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 241)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload as { value: number }[]}
                      label={label as string}
                      valueLabel="signups"
                    />
                  )}
                />
                <Bar dataKey="value" fill="oklch(0.445 0.059 241.9)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center">
              <p className="text-xs text-muted-foreground">No signup data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Breach performance bar chart */}
      {breachBarData.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">Breach Code Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={breachBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 241)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.5 0.03 242)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
                      <p className="text-xs font-medium mb-1">{label}</p>
                      {payload.map((entry, i) => (
                        <p key={i} className="text-xs">
                          <span className="font-medium capitalize">{entry.name}:</span>{" "}
                          {entry.value}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground capitalize">{value}</span>
                )}
              />
              <Bar dataKey="visits" fill="oklch(0.445 0.059 241.9)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="signups" fill="oklch(0.849 0.083 240.9)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breach analytics table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Breach Analytics</h2>
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
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Visits</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Signups</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Conversion</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No breach data yet
                  </td>
                </tr>
              ) : (
                filteredAnalytics.map((row) => (
                  <tr key={row.code} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs font-medium">{row.code}</td>
                    <td className="px-4 py-2.5 text-xs">{row.name}</td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums">{row.visits.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums">{row.signups.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums">{row.conversion.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge
                        variant={row.active ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {row.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
