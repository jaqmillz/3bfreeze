import { BUREAU_INFO, type Bureau, type WorkflowStep } from "@/lib/types";

export const STEPS: { key: WorkflowStep; label: string }[] = [
  { key: "checklist", label: "Start" },
  { key: "equifax", label: "Equifax" },
  { key: "transunion", label: "TU" },
  { key: "experian", label: "Experian" },
  { key: "complete", label: "Done" },
];

export const CHECKLIST_ITEMS = [
  "Social Security Number (SSN)",
  "Date of birth",
  "Current mailing address",
  "Email address",
  "Phone number",
  "Government-issued ID",
  "Answers to identity verification questions",
];

export const PASSWORD_MANAGERS = [
  {
    name: "Apple Passwords",
    url: "https://support.apple.com/guide/iphone/save-and-autofill-passwords-iphf9219d8c9/ios",
  },
  {
    name: "Google Password Manager",
    url: "https://passwords.google.com",
  },
];

export function getNextStep(from: WorkflowStep): WorkflowStep {
  const idx = STEPS.findIndex((s) => s.key === from);
  return idx < STEPS.length - 1 ? STEPS[idx + 1].key : "complete";
}

export function getPrevStep(from: WorkflowStep): WorkflowStep {
  const idx = STEPS.findIndex((s) => s.key === from);
  return idx > 0 ? STEPS[idx - 1].key : "checklist";
}

export function getNextStepLabel(bureau: Bureau): string {
  const next = getNextStep(bureau);
  if (next === "complete") return "Finish";
  return `Continue to ${BUREAU_INFO[next as Bureau]?.name ?? "Next"}`;
}

export function getNavModalDescription(bureau: Bureau): string {
  const next = getNextStep(bureau);
  if (next === "complete") {
    return `After freezing ${BUREAU_INFO[bureau].name}, come back to this tab to finish up.`;
  }
  return `After freezing ${BUREAU_INFO[bureau].name}, come back to this tab — you still need to freeze ${BUREAU_INFO[next as Bureau]?.name ?? "the next bureau"}.`;
}
