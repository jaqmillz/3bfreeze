"use client";

import { useState } from "react";
import { BUREAU_INFO, type Bureau, type IssueType } from "@/lib/types";

const ISSUE_LABELS: Record<IssueType, string> = {
  account_access: "Can't log in",
  identity_verification: "ID verification failed",
  site_error: "Site error",
  asked_to_pay: "Asked to pay",
  confused: "Confused / stuck",
  other: "Other",
};

interface Issue {
  id: string;
  bureau: Bureau;
  issue_type: IssueType;
  issue_details: string | null;
  source: string | null;
  created_at: string;
  email: string | null;
}

interface Props {
  issues: Issue[];
}

type FilterBureau = "all" | Bureau;
type FilterType = "all" | IssueType;

function formatFlow(source: string | null): string {
  if (!source) return "—";
  if (source === "direct") return "Direct";
  if (source === "authenticated") return "Authenticated";
  if (source.startsWith("breach:")) return `Breach: ${source.replace("breach:", "")}`;
  return source;
}

export function IssuesClient({ issues }: Props) {
  const [bureauFilter, setBureauFilter] = useState<FilterBureau>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const filtered = issues.filter((i) => {
    if (bureauFilter !== "all" && i.bureau !== bureauFilter) return false;
    if (typeFilter !== "all" && i.issue_type !== typeFilter) return false;
    return true;
  });

  // Counts for summary cards
  const byType: Partial<Record<IssueType, number>> = {};
  for (const i of issues) {
    byType[i.issue_type] = (byType[i.issue_type] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold">Freeze Issues</h1>
        <p className="text-xs text-muted-foreground">
          Issues reported during the freeze workflow ({issues.length} total)
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {(Object.entries(ISSUE_LABELS) as [IssueType, string][]).map(([type, label]) => (
          <button
            key={type}
            aria-pressed={typeFilter === type}
            onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
            className={`rounded-lg border px-3 py-2 text-left transition-colors ${
              typeFilter === type ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <div className="text-lg font-bold tabular-nums">{byType[type] ?? 0}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label htmlFor="bureau-filter" className="text-xs text-muted-foreground">Bureau:</label>
          <select
            id="bureau-filter"
            value={bureauFilter}
            onChange={(e) => setBureauFilter(e.target.value as FilterBureau)}
            className="rounded border bg-background px-2 py-1 text-xs"
          >
            <option value="all">All</option>
            <option value="equifax">Equifax</option>
            <option value="transunion">TransUnion</option>
            <option value="experian">Experian</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label htmlFor="type-filter" className="text-xs text-muted-foreground">Type:</label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterType)}
            className="rounded border bg-background px-2 py-1 text-xs"
          >
            <option value="all">All</option>
            {(Object.entries(ISSUE_LABELS) as [IssueType, string][]).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} {filtered.length === 1 ? "issue" : "issues"}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">User</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Flow</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Bureau</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Issue</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue) => (
              <tr key={issue.id} className="border-b last:border-0">
                <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(issue.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span className="ml-1 text-muted-foreground/60">
                    {new Date(issue.created_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
                <td
                  className="px-4 py-2.5 text-xs truncate max-w-[180px]"
                  title={issue.email || undefined}
                >
                  {issue.email ? (
                    <span className="font-mono">{issue.email}</span>
                  ) : (
                    <span className="text-muted-foreground italic">Anonymous</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                    {formatFlow(issue.source)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                  {BUREAU_INFO[issue.bureau].name}
                </td>
                <td className="px-4 py-2.5 text-xs">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] whitespace-nowrap">
                    {ISSUE_LABELS[issue.issue_type] ?? issue.issue_type}
                  </span>
                </td>
                <td
                  className="px-4 py-2.5 text-xs text-muted-foreground max-w-[300px] truncate"
                  title={issue.issue_details || undefined}
                >
                  {issue.issue_details || "\u2014"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No issues reported{bureauFilter !== "all" || typeFilter !== "all" ? " matching filters" : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
