import type { WorkflowStep, Bureau } from "@/lib/types";

const STORAGE_KEY = "breach_workflow_state";

export interface AnonymousWorkflowState {
  breachCode: string;
  currentStep: WorkflowStep;
  checklistCompleted: boolean;
  equifaxCompleted: boolean;
  transunionCompleted: boolean;
  experianCompleted: boolean;
  completedAt: string | null;
}

export function createInitialState(breachCode: string): AnonymousWorkflowState {
  return {
    breachCode,
    currentStep: "checklist",
    checklistCompleted: false,
    equifaxCompleted: false,
    transunionCompleted: false,
    experianCompleted: false,
    completedAt: null,
  };
}

export function loadState(): AnonymousWorkflowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AnonymousWorkflowState;
  } catch {
    return null;
  }
}

export function saveState(state: AnonymousWorkflowState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getBureauCompletedKey(
  bureau: Bureau
): "equifaxCompleted" | "transunionCompleted" | "experianCompleted" {
  return `${bureau}Completed` as
    | "equifaxCompleted"
    | "transunionCompleted"
    | "experianCompleted";
}
