export type Bureau = "equifax" | "transunion" | "experian";

export interface BreachCode {
  id: string;
  code: string;
  name: string;
  description: string;
  date: string;
  records_affected: string | null;
  data_exposed: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type FreezeStatus = "frozen" | "not_frozen";

export type WorkflowStep =
  | "checklist"
  | "equifax"
  | "transunion"
  | "experian"
  | "complete";

export type IssueType =
  | "identity_verification"
  | "site_error"
  | "asked_to_pay"
  | "confused"
  | "other";

export type ActivityAction =
  | "frozen"
  | "unfrozen"
  | "thaw_scheduled"
  | "thaw_cancelled"
  | "issue_reported";

export type ActivitySource =
  | "freeze_workflow"
  | "manual_update"
  | "scheduled_thaw";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  signup_breach_code: string | null;
  signup_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface BureauStatus {
  id: string;
  user_id: string;
  bureau: Bureau;
  status: FreezeStatus;
  status_updated_at: string;
  frozen_date: string | null;
  notes: string | null;
}

export interface ThawReminder {
  id: string;
  user_id: string;
  bureau: Bureau;
  thaw_start_date: string;
  thaw_end_date: string;
  reminder_sent: boolean;
  created_at: string;
  cancelled_at: string | null;
  set_at_bureau: boolean;
}

export interface FreezeWorkflowProgress {
  id: string;
  user_id: string;
  current_step: WorkflowStep;
  checklist_completed: boolean;
  equifax_completed: boolean;
  transunion_completed: boolean;
  experian_completed: boolean;
  completed_at: string | null;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  bureau: Bureau;
  action: ActivityAction;
  source: ActivitySource;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  refreeze_reminders: boolean;
  thaw_expiration_alerts: boolean;
  weekly_summary: boolean;
  security_alerts: boolean;
}

export const BUREAU_INFO: Record<
  Bureau,
  {
    name: string;
    freezeUrl: string;
    unfreezeUrl: string;
    tip: string;
    unfreezeTip: string;
  }
> = {
  equifax: {
    name: "Equifax",
    freezeUrl:
      "https://www.equifax.com/personal/credit-report-services/credit-freeze/",
    unfreezeUrl:
      "https://www.equifax.com/personal/credit-report-services/credit-freeze/",
    tip: "Equifax may try to upsell you on monitoring services. You do not need to purchase anything. The freeze is free.",
    unfreezeTip:
      "You can temporarily lift or permanently remove your freeze. A temporary lift lets you set a date range.",
  },
  transunion: {
    name: "TransUnion",
    freezeUrl: "https://www.transunion.com/credit-freeze",
    unfreezeUrl: "https://www.transunion.com/credit-freeze",
    tip: "TransUnion may offer a paid credit lock service. Decline this — the free credit freeze provides the same protection.",
    unfreezeTip:
      "TransUnion lets you temporarily lift your freeze for a specific creditor or date range. You can refreeze anytime.",
  },
  experian: {
    name: "Experian",
    freezeUrl: "https://www.experian.com/freeze/center.html",
    unfreezeUrl: "https://www.experian.com/freeze/center.html",
    tip: "Experian will promote CreditWorks and CreditLock subscriptions. You do not need these. The security freeze is free by law.",
    unfreezeTip:
      "Experian lets you lift your freeze temporarily or permanently. You can refreeze at any time for free.",
  },
};
