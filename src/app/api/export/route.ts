import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (await isRateLimited(ip, "export")) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, bureauStatus, activityLog, thawReminders, workflowProgress, freezeIssues, notificationPreferences] =
    await Promise.all([
      supabase.from("users").select("id, email, first_name, last_name, created_at, updated_at").eq("id", user.id).single(),
      supabase.from("bureau_status").select("bureau, status, frozen_at, updated_at").eq("user_id", user.id),
      supabase.from("activity_log").select("action, details, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
      supabase.from("thaw_reminders").select("bureau, thaw_start_date, thaw_end_date, reason, set_at_bureau, cancelled_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("freeze_workflow_progress").select("current_step, checklist_completed, equifax_completed, transunion_completed, experian_completed, completed_at").eq("user_id", user.id).single(),
      supabase.from("freeze_issues").select("bureau, issue_type, issue_details, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("notification_preferences").select("refreeze_reminders, thaw_expiration_alerts, weekly_summary, security_alerts").eq("user_id", user.id).single(),
    ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    bureau_status: bureauStatus.data ?? [],
    activity_log: activityLog.data ?? [],
    thaw_reminders: thawReminders.data ?? [],
    workflow_progress: workflowProgress.data,
    freeze_issues: freezeIssues.data ?? [],
    notification_preferences: notificationPreferences.data,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="3bfreeze-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
