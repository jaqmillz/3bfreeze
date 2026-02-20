import type { WorkflowStep, Bureau } from "@/lib/types";

const STORAGE_KEY = "freeze_flow_state";

export interface FreezeFlowState {
  source: "direct";
  currentStep: WorkflowStep;
  checklistCompleted: boolean;
  equifaxCompleted: boolean;
  transunionCompleted: boolean;
  experianCompleted: boolean;
  completedAt: string | null;
}

export function createInitialState(): FreezeFlowState {
  return {
    source: "direct",
    currentStep: "checklist",
    checklistCompleted: false,
    equifaxCompleted: false,
    transunionCompleted: false,
    experianCompleted: false,
    completedAt: null,
  };
}

export function loadState(): FreezeFlowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FreezeFlowState;
  } catch {
    return null;
  }
}

export function saveState(state: FreezeFlowState): void {
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
