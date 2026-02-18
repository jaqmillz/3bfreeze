"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, LockOpen, ShieldAlert } from "lucide-react";
import { FadeUp } from "@/components/animate";
import type { BreachInfo } from "@/lib/breach-codes";

export function BreachHero({
  breach,
  collapsible = false,
}: {
  breach: BreachInfo;
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (collapsible && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 mb-6 transition-all hover:bg-muted/50 cursor-pointer text-left"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
          <AlertTriangle className="h-3 w-3" />
          Breach
        </span>
        <span className="text-sm font-semibold truncate">{breach.name}</span>
        <span className="hidden sm:inline text-xs text-muted-foreground">&middot;</span>
        <span className="hidden sm:inline text-xs text-muted-foreground truncate">
          {breach.dataExposed.slice(0, 3).join(", ")}
          {breach.dataExposed.length > 3 && ` +${breach.dataExposed.length - 3}`}
        </span>
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <FadeUp>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
            <AlertTriangle className="h-3 w-3" />
            Data Breach Alert
          </span>
          {collapsible && (
            <button
              onClick={() => setExpanded(false)}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Collapse
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </FadeUp>

      <FadeUp delay={collapsible ? 0 : 0.1}>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {breach.name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {breach.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{breach.date}</span>
          {breach.recordsAffected && (
            <>
              <span className="hidden sm:inline">&middot;</span>
              <span>{breach.recordsAffected} records affected</span>
            </>
          )}
        </div>
      </FadeUp>

      <FadeUp delay={collapsible ? 0 : 0.2}>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data exposed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {breach.dataExposed.map((item) => (
              <span
                key={item}
                className="rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-xs font-medium text-destructive"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={collapsible ? 0 : 0.3}>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <LockOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Your credit file is like a door that was left unlocked.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Freezing it is like adding a deadbolt &mdash; free and instant.
                No one can open new accounts in your name while your credit is
                frozen.
              </p>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={collapsible ? 0 : 0.4}>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Follow the steps below to freeze your credit at all three bureaus.
            It takes about 15 minutes and costs nothing.
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
