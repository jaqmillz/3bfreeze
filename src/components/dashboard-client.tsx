"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  CalendarClock,
  Snowflake,
  ArrowRight,
  X,
  Lock,
  Ban,
  DatabaseZap,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type Bureau,
  type BureauStatus,

  type ThawReminder,
  type FreezeWorkflowProgress,
  BUREAU_INFO,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { BureauLogo } from "@/components/bureau-logos";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DashboardClientProps {
  bureauStatuses: BureauStatus[];
  thawReminders: ThawReminder[];
  workflowProgress: FreezeWorkflowProgress | null;
  userName: string;
}

// ---------------------------------------------------------------------------
// FreezeShield
// ---------------------------------------------------------------------------

function FreezeShield({ frozenCount }: { frozenCount: number }) {
  const id = useId();
  const fillPercent = (frozenCount / 3) * 100;
  const isFullyFrozen = frozenCount === 3;

  const shieldPath =
    "M40 4 L74 20 V52 C74 72 40 92 40 92 C40 92 6 72 6 52 V20 Z";

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative transition-all duration-500",
          isFullyFrozen && "drop-shadow-[0_0_14px_oklch(0.53_0.1_280/0.35)]"
        )}
      >
        <svg viewBox="0 0 80 96" className="h-16 w-[53px]" fill="none">
          <defs>
            <clipPath id={`shield-${id}`}>
              <path d={shieldPath} />
            </clipPath>
          </defs>
          {/* Background */}
          <path
            d={shieldPath}
            className={cn(
              "transition-all duration-500",
              frozenCount === 0
                ? "fill-muted stroke-muted-foreground/20"
                : "fill-primary/10 stroke-primary/20"
            )}
            strokeWidth="2"
          />
          {/* Fill from bottom */}
          <rect
            x="0"
            y={96 - fillPercent * 0.96}
            width="80"
            height={fillPercent * 0.96}
            clipPath={`url(#shield-${id})`}
            className={cn(
              "transition-all duration-700 ease-out",
              isFullyFrozen ? "fill-primary" : "fill-primary/70"
            )}
          />
          {/* Checkmark when fully frozen */}
          {isFullyFrozen && (
            <path
              d="M28 48 L36 56 L52 40"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* Count when partially frozen */}
          {!isFullyFrozen && frozenCount > 0 && (
            <text
              x="40"
              y="58"
              textAnchor="middle"
              className="fill-white font-bold"
              fontSize="22"
            >
              {frozenCount}
            </text>
          )}
        </svg>
      </div>
      <div>
        <p className="text-base font-bold">
          {isFullyFrozen ? "Fully Protected" : `${frozenCount} of 3 Frozen`}
        </p>
        <p className="text-xs text-muted-foreground">
          {isFullyFrozen
            ? "All three bureaus are frozen"
            : frozenCount === 0
              ? "No bureaus frozen yet"
              : `${3 - frozenCount} more to go`}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALL_BUREAUS: Bureau[] = ["equifax", "transunion", "experian"];

function getBureauStatus(
  bureauStatuses: BureauStatus[],
  bureau: Bureau
): BureauStatus | undefined {
  return bureauStatuses.find((s) => s.bureau === bureau);
}

function getEffectiveStatus(
  bureauStatuses: BureauStatus[],
  thawReminders: ThawReminder[],
  bureau: Bureau
): "frozen" | "not_frozen" | "thaw_scheduled" {
  const status = getBureauStatus(bureauStatuses, bureau);
  if (!status || status.status === "not_frozen") return "not_frozen";

  const hasActiveThaw = thawReminders.some((r) => r.bureau === bureau);
  if (hasActiveThaw) return "thaw_scheduled";

  return "frozen";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// ScheduleThawModal
// ---------------------------------------------------------------------------

function ScheduleThawModal({
  open,
  onOpenChange,
  frozenBureaus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frozenBureaus: Bureau[];
}) {
  const router = useRouter();
  const [selectedBureaus, setSelectedBureaus] = useState<Bureau[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Pre-select all frozen bureaus when modal opens
  useEffect(() => {
    if (open) {
      setSelectedBureaus([...frozenBureaus]);
      setStartDate("");
      setEndDate("");
    }
  }, [open, frozenBureaus]);

  function toggleBureau(bureau: Bureau) {
    setSelectedBureaus((prev) =>
      prev.includes(bureau)
        ? prev.filter((b) => b !== bureau)
        : [...prev, bureau]
    );
  }

  // Clear end date if it's before the new start date
  function handleStartChange(value: string) {
    setStartDate(value);
    if (endDate && value > endDate) setEndDate("");
  }

  async function handleSchedule() {
    if (selectedBureaus.length === 0) {
      toast.error("Select at least one bureau.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Select both dates.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be signed in.");
        return;
      }

      const reminders = selectedBureaus.map((bureau) => ({
        user_id: user.id,
        bureau,
        thaw_start_date: startDate,
        thaw_end_date: endDate,
      }));

      const { error } = await supabase.from("thaw_reminders").insert(reminders);
      if (error) throw error;

      const activityEntries = selectedBureaus.map((bureau) => ({
        user_id: user.id,
        bureau,
        action: "thaw_scheduled" as const,
        source: "scheduled_thaw" as const,
      }));

      await supabase.from("activity_log").insert(activityEntries);

      toast.success("Thaw scheduled.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const canSchedule =
    selectedBureaus.length > 0 && startDate && endDate && !saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Schedule thaw</DialogTitle>
          <DialogDescription className="text-xs">
            Set a window to temporarily unfreeze. You&#39;ll still need to thaw at each bureau yourself.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            {frozenBureaus.map((bureau) => (
              <label
                key={bureau}
                className="flex items-center gap-3 cursor-pointer rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedBureaus.includes(bureau)}
                  onCheckedChange={() => toggleBureau(bureau)}
                />
                <span className="text-sm">{BUREAU_INFO[bureau].name}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="thaw-start" className="text-xs text-muted-foreground">Start</Label>
              <Input
                id="thaw-start"
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => handleStartChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thaw-end" className="text-xs text-muted-foreground">End</Label>
              <Input
                id="thaw-end"
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <Button
            size="sm"
            onClick={handleSchedule}
            disabled={!canSchedule}
          >
            {saving ? "Scheduling..." : "Schedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// CancelThawModal
// ---------------------------------------------------------------------------

function CancelThawModal({
  open,
  onOpenChange,
  reminder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: ThawReminder | null;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!reminder) return;

    setCancelling(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be signed in.");
        return;
      }

      const { error } = await supabase
        .from("thaw_reminders")
        .update({ cancelled_at: new Date().toISOString() })
        .eq("id", reminder.id);

      if (error) throw error;

      await supabase.from("activity_log").insert({
        user_id: user.id,
        bureau: reminder.bureau,
        action: "thaw_cancelled",
        source: "scheduled_thaw",
      });

      toast.success("Thaw cancelled.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  if (!reminder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Cancel thaw</DialogTitle>
          <DialogDescription className="text-xs">
            {BUREAU_INFO[reminder.bureau].name} &middot; {formatDate(reminder.thaw_start_date)} - {formatDate(reminder.thaw_end_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Keep
          </button>
          <Button
            size="sm"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel thaw"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// BureauCard
// ---------------------------------------------------------------------------

function BureauCard({
  bureau,
  bureauStatuses,
  thawReminders,
  onCancelThaw,
}: {
  bureau: Bureau;
  bureauStatuses: BureauStatus[];
  thawReminders: ThawReminder[];
  onCancelThaw: (reminder: ThawReminder) => void;
}) {
  const info = BUREAU_INFO[bureau];
  const status = getBureauStatus(bureauStatuses, bureau);
  const effectiveStatus = getEffectiveStatus(bureauStatuses, thawReminders, bureau);
  const bureauReminders = thawReminders.filter((r) => r.bureau === bureau);

  const statusConfig = {
    frozen: {
      label: "Frozen",
      bg: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-500/20",
      icon: ShieldCheck,
      badgeCls: "bg-green-600 hover:bg-green-600 text-white",
    },
    not_frozen: {
      label: "Not Frozen",
      bg: "bg-muted/50",
      text: "text-muted-foreground",
      border: "border-transparent",
      icon: ShieldOff,
      badgeCls: "",
    },
    thaw_scheduled: {
      label: "Thaw Scheduled",
      bg: "bg-yellow-500/10",
      text: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-500/20",
      icon: ShieldAlert,
      badgeCls: "border-yellow-500 text-yellow-700 dark:text-yellow-400",
    },
  };

  const config = statusConfig[effectiveStatus];
  const StatusIcon = config.icon;

  return (
    <div
      className={`group relative rounded-2xl border ${config.border} ${config.bg} p-5 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <BureauLogo bureau={bureau} className="h-5 w-auto" />
          {status?.frozen_date && effectiveStatus === "frozen" && (
            <p className="text-xs text-muted-foreground">
              Since {formatDate(status.frozen_date)}
            </p>
          )}
          {effectiveStatus === "not_frozen" && status?.status_updated_at && status?.status === "not_frozen" && (
            <p className="text-xs text-muted-foreground">
              Unfrozen {formatDate(status.status_updated_at)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${config.text}`} />
          <Badge variant={effectiveStatus === "not_frozen" ? "secondary" : "outline"} className={config.badgeCls}>
            {config.label}
          </Badge>
        </div>
      </div>

      {bureauReminders.length > 0 && (
        <div className="mt-4 space-y-2">
          {bureauReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                <span>
                  {formatDate(reminder.thaw_start_date)} - {formatDate(reminder.thaw_end_date)}
                </span>
              </div>
              <button
                onClick={() => onCancelThaw(reminder)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {effectiveStatus === "not_frozen" ? (
          <Link
            href={`/freeze-workflow?bureau=${bureau}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Freeze
          </Link>
        ) : (
          <Link
            href={`/unfreeze-workflow?bureau=${bureau}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Unfreeze
          </Link>
        )}
        <span className="text-xs text-muted-foreground">&middot;</span>
        <a
          href={info.freezeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Bureau site
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardClient (main export)
// ---------------------------------------------------------------------------

export function DashboardClient({
  bureauStatuses,
  thawReminders,
  workflowProgress,
  userName,
}: DashboardClientProps) {
  const [thawModalOpen, setThawModalOpen] = useState(false);
  const [cancelThawModalOpen, setCancelThawModalOpen] = useState(false);
  const [cancelThawReminder, setCancelThawReminder] =
    useState<ThawReminder | null>(null);

  const frozenCount = ALL_BUREAUS.filter((b) => {
    const s = getBureauStatus(bureauStatuses, b);
    return s?.status === "frozen";
  }).length;

  const frozenBureaus = ALL_BUREAUS.filter((b) => {
    const s = getBureauStatus(bureauStatuses, b);
    return s?.status === "frozen";
  });

  function openCancelThawModal(reminder: ThawReminder) {
    setCancelThawReminder(reminder);
    setCancelThawModalOpen(true);
  }

  return (
    <div className="space-y-10 pb-24">
      {/* Status + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FreezeShield frozenCount={frozenCount} />
        <div className="flex gap-2.5">
          <Button asChild className="rounded-xl px-5 gap-2">
            <Link href="/freeze-workflow">
              <Snowflake className="h-4 w-4" />
              Freeze
            </Link>
          </Button>
          {frozenCount > 0 && (
            <Button
              variant="outline"
              className="rounded-xl px-5 gap-2"
              onClick={() => setThawModalOpen(true)}
            >
              <CalendarClock className="h-4 w-4" />
              Schedule Thaw
            </Button>
          )}
        </div>
      </div>

      {/* Bureau Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_BUREAUS.map((bureau) => (
          <BureauCard
            key={bureau}
            bureau={bureau}
            bureauStatuses={bureauStatuses}
            thawReminders={thawReminders}
            onCancelThaw={openCancelThawModal}
          />
        ))}
      </div>

      {/* Freeze History link */}
      <Link
        href="/history"
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Freeze History
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* What is a credit freeze? */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          About credit freezes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Lock,
              title: "What is a credit freeze?",
              desc: "A credit freeze restricts access to your credit report. Lenders can\u2019t pull your file, which means no one can open new accounts in your name.",
            },
            {
              icon: Ban,
              title: "Stops identity theft",
              desc: "Even if a thief has your SSN, they can\u2019t use it to open credit cards, loans, or other accounts while your credit is frozen.",
            },
            {
              icon: DatabaseZap,
              title: "Protection after data breaches",
              desc: "If your info was exposed in a breach, a freeze is the single most effective step to prevent fraudulent accounts from being opened.",
            },
            {
              icon: Unlock,
              title: "Easy to lift when you need it",
              desc: "Need to apply for credit? Temporarily lift your freeze online in minutes, then refreeze when you\u2019re done. Completely free.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/20"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Reminders */}
      {thawReminders.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Upcoming Thaws
          </h2>
          <div className="space-y-2">
            {thawReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {BUREAU_INFO[reminder.bureau].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(reminder.thaw_start_date)} - {formatDate(reminder.thaw_end_date)}
                    </p>
                  </div>
                </div>
                <button
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => openCancelThawModal(reminder)}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleThawModal
        open={thawModalOpen}
        onOpenChange={setThawModalOpen}
        frozenBureaus={frozenBureaus}
      />

      <CancelThawModal
        open={cancelThawModalOpen}
        onOpenChange={setCancelThawModalOpen}
        reminder={cancelThawReminder}
      />
    </div>
  );
}
