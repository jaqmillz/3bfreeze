"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearState } from "@/lib/breach-workflow-storage";

export function BreachSignupPrompt({ breachCode, breachName }: { breachCode: string; breachName?: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950/30">
        <ShieldCheck className="mx-auto h-6 w-6 text-green-600 dark:text-green-400" />
        <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
          You&apos;re all set.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Remember to save your bureau logins in your password manager so you
          can easily access them next time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="text-base font-semibold">Save your progress</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a free account to track your freeze status, get reminders when
          you temporarily lift a freeze, and manage future unfreezes. No credit
          card, no catch.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="gap-2">
            <Link href={`/signup?breach=${breachCode}${breachName ? `&breachName=${encodeURIComponent(breachName)}` : ""}`}>
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              clearState();
              setDismissed(true);
            }}
          >
            No thanks, I&apos;m done
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            No credit card required
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Your data stays private
          </span>
        </div>
      </div>
    </div>
  );
}
