"use client";

import { useState } from "react";
import { Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BUREAU_INFO, type Bureau, type IssueType } from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Issue options & per-issue help content
// ---------------------------------------------------------------------------

const ISSUE_OPTIONS: { value: IssueType; label: string }[] = [
  { value: "account_access", label: "Can't log in or forgot password" },
  { value: "identity_verification", label: "Identity verification failed" },
  { value: "site_error", label: "Website error or outage" },
  { value: "asked_to_pay", label: "Was asked to pay" },
  { value: "confused", label: "Got confused or stuck" },
  { value: "other", label: "Other issue" },
];

function getIssueHelp(issue: IssueType, bureau: Bureau): string {
  const info = BUREAU_INFO[bureau];
  switch (issue) {
    case "account_access":
      return `Go to the ${info.name} website and look for "Forgot Username" or "Forgot Password." You can also call to reset your credentials.`;
    case "identity_verification":
      return `Try a different verification method (email vs. text). If online verification keeps failing, you can freeze by phone instead.`;
    case "site_error":
      return `The ${info.name} website may be temporarily down. Try again in a few minutes, or call to freeze by phone.`;
    case "asked_to_pay":
      return `Credit freezes are free by law. Make sure you're on the "Security Freeze" page, not a paid lock or monitoring product.`;
    case "confused":
      return `Call ${info.name} and ask to place a security freeze. A representative can walk you through it over the phone.`;
    case "other":
      return `Call ${info.name} for direct assistance with your freeze.`;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FreezeIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bureau: Bureau;
  onSkip: (issueType: IssueType, details: string) => void;
  saving: boolean;
}

export function FreezeIssueModal({
  open,
  onOpenChange,
  bureau,
  onSkip,
  saving,
}: FreezeIssueModalProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [issueDetails, setIssueDetails] = useState("");

  const info = BUREAU_INFO[bureau];

  function handleClose() {
    onOpenChange(false);
    setSelectedIssue(null);
    setIssueDetails("");
  }

  function handleSkip() {
    const issueType = selectedIssue ?? (issueDetails.trim() ? "other" : null);
    if (!issueType) return;
    onSkip(issueType, issueDetails);
    setSelectedIssue(null);
    setIssueDetails("");
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setSelectedIssue(null);
      setIssueDetails("");
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">What went wrong?</DialogTitle>
          <DialogDescription className="text-xs">
            You can skip {info.name} and come back later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {ISSUE_OPTIONS.map((option) => (
            <div key={option.value}>
              <button
                onClick={() =>
                  setSelectedIssue(
                    selectedIssue === option.value ? null : option.value
                  )
                }
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

              {selectedIssue === option.value && (
                <div className="mt-1.5 ml-7 space-y-2 rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
                  <p>{getIssueHelp(option.value, bureau)}</p>
                  <a
                    href={`tel:${info.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {info.name}: {info.phone}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="issue-details"
            className="text-xs text-muted-foreground"
          >
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
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </button>
          <Button size="sm" onClick={handleSkip} disabled={(!selectedIssue && !issueDetails.trim()) || saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Skip bureau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
