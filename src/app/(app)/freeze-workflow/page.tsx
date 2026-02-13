import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FreezeWorkflowClient } from "@/components/freeze-workflow-client";
import type { FreezeWorkflowProgress, BureauStatus } from "@/lib/types";

export default async function FreezeWorkflowPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workflowProgress } = await supabase
    .from("freeze_workflow_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: bureauStatuses } = await supabase
    .from("bureau_status")
    .select("*")
    .eq("user_id", user.id);

  return (
    <FreezeWorkflowClient
      userId={user.id}
      initialProgress={workflowProgress as FreezeWorkflowProgress | null}
      initialBureauStatuses={(bureauStatuses as BureauStatus[]) ?? []}
    />
  );
}
