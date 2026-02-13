"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ExternalLink,
  ShieldOff,
  ShieldCheck,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { BUREAU_INFO, type Bureau, type BureauStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";

interface UnfreezeWorkflowClientProps {
  userId: string;
  bureau: Bureau;
  bureauStatuses: BureauStatus[];
}

function bureauLink(name: string, url: string) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
      {name}
    </a>
  );
}

const unfreezeInstructions: Record<Bureau, (string | React.ReactNode)[]> = {
  equifax: [
    <span key="eq-1">Log in to your account on the {bureauLink("Equifax security freeze page", BUREAU_INFO.equifax.unfreezeUrl)}.</span>,
    'Your dashboard will show "Your Equifax credit report is frozen." Click "Manage a freeze."',
    'Choose "Temporarily lift a security freeze" or "Permanently remove a security freeze."',
    "If lifting temporarily, set your desired date range (e.g. 1-2 days).",
    'Click "Temporarily Lift a Freeze" or "Remove Freeze" to confirm.',
    "You should see a green checkmark confirmation. The freeze auto-restores after a temporary lift.",
  ],
  transunion: [
    <span key="tu-1">Log in to your account on the {bureauLink("TransUnion credit freeze page", BUREAU_INFO.transunion.unfreezeUrl)}.</span>,
    'Verify your contact information and click "This Is Correct."',
    'Your status will show "Frozen." Choose "Remove Freeze" or "Temporarily Lift Freeze."',
    'To temporarily lift: enter your start and end dates, then click "Continue."',
    'To permanently remove: click "Continue" on the removal confirmation page.',
    'You should see a green "Freeze Removed" or "Freeze Temporarily Lifted" confirmation.',
  ],
  experian: [
    <span key="ex-1">Log in to your account on the {bureauLink("Experian security freeze center", BUREAU_INFO.experian.unfreezeUrl)}.</span>,
    'Navigate to the Security Freeze page. Your status will show "Your file is frozen."',
    'To permanently unfreeze: click the "Unfrozen" tab to remove the freeze immediately.',
    'To temporarily thaw: click "Schedule a thaw," select your date range, and click "Schedule thaw."',
    "The thaw starts immediately and ends at 11:59 PM CT on your selected end date.",
    'You can cancel a scheduled thaw anytime by clicking "Remove thaw."',
  ],
};

export function UnfreezeWorkflowClient({
  userId,
  bureau,
  bureauStatuses,
}: UnfreezeWorkflowClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [unfreezeType, setUnfreezeType] = useState<"permanent" | "temporary">("permanent");
  const [thawStartDate, setThawStartDate] = useState("");
  const [thawEndDate, setThawEndDate] = useState("");

  const info = BUREAU_INFO[bureau];
  const currentStatus = bureauStatuses.find((s) => s.bureau === bureau);
  const isFrozen = currentStatus?.status === "frozen";

  async function handleConfirmUnfreeze() {
    setSaving(true);
    try {
      const supabase = createClient();

      // Cancel any active thaw reminders for this bureau
      await supabase
        .from("thaw_reminders")
        .update({ cancelled_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("bureau", bureau)
        .is("cancelled_at", null);

      const { error } = await supabase.from("bureau_status").upsert(
        {
          user_id: userId,
          bureau,
          status: "not_frozen",
          status_updated_at: new Date().toISOString(),
          frozen_date: null,
        },
        { onConflict: "user_id,bureau" }
      );

      if (error) throw error;

      await supabase.from("activity_log").insert({
        user_id: userId,
        bureau,
        action: "unfrozen",
        source: "manual_update",
      });

      toast.success(`${info.name} unfrozen.`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmTemporaryThaw() {
    if (!thawStartDate || !thawEndDate) {
      toast.error("Please select start and end dates.");
      return;
    }
    if (thawEndDate < thawStartDate) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.from("thaw_reminders").insert({
        user_id: userId,
        bureau,
        thaw_start_date: thawStartDate,
        thaw_end_date: thawEndDate,
        set_at_bureau: true,
      });

      if (error) throw error;

      await supabase.from("activity_log").insert({
        user_id: userId,
        bureau,
        action: "thaw_scheduled",
        source: "manual_update",
      });

      toast.success(`Temporary thaw logged for ${info.name}.`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!isFrozen) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          <ShieldOff className="h-4 w-4" />
          {info.name} is not currently frozen.
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-24">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <h2 className="text-xl font-bold tracking-tight">
          Unfreeze {info.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow these steps to remove or temporarily lift your freeze.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
        <ShieldCheck className="h-4 w-4" />
        Currently frozen
        {currentStatus?.frozen_date && (
          <span className="text-green-600/70 dark:text-green-400/70">
            &middot; since{" "}
            {new Date(currentStatus.frozen_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      <ol className="space-y-2">
        {unfreezeInstructions[bureau].map((step, idx) => (
          <li key={idx} className="flex gap-3 rounded-lg border px-3 py-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              {idx + 1}
            </span>
            <span className="text-sm leading-5">{step}</span>
          </li>
        ))}
      </ol>

      <a
        href={info.unfreezeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-[0.98]"
      >
        Open {info.name}
        <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>

      <p className="text-xs text-muted-foreground text-center">
        {info.unfreezeTip}
      </p>

      <div className="h-px bg-border" />

      <div className="space-y-4">
        <p className="text-sm font-medium">What did you do at the bureau?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setUnfreezeType("permanent")}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              unfreezeType === "permanent"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            <span className="font-medium">Permanently unfroze</span>
            <p className="mt-0.5 text-xs text-muted-foreground">Freeze fully removed</p>
          </button>
          <button
            type="button"
            onClick={() => setUnfreezeType("temporary")}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              unfreezeType === "temporary"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            <span className="font-medium">Temporarily thawed</span>
            <p className="mt-0.5 text-xs text-muted-foreground">Freeze lifts for a date range</p>
          </button>
        </div>

        {unfreezeType === "temporary" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="thaw-start" className="text-xs">Start date</Label>
              <Input
                id="thaw-start"
                type="date"
                value={thawStartDate}
                onChange={(e) => setThawStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thaw-end" className="text-xs">End date</Label>
              <Input
                id="thaw-end"
                type="date"
                value={thawEndDate}
                onChange={(e) => setThawEndDate(e.target.value)}
                min={thawStartDate || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        )}

        <Button
          size="sm"
          onClick={unfreezeType === "permanent" ? handleConfirmUnfreeze : handleConfirmTemporaryThaw}
          disabled={saving}
          className="w-full"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {unfreezeType === "permanent" ? "Confirm unfreeze" : "Log temporary thaw"}
        </Button>
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
