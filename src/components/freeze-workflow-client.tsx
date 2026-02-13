"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ExternalLink,
  ShieldCheck,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import {
  BUREAU_INFO,
  type Bureau,
  type WorkflowStep,
  type IssueType,
  type FreezeWorkflowProgress,
  type BureauStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS: { key: WorkflowStep; label: string }[] = [
  { key: "checklist", label: "Start" },
  { key: "equifax", label: "Equifax" },
  { key: "transunion", label: "TransUnion" },
  { key: "experian", label: "Experian" },
  { key: "complete", label: "Done" },
];

const CHECKLIST_ITEMS = [
  "Social Security Number (SSN)",
  "Date of birth",
  "Current mailing address",
  "Email address",
  "Phone number",
  "Government-issued ID",
  "Answers to identity verification questions",
];

const ISSUE_OPTIONS: { value: IssueType; label: string }[] = [
  { value: "identity_verification", label: "Identity verification failed" },
  { value: "site_error", label: "Website error or outage" },
  { value: "asked_to_pay", label: "Was asked to pay" },
  { value: "confused", label: "Got confused or stuck" },
  { value: "other", label: "Other issue" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FreezeWorkflowClientProps {
  userId: string;
  initialProgress: FreezeWorkflowProgress | null;
  initialBureauStatuses: BureauStatus[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FreezeWorkflowClient({
  userId,
  initialProgress,
  initialBureauStatuses,
}: FreezeWorkflowClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Derive initial step from saved progress or default to checklist.
  // If a ?bureau= query param is provided, jump directly to that bureau step.
  // If the workflow was previously completed but not all bureaus are frozen,
  // reset to the first unfrozen bureau so the user can retry.
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(() => {
    const bureauParam = searchParams.get("bureau") as Bureau | null;
    if (bureauParam && ["equifax", "transunion", "experian"].includes(bureauParam)) {
      return bureauParam;
    }

    const saved = initialProgress?.current_step ?? "checklist";
    if (saved === "complete") {
      const allFrozen = initialBureauStatuses.every(
        (s) => s.status === "frozen"
      );
      // Only stay on complete if all 3 bureaus exist and are frozen
      if (allFrozen && initialBureauStatuses.length === 3) return "complete";
      // Otherwise find the first unfrozen bureau to resume there
      const bureauOrder: Bureau[] = ["equifax", "transunion", "experian"];
      for (const b of bureauOrder) {
        const status = initialBureauStatuses.find((s) => s.bureau === b);
        if (!status || status.status !== "frozen") return b;
      }
    }
    return saved;
  });

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    CHECKLIST_ITEMS.map(() => initialProgress?.checklist_completed ?? false)
  );

  // Bureau completion tracking (local, mirrors DB)
  const [bureauCompleted, setBureauCompleted] = useState<
    Record<Bureau, boolean>
  >({
    equifax: initialProgress?.equifax_completed ?? false,
    transunion: initialProgress?.transunion_completed ?? false,
    experian: initialProgress?.experian_completed ?? false,
  });

  // Bureau statuses from DB
  const [bureauStatuses, setBureauStatuses] =
    useState<BureauStatus[]>(initialBureauStatuses);

  // Issue modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueModalBureau, setIssueModalBureau] = useState<Bureau>("equifax");
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [issueDetails, setIssueDetails] = useState("");

  // Loading states
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progressPercent = (stepIndex / (STEPS.length - 1)) * 100;
  const allChecked = checkedItems.every(Boolean);

  function getBureauStatus(bureau: Bureau): "frozen" | "not_frozen" | "issue" {
    const status = bureauStatuses.find((s) => s.bureau === bureau);
    if (status?.status === "frozen") return "frozen";
    // Check if there was an issue reported but not frozen
    return "not_frozen";
  }

  const nextStep = useCallback(
    (from: WorkflowStep): WorkflowStep => {
      const idx = STEPS.findIndex((s) => s.key === from);
      return idx < STEPS.length - 1 ? STEPS[idx + 1].key : "complete";
    },
    []
  );

  const prevStep = useCallback(
    (from: WorkflowStep): WorkflowStep => {
      const idx = STEPS.findIndex((s) => s.key === from);
      return idx > 0 ? STEPS[idx - 1].key : "checklist";
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Supabase mutations
  // ---------------------------------------------------------------------------

  async function upsertWorkflowProgress(
    updates: Partial<
      Pick<
        FreezeWorkflowProgress,
        | "current_step"
        | "checklist_completed"
        | "equifax_completed"
        | "transunion_completed"
        | "experian_completed"
        | "completed_at"
      >
    >
  ) {
    const { error } = await supabase.from("freeze_workflow_progress").upsert(
      {
        user_id: userId,
        ...updates,
      },
      { onConflict: "user_id" }
    );
    if (error) {
      console.error("Failed to save workflow progress:", error);
      toast.error("Failed to save progress. Please try again.");
      return false;
    }
    return true;
  }

  async function markBureauFrozen(bureau: Bureau) {
    setSaving(true);
    const alreadyFrozen = getBureauStatus(bureau) === "frozen";
    try {
      const now = new Date().toISOString();

      // Upsert bureau_status to frozen
      const { error: statusError } = await supabase
        .from("bureau_status")
        .upsert(
          {
            user_id: userId,
            bureau,
            status: "frozen",
            status_updated_at: now,
            frozen_date: now,
          },
          { onConflict: "user_id,bureau" }
        );

      if (statusError) {
        toast.error(`Failed to update ${BUREAU_INFO[bureau].name} status.`);
        return;
      }

      // Only log activity if this is a new freeze (not a re-confirmation)
      if (!alreadyFrozen) {
        await supabase.from("activity_log").insert({
          user_id: userId,
          bureau,
          action: "frozen",
          source: "freeze_workflow",
        });
      }

      // Update local state
      setBureauCompleted((prev) => ({ ...prev, [bureau]: true }));
      setBureauStatuses((prev) => {
        const filtered = prev.filter((s) => s.bureau !== bureau);
        return [
          ...filtered,
          {
            id: "",
            user_id: userId,
            bureau,
            status: "frozen" as const,
            status_updated_at: now,
            frozen_date: now,
            notes: null,
          },
        ];
      });

      // Advance step
      const next = nextStep(currentStep);
      const completedKey = `${bureau}_completed` as
        | "equifax_completed"
        | "transunion_completed"
        | "experian_completed";

      const progressUpdates: Record<string, unknown> = {
        current_step: next,
        [completedKey]: true,
      };

      if (next === "complete") {
        progressUpdates.completed_at = now;
      }

      const saved = await upsertWorkflowProgress(progressUpdates);
      if (saved) {
        setCurrentStep(next);
        toast.success(`${BUREAU_INFO[bureau].name} credit freeze confirmed!`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleIssueSubmit() {
    if (!selectedIssue) return;

    setSaving(true);
    try {
      // Insert freeze issue
      await supabase.from("freeze_issues").insert({
        user_id: userId,
        bureau: issueModalBureau,
        issue_type: selectedIssue,
        issue_details: issueDetails || null,
      });

      // Insert activity log
      await supabase.from("activity_log").insert({
        user_id: userId,
        bureau: issueModalBureau,
        action: "issue_reported",
        source: "freeze_workflow",
      });

      // Advance to next step (skip this bureau)
      const next = nextStep(currentStep);
      const progressUpdates: Record<string, unknown> = {
        current_step: next,
      };

      if (next === "complete") {
        progressUpdates.completed_at = new Date().toISOString();
      }

      const saved = await upsertWorkflowProgress(progressUpdates);
      if (saved) {
        setCurrentStep(next);
        toast.info(
          `Skipped ${BUREAU_INFO[issueModalBureau].name}. You can come back later.`
        );
        router.refresh();
      }

      // Reset modal state
      setIssueModalOpen(false);
      setSelectedIssue(null);
      setIssueDetails("");
    } finally {
      setSaving(false);
    }
  }

  async function handleChecklistComplete() {
    setSaving(true);
    try {
      const saved = await upsertWorkflowProgress({
        checklist_completed: true,
        current_step: "equifax",
      });
      if (saved) {
        setCurrentStep("equifax");
        toast.success("Checklist complete! Let's start with Equifax.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCompletionView() {
    // Ensure completion is saved when user reaches this step
    await upsertWorkflowProgress({
      current_step: "complete",
      completed_at: new Date().toISOString(),
    });
  }

  function navigateStep(step: WorkflowStep) {
    setCurrentStep(step);
  }

  // ---------------------------------------------------------------------------
  // Stepper header
  // ---------------------------------------------------------------------------

  function isStepCompleted(stepKey: WorkflowStep): boolean {
    if (stepKey === "checklist") return allChecked || (initialProgress?.checklist_completed ?? false);
    if (stepKey === "complete") {
      return getBureauStatus("equifax") === "frozen" &&
        getBureauStatus("transunion") === "frozen" &&
        getBureauStatus("experian") === "frozen";
    }
    return getBureauStatus(stepKey as Bureau) === "frozen";
  }

  function isStepSkipped(stepKey: WorkflowStep): boolean {
    if (stepKey === "checklist" || stepKey === "complete") return false;
    const bureau = stepKey as Bureau;
    // A bureau step is "skipped" if we've moved past it but it's not frozen
    const idx = STEPS.findIndex((s) => s.key === stepKey);
    if (idx >= stepIndex) return false;
    return getBureauStatus(bureau) !== "frozen";
  }

  function StepperHeader() {
    const arrowSize = 10; // px for the chevron point
    return (
      <div className="flex items-stretch">
        {STEPS.map((step, idx) => {
          const completed = isStepCompleted(step.key);
          const isCurrent = idx === stepIndex;
          const skipped = isStepSkipped(step.key);
          const isFirst = idx === 0;
          const isLast = idx === STEPS.length - 1;

          let bg = "var(--color-muted)";
          let fg = "var(--color-muted-foreground)";
          if (skipped) { bg = "oklch(0.705 0.213 47.604)"; fg = "#fff"; } // orange-500
          else if (isCurrent) { bg = "oklch(from var(--color-primary) l c h / 0.6)"; fg = "#fff"; }
          else if (completed) { bg = "var(--color-primary)"; fg = "#fff"; }

          // Clip-path: chevron arrow shape
          // First item: flat left, arrow right
          // Middle items: notch left, arrow right
          // Last item: notch left, flat right
          const clipPath = isFirst
            ? `polygon(0 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, 0 100%)`
            : isLast
            ? `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${arrowSize}px 50%)`
            : `polygon(0 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, 0 100%, ${arrowSize}px 50%)`;

          return (
            <button
              key={step.key}
              onClick={() => navigateStep(step.key)}
              className="flex h-9 flex-1 items-center justify-center text-xs font-medium transition-all cursor-pointer"
              style={{
                clipPath,
                backgroundColor: bg,
                color: fg,
                marginLeft: isFirst ? 0 : -1,
              }}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Navigation footer
  // ---------------------------------------------------------------------------

  function NavigationFooter({
    onNext,
    nextLabel = "Continue",
    nextDisabled = false,
    showBack = true,
  }: {
    onNext?: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    showBack?: boolean;
  }) {
    return (
      <div className="flex items-center justify-between pt-4">
        {showBack && stepIndex > 0 ? (
          <button
            onClick={() => navigateStep(prevStep(currentStep))}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        {onNext && (
          <Button size="sm" onClick={onNext} disabled={nextDisabled || saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {nextLabel}
          </Button>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 1: Pre-Flight Checklist
  // ---------------------------------------------------------------------------

  function ChecklistStep() {
    function toggleItem(index: number) {
      setCheckedItems((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        return next;
      });
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Before you start</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Have these ready for each bureau. ~5 min per bureau.
          </p>
        </div>

        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item, idx) => (
            <label
              key={item}
              htmlFor={`checklist-${idx}`}
              className="flex items-center gap-3 cursor-pointer rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                id={`checklist-${idx}`}
                checked={checkedItems[idx]}
                onCheckedChange={() => toggleItem(idx)}
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>

        {!allChecked && (
          <p className="text-xs text-muted-foreground text-center">
            <button
              className="text-primary hover:underline"
              onClick={() => {
                setCheckedItems(CHECKLIST_ITEMS.map(() => true));
              }}
            >
              Mark all as ready
            </button>
          </p>
        )}

        <NavigationFooter
          onNext={handleChecklistComplete}
          nextLabel="Continue"
          nextDisabled={!allChecked}
          showBack={false}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Credential saving tip with tooltips
  // ---------------------------------------------------------------------------

  const PASSWORD_MANAGERS = [
    {
      name: "Apple Passwords",
      url: "https://support.apple.com/guide/iphone/save-and-autofill-passwords-iphf9219d8c9/ios",
    },
    {
      name: "Google Password Manager",
      url: "https://passwords.google.com",
    },
  ];

  function CredentialTip() {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
        <p className="text-xs text-muted-foreground">
          Save your bureau logins to a password manager.
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="w-56 p-3 bg-white text-foreground border shadow-md [&>svg]:fill-white [&>svg]:bg-white">
            <p className="text-xs text-muted-foreground mb-2">
              A password manager securely stores your logins so you don&apos;t have to remember them.
            </p>
            <div className="space-y-1">
              {PASSWORD_MANAGERS.map((m) => (
                <a
                  key={m.name}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{m.name}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Steps 2-4: Bureau freeze step
  // ---------------------------------------------------------------------------

  function BureauStep({ bureau }: { bureau: Bureau }) {
    const info = BUREAU_INFO[bureau];
    const status = getBureauStatus(bureau);

    const accountStep = (
      <span key="acct">
        Create an account or sign in. Save your login to a password manager.
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="ml-1 inline-flex align-middle text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="w-56 p-3 bg-white text-foreground border shadow-md [&>svg]:fill-white [&>svg]:bg-white">
            <p className="text-xs text-muted-foreground mb-2">
              A password manager securely stores your logins so you don&apos;t have to remember them.
            </p>
            <div className="space-y-1">
              {PASSWORD_MANAGERS.map((m) => (
                <a
                  key={m.name}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{m.name}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </span>
    );

    const instructions: Record<Bureau, (string | React.ReactNode)[]> = {
      equifax: [
        <span key="eq-1">Go to the <a href={BUREAU_INFO.equifax.freezeUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Equifax security freeze page</a> and click &quot;Place a Security Freeze.&quot;</span>,
        accountStep,
        `Enter your personal information: name, date of birth, SSN, address, and phone number.`,
        `Verify your identity via a one-time passcode sent by text or email.`,
        `Review the freeze details and click "Place a Freeze" to confirm.`,
        `Download your confirmation PDF. Equifax will also email a confirmation.`,
      ],
      transunion: [
        <span key="tu-1">Go to the <a href={BUREAU_INFO.transunion.freezeUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">TransUnion credit freeze page</a> and click &quot;Credit Freeze.&quot;</span>,
        accountStep,
        `Enter your personal information: name, address, date of birth, last 4 of SSN, email, and phone number.`,
        `Create a password and set a security question.`,
        `On the freeze status page, click "Add Freeze."`,
        `Review the freeze details, then click "Continue" to confirm. You should see a green "Freeze Added" confirmation.`,
      ],
      experian: [
        <span key="ex-1">Go to the <a href={BUREAU_INFO.experian.freezeUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Experian security freeze center</a>.</span>,
        `Verify your phone number via text or call.`,
        accountStep,
        <span key="ex-4">Choose the free &quot;Experian CreditWorks Basic&quot; membership. Set a password, security question, and 4-digit PIN.</span>,
        `Review your pre-filled personal information and click "Submit and Continue."`,
        `On the Security Freeze page, click "Frozen" to activate your freeze.`,
      ],
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{info.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Place a security freeze at {info.name}.
          </p>
        </div>

        {status === "frozen" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
            <ShieldCheck className="h-4 w-4" />
            Already frozen. Continue to the next step.
          </div>
        )}

        <ol className="space-y-2">
          {instructions[bureau].map((step, idx) => (
            <li key={idx} className="flex gap-3 rounded-lg border px-3 py-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {idx + 1}
              </span>
              <span className="text-sm leading-5">{step}</span>
            </li>
          ))}
        </ol>

        <a
          href={info.freezeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-[0.98]"
        >
          Open {info.name}
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>

        <p className="text-xs text-muted-foreground text-center">{info.tip}</p>

        <div className="h-px bg-border" />

        <div className="flex flex-col items-center gap-2">
          <Button
            size="sm"
            onClick={() => markBureauFrozen(bureau)}
            disabled={saving}
            className="w-full"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm freeze
          </Button>
          <button
            onClick={() => {
              setIssueModalBureau(bureau);
              setIssueModalOpen(true);
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            I had issues
          </button>
        </div>

        <NavigationFooter />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 5: Completion
  // ---------------------------------------------------------------------------

  function CompletionStep() {
    const hasSavedCompletion = useRef(false);

    useEffect(() => {
      if (!hasSavedCompletion.current) {
        hasSavedCompletion.current = true;
        handleCompletionView();
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const allFrozen =
      getBureauStatus("equifax") === "frozen" &&
      getBureauStatus("transunion") === "frozen" &&
      getBureauStatus("experian") === "frozen";

    const bureaus: Bureau[] = ["equifax", "transunion", "experian"];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {allFrozen ? "All bureaus frozen" : "Summary"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {allFrozen
              ? "Your credit files are protected. Lenders can't pull your credit without you lifting the freeze."
              : "Come back anytime to freeze remaining bureaus."}
          </p>
        </div>

        <div className="space-y-2">
          {bureaus.map((bureau) => {
            const status = getBureauStatus(bureau);
            return (
              <div
                key={bureau}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5"
              >
                <span className="text-sm font-medium">
                  {BUREAU_INFO[bureau].name}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  status === "frozen" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}>
                  {status === "frozen" ? "Frozen" : "Not frozen"}
                </span>
              </div>
            );
          })}
        </div>

        {!allFrozen && (
          <button
            onClick={() => {
              if (getBureauStatus("equifax") !== "frozen") {
                setCurrentStep("equifax");
              } else if (getBureauStatus("transunion") !== "frozen") {
                setCurrentStep("transunion");
              } else {
                setCurrentStep("experian");
              }
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Freeze remaining bureaus
          </button>
        )}

        <CredentialTip />

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigateStep(prevStep(currentStep))}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
          <Button size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Freeze Issue Modal (inlined to avoid remount glitch)
  // ---------------------------------------------------------------------------

  const freezeIssueModal = (
    <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">What went wrong?</DialogTitle>
          <DialogDescription className="text-xs">
            You can skip {BUREAU_INFO[issueModalBureau].name} and come back later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {ISSUE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedIssue(option.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                selectedIssue === option.value
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                  selectedIssue === option.value
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {selectedIssue === option.value && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
              {option.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="issue-details" className="text-xs text-muted-foreground">
            Details (optional)
          </Label>
          <Textarea
            id="issue-details"
            placeholder="What happened..."
            value={issueDetails}
            onChange={(e) => setIssueDetails(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              setIssueModalOpen(false);
              setSelectedIssue(null);
              setIssueDetails("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </button>
          <Button
            size="sm"
            onClick={handleIssueSubmit}
            disabled={!selectedIssue || saving}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Skip bureau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      <StepperHeader />

      {currentStep === "checklist" && <ChecklistStep />}
      {currentStep === "equifax" && <BureauStep bureau="equifax" />}
      {currentStep === "transunion" && <BureauStep bureau="transunion" />}
      {currentStep === "experian" && <BureauStep bureau="experian" />}
      {currentStep === "complete" && <CompletionStep />}

      {freezeIssueModal}
    </div>
  );
}
