"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  BUREAU_INFO,
  type Bureau,
  type WorkflowStep,
  type IssueType,
  type FreezeWorkflowProgress,
  type BureauStatus,
} from "@/lib/types";
import { FreezeIssueModal } from "@/components/freeze-issue-modal";
import { useTabTitleFlash } from "@/hooks/use-tab-title-flash";
import {
  STEPS,
  CHECKLIST_ITEMS,
  getNextStep,
  getPrevStep,
} from "@/lib/workflow-constants";
import {
  StepperHeader,
  ChecklistStep,
  BureauStep,
  CompletionStep,
  BureauNavModal,
} from "@/components/workflow-shared";

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
      if (allFrozen && initialBureauStatuses.length === 3) return "complete";
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
  const [, setBureauCompleted] = useState<Record<Bureau, boolean>>({
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

  // Bureau navigation modal state
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [navModalBureau, setNavModalBureau] = useState<Bureau>("equifax");

  // Loading states
  const [saving, setSaving] = useState(false);

  // Flash tab title when user is on a bureau step
  const isBureauStep = ["equifax", "transunion", "experian"].includes(currentStep);
  useTabTitleFlash(isBureauStep);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const allChecked = checkedItems.every(Boolean);

  function getBureauStatus(bureau: Bureau): "frozen" | "not_frozen" | "issue" {
    const status = bureauStatuses.find((s) => s.bureau === bureau);
    if (status?.status === "frozen") return "frozen";
    return "not_frozen";
  }

  function navigateStep(step: WorkflowStep) {
    setCurrentStep(step);
  }

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
      { user_id: userId, ...updates },
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

      if (!alreadyFrozen) {
        await supabase.from("activity_log").insert({
          user_id: userId,
          bureau,
          action: "frozen",
          source: "freeze_workflow",
        });
      }

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

      const next = getNextStep(currentStep);
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

  async function handleIssueSubmit(issueType: IssueType, details: string) {
    setSaving(true);
    try {
      await supabase.from("freeze_issues").insert({
        user_id: userId,
        bureau: issueModalBureau,
        issue_type: issueType,
        issue_details: details || null,
        source: "authenticated",
      });

      await supabase.from("activity_log").insert({
        user_id: userId,
        bureau: issueModalBureau,
        action: "issue_reported",
        source: "freeze_workflow",
      });

      const next = getNextStep(currentStep);
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

      setIssueModalOpen(false);
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
    await upsertWorkflowProgress({
      current_step: "complete",
      completed_at: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------------------------
  // Step completion helpers
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
    const idx = STEPS.findIndex((s) => s.key === stepKey);
    if (idx >= stepIndex) return false;
    return getBureauStatus(bureau) !== "frozen";
  }

  // ---------------------------------------------------------------------------
  // Completion step wrapper
  // ---------------------------------------------------------------------------

  function FreezeCompletionStep() {
    const hasSavedCompletion = useRef(false);

    useEffect(() => {
      if (!hasSavedCompletion.current) {
        hasSavedCompletion.current = true;
        handleCompletionView();
      }
    }, []);

    return (
      <CompletionStep
        isBureauFrozen={(b) => getBureauStatus(b) === "frozen"}
        onNavigateStep={navigateStep}
        onBack={() => navigateStep(getPrevStep(currentStep))}
      >
        <Button size="sm" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </CompletionStep>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      <StepperHeader
        currentStep={currentStep}
        isStepCompleted={isStepCompleted}
        isStepSkipped={isStepSkipped}
        onStepClick={navigateStep}
      />

      {currentStep === "checklist" && (
        <ChecklistStep
          checkedItems={checkedItems}
          onToggle={(idx) =>
            setCheckedItems((prev) => {
              const next = [...prev];
              next[idx] = !next[idx];
              return next;
            })
          }
          onMarkAllReady={() => setCheckedItems(CHECKLIST_ITEMS.map(() => true))}
          onComplete={handleChecklistComplete}
          saving={saving}
        />
      )}
      {currentStep === "equifax" && (
        <BureauStep
          bureau="equifax"
          frozen={getBureauStatus("equifax") === "frozen"}
          onConfirmFreeze={markBureauFrozen}
          onReportIssue={(b) => { setIssueModalBureau(b); setIssueModalOpen(true); }}
          onOpenNavModal={(b) => { setNavModalBureau(b); setNavModalOpen(true); }}
          onBack={() => navigateStep(getPrevStep(currentStep))}
          saving={saving}
        />
      )}
      {currentStep === "transunion" && (
        <BureauStep
          bureau="transunion"
          frozen={getBureauStatus("transunion") === "frozen"}
          onConfirmFreeze={markBureauFrozen}
          onReportIssue={(b) => { setIssueModalBureau(b); setIssueModalOpen(true); }}
          onOpenNavModal={(b) => { setNavModalBureau(b); setNavModalOpen(true); }}
          onBack={() => navigateStep(getPrevStep(currentStep))}
          saving={saving}
        />
      )}
      {currentStep === "experian" && (
        <BureauStep
          bureau="experian"
          frozen={getBureauStatus("experian") === "frozen"}
          onConfirmFreeze={markBureauFrozen}
          onReportIssue={(b) => { setIssueModalBureau(b); setIssueModalOpen(true); }}
          onOpenNavModal={(b) => { setNavModalBureau(b); setNavModalOpen(true); }}
          onBack={() => navigateStep(getPrevStep(currentStep))}
          saving={saving}
        />
      )}
      {currentStep === "complete" && <FreezeCompletionStep />}

      <FreezeIssueModal
        open={issueModalOpen}
        onOpenChange={setIssueModalOpen}
        bureau={issueModalBureau}
        onSkip={handleIssueSubmit}
        saving={saving}
      />

      <BureauNavModal
        open={navModalOpen}
        onOpenChange={setNavModalOpen}
        bureau={navModalBureau}
      />
    </div>
  );
}
