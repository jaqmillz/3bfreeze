"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Snowflake,
  Sun,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { ActivityLogEntry, Bureau, ActivityAction, ActivitySource } from "@/lib/types";

const BUREAU_LABELS: Record<Bureau, string> = {
  equifax: "Equifax",
  transunion: "TransUnion",
  experian: "Experian",
};

const ACTION_LABELS: Record<ActivityAction, string> = {
  frozen: "Frozen",
  unfrozen: "Unfrozen",
  thaw_scheduled: "Unfreeze scheduled",
  thaw_cancelled: "Unfreeze cancelled",
  issue_reported: "Issue reported",
};

const ACTION_FILTER_LABELS: Record<string, string> = {
  all: "All actions",
  frozen: "Frozen",
  unfrozen: "Unfrozen",
  thaw_scheduled: "Unfreeze scheduled",
  thaw_cancelled: "Unfreeze cancelled",
};

const SOURCE_LABELS: Record<ActivitySource, string> = {
  freeze_workflow: "Workflow",
  manual_update: "Manual",
  scheduled_thaw: "Scheduled",
};

function ActionIcon({ action }: { action: ActivityAction }) {
  switch (action) {
    case "frozen":
      return <Snowflake className="h-3.5 w-3.5 text-primary" />;
    case "unfrozen":
      return <Sun className="h-3.5 w-3.5 text-amber-500" />;
    case "thaw_scheduled":
      return <Clock className="h-3.5 w-3.5 text-orange-500" />;
    case "thaw_cancelled":
      return <XCircle className="h-3.5 w-3.5 text-muted-foreground" />;
    case "issue_reported":
      return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function HistoryClient({ entries }: { entries: ActivityLogEntry[] }) {
  const [bureauFilter, setBureauFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (bureauFilter !== "all" && entry.bureau !== bureauFilter) return false;
      if (actionFilter !== "all" && entry.action !== actionFilter) return false;
      return true;
    });
  }, [entries, bureauFilter, actionFilter]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={bureauFilter} onValueChange={setBureauFilter}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
            <SelectValue placeholder="All bureaus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All bureaus</SelectItem>
            <SelectItem value="equifax">Equifax</SelectItem>
            <SelectItem value="transunion">TransUnion</SelectItem>
            <SelectItem value="experian">Experian</SelectItem>
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ACTION_FILTER_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(bureauFilter !== "all" || actionFilter !== "all") && (
          <button
            onClick={() => {
              setBureauFilter("all");
              setActionFilter("all");
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {entries.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <Button size="sm" asChild className="mt-3">
                <Link href="/freeze-workflow">Start freeze</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No matching activity.{" "}
              <button
                onClick={() => {
                  setBureauFilter("all");
                  setActionFilter("all");
                }}
                className="text-primary hover:underline"
              >
                Clear filters
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
            >
              <ActionIcon action={entry.action} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium">
                    {BUREAU_LABELS[entry.bureau]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ACTION_LABELS[entry.action]}
                  </span>
                </div>
              </div>
              <time
                className="text-xs text-muted-foreground shrink-0"
                dateTime={entry.created_at}
              >
                {formatDate(entry.created_at)}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
