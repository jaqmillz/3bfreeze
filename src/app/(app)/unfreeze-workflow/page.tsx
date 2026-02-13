import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnfreezeWorkflowClient } from "@/components/unfreeze-workflow-client";
import type { BureauStatus, Bureau } from "@/lib/types";

interface Props {
  searchParams: Promise<{ bureau?: string }>;
}

export default async function UnfreezeWorkflowPage({ searchParams }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const bureau = (params.bureau ?? "equifax") as Bureau;

  const { data: bureauStatuses } = await supabase
    .from("bureau_status")
    .select("*")
    .eq("user_id", user.id);

  return (
    <UnfreezeWorkflowClient
      userId={user.id}
      bureau={bureau}
      bureauStatuses={(bureauStatuses as BureauStatus[]) ?? []}
    />
  );
}
