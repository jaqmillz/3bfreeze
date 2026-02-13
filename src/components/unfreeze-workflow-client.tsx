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
import { createClient } from "@/lib/supabase/client";
import { BUREAU_INFO, type Bureau, type BureauStatus } from "@/lib/types";
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
    'Navigate to "Security Freeze" in your account settings.',
    'Click "Remove" or "Temporarily Lift" your freeze.',
    "If lifting temporarily, set your desired date range.",
    "Confirm the change. You should see a confirmation screen.",
  ],
  transunion: [
    <span key="tu-1">Log in to your account on the {bureauLink("TransUnion credit freeze page", BUREAU_INFO.transunion.unfreezeUrl)}.</span>,
    'Go to the "Credit Freeze" section.',
    'Click "Remove Freeze" or "Temporarily Lift."',
    "If lifting temporarily, select the date range or specific creditor.",
    "Confirm the change. TransUnion will send a confirmation email.",
  ],
  experian: [
    <span key="ex-1">Log in to your account on the {bureauLink("Experian security freeze center", BUREAU_INFO.experian.unfreezeUrl)}.</span>,
    'Go to the "Security Freeze" center.',
    'Select "Remove Freeze" or "Temporarily Lift."',
    "If lifting temporarily, choose your date range.",
    "Confirm the change. Save your confirmation for your records.",
  ],
};

export function UnfreezeWorkflowClient({
  userId,
  bureau,
  bureauStatuses,
}: UnfreezeWorkflowClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const info = BUREAU_INFO[bureau];
  const currentStatus = bureauStatuses.find((s) => s.bureau === bureau);
  const isFrozen = currentStatus?.status === "frozen";

  async function handleConfirmUnfreeze() {
    setSaving(true);
    try {
      const supabase = createClient();

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

      <div className="flex flex-col items-center gap-2">
        <Button
          size="sm"
          onClick={handleConfirmUnfreeze}
          disabled={saving}
          className="w-full"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Confirm unfreeze
        </Button>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
