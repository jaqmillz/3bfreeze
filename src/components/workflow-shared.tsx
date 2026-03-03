"use client";

import React from "react";
import {
  ExternalLink,
  ShieldCheck,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BUREAU_INFO,
  type Bureau,
  type WorkflowStep,
} from "@/lib/types";
import {
  STEPS,
  CHECKLIST_ITEMS,
  PASSWORD_MANAGERS,
  getNextStepLabel,
  getNavModalDescription,
} from "@/lib/workflow-constants";

// ---------------------------------------------------------------------------
// StepperHeader
// ---------------------------------------------------------------------------

export function StepperHeader({
  currentStep,
  isStepCompleted,
  isStepSkipped,
  onStepClick,
}: {
  currentStep: WorkflowStep;
  isStepCompleted: (step: WorkflowStep) => boolean;
  isStepSkipped: (step: WorkflowStep) => boolean;
  onStepClick: (step: WorkflowStep) => void;
}) {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const arrowSize = 10;

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
        if (skipped) { bg = "oklch(0.705 0.213 47.604)"; fg = "#fff"; }
        else if (isCurrent) { bg = "oklch(from var(--color-primary) l c h / 0.6)"; fg = "#fff"; }
        else if (completed) { bg = "var(--color-primary)"; fg = "#fff"; }

        const clipPath = isFirst
          ? `polygon(0 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, 0 100%)`
          : isLast
          ? `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${arrowSize}px 50%)`
          : `polygon(0 0, calc(100% - ${arrowSize}px) 0, 100% 50%, calc(100% - ${arrowSize}px) 100%, 0 100%, ${arrowSize}px 50%)`;

        return (
          <button
            key={step.key}
            onClick={() => onStepClick(step.key)}
            className="flex h-9 flex-1 items-center justify-center text-xs font-medium transition-all cursor-pointer"
            style={{
              clipPath,
              backgroundColor: bg,
              color: fg,
              marginLeft: isFirst ? 0 : -1,
              paddingLeft: isFirst ? 0 : arrowSize,
              paddingRight: isLast ? 0 : arrowSize,
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
// NavigationFooter
// ---------------------------------------------------------------------------

export function NavigationFooter({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  saving = false,
  children,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  saving?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      {onBack ? (
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      ) : (
        <div />
      )}
      {children}
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
// CredentialTip
// ---------------------------------------------------------------------------

export function CredentialTip() {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
      <p className="text-sm text-muted-foreground">
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
// PasswordManagerTooltip (inline version used in bureau instructions)
// ---------------------------------------------------------------------------

function PasswordManagerTooltip() {
  return (
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
  );
}

// ---------------------------------------------------------------------------
// ChecklistStep
// ---------------------------------------------------------------------------

export function ChecklistStep({
  checkedItems,
  onToggle,
  onMarkAllReady,
  onComplete,
  saving = false,
}: {
  checkedItems: boolean[];
  onToggle: (index: number) => void;
  onMarkAllReady: () => void;
  onComplete: () => void;
  saving?: boolean;
}) {
  const allChecked = checkedItems.every(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Before you start</h2>
        <p className="mt-1 text-base text-muted-foreground">
          We&apos;ll walk you through freezing your credit at each bureau. Have these ready &mdash; it takes about 5 minutes per bureau.
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
              onCheckedChange={() => onToggle(idx)}
            />
            <span className="text-base">{item}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        {!allChecked ? (
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={onMarkAllReady}
          >
            Mark all as ready
          </button>
        ) : (
          <div />
        )}
        <Button size="sm" onClick={onComplete} disabled={!allChecked || saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Continue
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BureauStep
// ---------------------------------------------------------------------------

function getBureauInstructions(
  bureau: Bureau,
  onOpenNavModal: (bureau: Bureau) => void,
) {
  const accountStep = (
    <span key="acct">
      Sign in if you already have an account, or create one. Save your login to a password manager.
      <PasswordManagerTooltip />
    </span>
  );

  const instructions: Record<Bureau, (string | React.ReactNode)[]> = {
    equifax: [
      <span key="eq-1">Go to the <button type="button" onClick={() => onOpenNavModal("equifax")} className="text-primary font-medium hover:underline">Equifax security freeze page</button> and click &quot;Place a Security Freeze.&quot;</span>,
      accountStep,
      `Enter your personal information: name, date of birth, SSN, address, and phone number.`,
      `Verify your identity via a one-time passcode sent by text or email.`,
      `Review the freeze details and click "Place a Freeze" to confirm.`,
      `Download your confirmation PDF. Equifax will also email a confirmation.`,
    ],
    transunion: [
      <span key="tu-1">Go to the <button type="button" onClick={() => onOpenNavModal("transunion")} className="text-primary font-medium hover:underline">TransUnion credit freeze page</button> and click &quot;Credit Freeze.&quot;</span>,
      accountStep,
      `Enter your personal information: name, address, date of birth, last 4 of SSN, email, and phone number.`,
      `Create a password and set a security question.`,
      `On the freeze status page, click "Add Freeze."`,
      `Review the freeze details, then click "Continue" to confirm. You should see a green "Freeze Added" confirmation.`,
    ],
    experian: [
      <span key="ex-1">Go to the <button type="button" onClick={() => onOpenNavModal("experian")} className="text-primary font-medium hover:underline">Experian security freeze center</button>.</span>,
      `Verify your phone number via text or call.`,
      accountStep,
      <span key="ex-4">Choose the free &quot;Experian CreditWorks Basic&quot; membership. Set a password, security question, and 4-digit PIN.</span>,
      `Review your pre-filled personal information and click "Submit and Continue."`,
      `On the Security Freeze page, click "Frozen" to activate your freeze.`,
    ],
  };

  return instructions[bureau];
}

export function BureauStep({
  bureau,
  frozen,
  onConfirmFreeze,
  onReportIssue,
  onOpenNavModal,
  onBack,
  saving = false,
}: {
  bureau: Bureau;
  frozen: boolean;
  onConfirmFreeze: (bureau: Bureau) => void;
  onReportIssue: (bureau: Bureau) => void;
  onOpenNavModal: (bureau: Bureau) => void;
  onBack?: () => void;
  saving?: boolean;
}) {
  const info = BUREAU_INFO[bureau];
  const instructions = getBureauInstructions(bureau, onOpenNavModal);
  const label = getNextStepLabel(bureau);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Freeze {info.name}</h2>
        {frozen && (
          <button
            onClick={() => onConfirmFreeze(bureau)}
            className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-colors shrink-0"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Frozen — Skip
          </button>
        )}
      </div>

      <ol className="space-y-2">
        {instructions.map((step, idx) => (
          <li key={idx} className="flex gap-3 rounded-lg border px-3 py-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              {idx + 1}
            </span>
            <span className="text-base leading-6">{step}</span>
          </li>
        ))}
      </ol>

      <button
        onClick={() => onOpenNavModal(bureau)}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-5 py-3 text-base font-semibold text-primary transition-all hover:bg-primary/20 active:scale-[0.98]"
      >
        Open {info.name}
        <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>

      <div className="flex flex-col items-center gap-2">
        {frozen ? (
          <Button
            size="sm"
            onClick={() => onConfirmFreeze(bureau)}
            disabled={saving}
            className="w-full"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {label}
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              onClick={() => onConfirmFreeze(bureau)}
              disabled={saving}
              className="w-full"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm Freeze {label === "Finish" ? "& Finish" : `& ${label}`}
            </Button>
            <button
              onClick={() => onReportIssue(bureau)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              I had issues
            </button>
          </>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center">{info.tip}</p>

      <NavigationFooter onBack={onBack} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompletionStep
// ---------------------------------------------------------------------------

export function CompletionStep({
  isBureauFrozen,
  onNavigateStep,
  onBack,
  children,
}: {
  isBureauFrozen: (bureau: Bureau) => boolean;
  onNavigateStep: (step: WorkflowStep) => void;
  onBack: () => void;
  children?: React.ReactNode;
}) {
  const bureaus: Bureau[] = ["equifax", "transunion", "experian"];
  const allFrozen = bureaus.every(isBureauFrozen);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {allFrozen ? "All bureaus frozen" : "Summary"}
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          {allFrozen
            ? "Your credit files are protected. Lenders can\u2019t pull your credit without you lifting the freeze."
            : "Come back anytime to freeze remaining bureaus."}
        </p>
      </div>

      <div className="space-y-2">
        {bureaus.map((bureau) =>
          isBureauFrozen(bureau) ? (
            <div
              key={bureau}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5"
            >
              <span className="text-sm font-medium">
                {BUREAU_INFO[bureau].name}
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                Frozen
              </span>
            </div>
          ) : (
            <button
              key={bureau}
              onClick={() => onNavigateStep(bureau)}
              className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer text-left"
            >
              <span className="text-sm font-medium">
                {BUREAU_INFO[bureau].name}
              </span>
              <span className="text-xs font-medium text-primary">
                Freeze now
              </span>
            </button>
          )
        )}
      </div>

      {!allFrozen && (
        <button
          onClick={() => {
            const next = bureaus.find((b) => !isBureauFrozen(b));
            if (next) onNavigateStep(next);
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Freeze remaining bureaus
        </button>
      )}

      <CredentialTip />

      {children}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BureauNavModal
// ---------------------------------------------------------------------------

export function BureauNavModal({
  open,
  onOpenChange,
  bureau,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bureau: Bureau;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>You&apos;re leaving 3Bfreeze</DialogTitle>
          <DialogDescription>
            {getNavModalDescription(bureau)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full"
            onClick={() => {
              window.open(BUREAU_INFO[bureau].freezeUrl, "_blank", "noopener,noreferrer");
              onOpenChange(false);
            }}
          >
            Open {BUREAU_INFO[bureau].name}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
