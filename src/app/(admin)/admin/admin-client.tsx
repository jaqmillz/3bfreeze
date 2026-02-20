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
}

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

export function AdminDashboardClient({
  totalUsers,
  totalFrozen,
  frozenByBureau,
  weeklySignups,
  breachAnalytics,
  sourceBreakdown,
  breachVisits,
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
    // Recompute visits for filtered range
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

      {/* Bureau breakdown */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Bureau Breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["equifax", "transunion", "experian"] as const).map((bureau) => (
            <div key={bureau} className="rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground capitalize">
                {bureau}
              </p>
              <p className="mt-1 text-xl font-bold">
                {frozenByBureau[bureau]}
              </p>
              <p className="text-xs text-muted-foreground">frozen</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signup sources */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Signup Sources</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(sourceBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([source, count]) => (
              <div key={source} className="rounded-lg border px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {source === "unknown" ? "No attribution" : source}
                </p>
                <p className="mt-1 text-lg font-bold">{count}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Breach analytics */}
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
