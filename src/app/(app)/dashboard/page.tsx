import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [bureauStatusResult, thawRemindersResult, workflowProgressResult, profileResult] =
    await Promise.all([
      supabase
        .from("bureau_status")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("thaw_reminders")
        .select("*")
        .eq("user_id", user.id)
        .is("cancelled_at", null)
        .order("thaw_start_date", { ascending: true }),
      supabase
        .from("freeze_workflow_progress")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single(),
    ]);

  const bureauStatuses = bureauStatusResult.data ?? [];
  const thawReminders = thawRemindersResult.data ?? [];
  const workflowProgress = workflowProgressResult.data ?? null;

  // First-time users: no bureau statuses and no workflow progress → go straight to freeze workflow
  if (bureauStatuses.length === 0 && !workflowProgress) {
    redirect("/freeze-workflow");
  }

  const userName =
    profileResult.data?.first_name && profileResult.data?.last_name
      ? `${profileResult.data.first_name} ${profileResult.data.last_name}`
      : profileResult.data?.first_name ?? "there";

  return (
    <DashboardClient
      bureauStatuses={bureauStatuses}
      thawReminders={thawReminders}
      workflowProgress={workflowProgress}
      userName={userName}
    />
  );
}
