"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  BUREAU_INFO,
  type Bureau,
  type WorkflowStep,
  type IssueType,
} from "@/lib/types";
import type { BreachInfo } from "@/lib/breach-codes";
import {
  loadState,
  saveState,
  createInitialState,
  getBureauCompletedKey,
  type AnonymousWorkflowState,
} from "@/lib/breach-workflow-storage";
import { getSessionId } from "@/lib/session-id";
import { BreachSignupPrompt } from "@/components/breach-signup-prompt";
import { BreachHero } from "@/components/breach-hero";
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
// Component
// ---------------------------------------------------------------------------

export function BreachWorkflowClient({ breach }: { breach: BreachInfo }) {
  // Always start with fresh state for SSR, then hydrate from localStorage
  const [state, setState] = useState<AnonymousWorkflowState>(
    () => createInitialState(breach.code)
  );
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (intentional SSR hydration pattern)
  useEffect(() => {
    const saved = loadState();
    if (saved && saved.breachCode === breach.code) {
      setState(saved); // eslint-disable-line react-hooks/set-state-in-effect -- hydrating from localStorage
    }
    setHydrated(true);
  }, [breach.code]);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (hydrated) {
      saveState(state);
    }
  }, [state, hydrated]);

  // Checklist state — also hydrates after mount
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    CHECKLIST_ITEMS.map(() => false)
  );

  useEffect(() => {
    if (hydrated && state.checklistCompleted) {
      setCheckedItems(CHECKLIST_ITEMS.map(() => true)); // eslint-disable-line react-hooks/set-state-in-effect -- sync from hydrated localStorage
    }
  }, [hydrated, state.checklistCompleted]);

  // Ref for scrolling stepper into view
  const stepperRef = useRef<HTMLDivElement>(null);

  // Issue modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueModalBureau, setIssueModalBureau] = useState<Bureau>("equifax");

  // Bureau navigation modal state
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [navModalBureau, setNavModalBureau] = useState<Bureau>("equifax");

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const currentStep = state.currentStep;
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const allChecked = checkedItems.every(Boolean);

  // Flash tab title when user is on a bureau step
  const isOnBureauStep = ["equifax", "transunion", "experian"].includes(currentStep);
  useTabTitleFlash(isOnBureauStep);

  function isBureauFrozen(bureau: Bureau): boolean {
    const key = getBureauCompletedKey(bureau);
    return state[key];
  }

  function navigateStep(step: WorkflowStep) {
    setState((prev) => ({ ...prev, currentStep: step }));
    scrollToStepper();
  }

  function scrollToStepper() {
    setTimeout(() => {
      stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  function handleChecklistComplete() {
    setState((prev) => ({
      ...prev,
      checklistCompleted: true,
      currentStep: "equifax",
    }));
    toast.success("Checklist complete! Let's start with Equifax.", { duration: 2000 });
    scrollToStepper();
  }

  function markBureauFrozen(bureau: Bureau) {
    const key = getBureauCompletedKey(bureau);
    const next = getNextStep(currentStep);

    setState((prev) => ({
      ...prev,
      [key]: true,
      currentStep: next,
      completedAt: next === "complete" ? new Date().toISOString() : prev.completedAt,
    }));
    toast.success(`${BUREAU_INFO[bureau].name} credit freeze confirmed!`, { duration: 2000 });
    scrollToStepper();

    // Track anonymous freeze event server-side (fire-and-forget)
    fetch("/api/breach-freeze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        breach_code: breach.code,
        bureau,
        session_id: getSessionId(),
      }),
    }).catch(() => {});
  }

  function handleIssueSkip(issueType: IssueType, details: string) {
    const next = getNextStep(currentStep);
    setState((prev) => ({
      ...prev,
      currentStep: next,
      completedAt: next === "complete" ? new Date().toISOString() : prev.completedAt,
    }));
    toast.info(
      `Skipped ${BUREAU_INFO[issueModalBureau].name}. You can come back later.`,
      { duration: 2000 }
    );
    setIssueModalOpen(false);
    scrollToStepper();

    // Track anonymous issue server-side (fire-and-forget)
    fetch("/api/freeze-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bureau: issueModalBureau,
        issue_type: issueType,
        issue_details: details || null,
        session_id: getSessionId(),
        source: `breach:${breach.code}`,
      }),
    }).catch(() => {});
  }

  // ---------------------------------------------------------------------------
  // Step completion helpers
  // ---------------------------------------------------------------------------

  function isStepCompleted(stepKey: WorkflowStep): boolean {
    if (stepKey === "checklist") return allChecked || state.checklistCompleted;
    if (stepKey === "complete") {
      return isBureauFrozen("equifax") && isBureauFrozen("transunion") && isBureauFrozen("experian");
    }
    return isBureauFrozen(stepKey as Bureau);
  }

  function isStepSkipped(stepKey: WorkflowStep): boolean {
    if (stepKey === "checklist" || stepKey === "complete") return false;
    const bureau = stepKey as Bureau;
    const idx = STEPS.findIndex((s) => s.key === stepKey);
    if (idx >= stepIndex) return false;
    return !isBureauFrozen(bureau);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-4">
      <BreachHero
        breach={breach}
        collapsible={currentStep !== "checklist"}
        onContinue={currentStep === "checklist" ? () => stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) : undefined}
      />
      <div ref={stepperRef} className="scroll-mt-16">
        <StepperHeader
          currentStep={currentStep}
          isStepCompleted={isStepCompleted}
          isStepSkipped={isStepSkipped}
          onStepClick={navigateStep}
        />
      </div>

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
        />
      )}
      {currentStep === "equifax" && (
        <BureauStep
          bureau="equifax"
          frozen={isBureauFrozen("equifax")}
          onConfirmFreeze={markBureauFrozen}
          onReportIssue={(b) => { setIssueModalBureau(b); setIssueModalOpen(true); }}
          onOpenNavModal={(b) => { setNavModalBureau(b); setNavModalOpen(true); }}
          onBack={() => navigateStep(getPrevStep(currentStep))}
        />
      )}
      {currentStep === "transunion" && (
        <BureauStep
          bureau="transunion"
          frozen={isBureauFrozen("transunion")}
          onConfirmFreeze={markBureauFrozen}
          onReportIssue={(b) => { setIssueModalBureau(b); setIssueModalOpen(true); }}
          onOpenNavModal={(b) => { setNavModalBureau(b); setNavModalOpen(true); }}
          onBack={() => navigateStep(getPrevStep(currentStep))}
        />
      )}
      {currentStep === "experian" && (
        <BureauStep
          bureau="experian"
          frozen={isBureauFrozen("experian")}
          onConfirmFreeze={markBureauFrozen}
          onReportIssue={(b) => { setIssueModalBureau(b); setIssueModalOpen(true); }}
          onOpenNavModal={(b) => { setNavModalBureau(b); setNavModalOpen(true); }}
          onBack={() => navigateStep(getPrevStep(currentStep))}
        />
      )}
      {currentStep === "complete" && (
        <CompletionStep
          isBureauFrozen={isBureauFrozen}
          onNavigateStep={navigateStep}
          onBack={() => navigateStep(getPrevStep(currentStep))}
        >
          <BreachSignupPrompt breachCode={breach.code} breachName={breach.name} />
        </CompletionStep>
      )}

      <FreezeIssueModal
        open={issueModalOpen}
        onOpenChange={setIssueModalOpen}
        bureau={issueModalBureau}
        onSkip={handleIssueSkip}
        saving={false}
      />

      <BureauNavModal
        open={navModalOpen}
        onOpenChange={setNavModalOpen}
        bureau={navModalBureau}
      />
    </div>
  );
}
